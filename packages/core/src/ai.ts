import { streamText, generateText, APICallError } from "ai";
import { Message } from "./messsage/message";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { Conversation } from "./conversation/conversation";
import { AppError, errorCodes } from "./error";
import { Provider } from "./provider/provider";
import { Model } from "./model";
import { env } from "./env";

export namespace AI {
  type GenerateContentInput = {
    model: string;
    conversationID: string;
    onFinish: (content: string, title: string | undefined) => void;
    onTitleGenerate: (title: string) => void;
    onError: (message: string) => void;
  };

  export async function* generateContent(input: GenerateContentInput) {
    try {
      let apiKey = await Provider.apiKey();
      let models = Model.availableModels;

      if (!apiKey) {
        const canUse = await Message.canUseFreeMessages();
        if (canUse) {
          apiKey = env.OPENROUTER_API_KEY;
          models = Model.freeModels;
        } else {
          throw new AppError(
            "rate_limit",
            errorCodes.rateLimit.RESOURCE_EXHAUSTED,
            `${Message.FREE_MESSAGES_PER_DAY} free messages used. Configure OpenRouter or wait until tomorrow.`,
          );
        }
      }

      if (!models.includes(input.model)) {
        throw new AppError(
          "validation",
          errorCodes.validation.INVALID_PARAMETERS,
          `Invalid model ${input.model}`,
        );
      }

      // TODO: use `exists` to optimize this
      const { messages } = await Message.list(input.conversationID);
      if (!messages.length) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "No messages found",
        );
      }
      if (messages.at(-1)?.role !== "user") {
        throw new AppError(
          "validation",
          errorCodes.validation.INVALID_STATE,
          "Last message should be from user",
        );
      }

      const chat = createOpenRouter({
        apiKey,
      });

      let title: string | undefined = undefined;

      if (messages.length === 1) {
        title = await generateTitle(chat, messages[0].content);
        await Conversation.update(input.conversationID, {
          title,
          status: "streaming",
        });
        input.onTitleGenerate(title);
      }

      if (!title) {
        await Conversation.update(input.conversationID, {
          status: "streaming",
        });
      }

      let streamError: unknown | null = null;
      const stream = streamText({
        model: chat(input.model),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        onError: (event) => {
          streamError = event.error;
        },
        onFinish: async (event) => {
          if (apiKey === env.OPENROUTER_API_KEY) {
            await Message.increamentFreeMessagesCount();
          }
          await Message.create({
            content: event.text,
            conversationID: input.conversationID,
            role: "assistant",
            model: input.model,
          });
          input.onFinish(event.text, title);
        },
      });

      for await (const content of stream.textStream) {
        if (streamError) {
          throw streamError;
        }
        yield {
          content,
          title,
        };
      }

      if (streamError) {
        throw streamError;
      }
    } catch (err) {
      console.error("failed to generate content", err);
      await Conversation.update(input.conversationID, {
        status: "none",
      });
      let message = "Failed to generate content";
      if (err instanceof AppError) {
        message = err.message;
      } else if (err instanceof APICallError) {
        if (err.statusCode === 401) {
          message = "OpenRouter API key is invalid";
        }
      }
      input.onError(message);
    }
  }

  // TODO: improve the system prompt
  export async function generateTitle(
    chat: OpenRouterProvider,
    content: string,
  ) {
    const res = await generateText({
      model: chat(Model.GENERATE_TITLE_MODEL),
      prompt: [
        "You are a helpful assistant that generates concise, descriptive titles for user messages.",
        "Create a short title (3-7 words) that summarizes the main idea of the message.",
        "Examples:",
        'User message: "Can you help me reset my password?"',
        "Password Reset Assistance",
        "",
        'User message: "What are the best practices for writing clean code?"',
        "Practices",
        "",
        'User message: "I need a recipe for a quick vegan dinner."',
        "Quick Vegan Dinner Recipe",
        "",
        "Now, generate a title for the following message:",
        content,
      ].join("\n"),
    });

    return res.text;
  }
}
