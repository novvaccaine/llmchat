import { streamText, generateText } from "ai";
import { Message } from "./messsage/message";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Conversation } from "./conversation/conversation";
import { env } from "./env";

// TODO: use the user provided api key, cache in KV for quick lookup
// daily 25 free messages for each user, use system api key if not configured
export namespace AI {
  type GenerateContentInput = {
    model: string;
    conversationID: string;
    onFinish: (content: string, title: string | undefined) => void;
    onTitleGenerate: (title: string) => void;
  };

  const GENERATE_TITLE_MODEL = "openai/gpt-4.1-mini";

  export async function* generateContent(input: GenerateContentInput) {
    const { messages } = await Message.list(input.conversationID);
    if (!messages.length) {
      throw new Error("should contain atleast 1 message");
    }
    if (messages.at(-1)?.role !== "user") {
      throw new Error("last message should come from user");
    }

    let title: string | undefined = undefined;
    if (messages.length === 1) {
      title = await generateTitle(messages[0].content);
      await Conversation.update(input.conversationID, {
        title,
        status: "streaming",
      });
      input.onTitleGenerate(title);
    }

    if (!title) {
      await Conversation.update(input.conversationID, { status: "streaming" });
    }

    const chat = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });

    const stream = streamText({
      model: chat(input.model),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      onError: (event) => {
        console.error("failed to generate content", event.error);
      },
      onFinish: async (event) => {
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
      yield {
        content,
        title,
      };
    }
  }

  export async function generateTitle(content: string) {
    const chat = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });

    const res = await generateText({
      model: chat(GENERATE_TITLE_MODEL),
      prompt: [
        "Given the following user message, generate a short, descriptive title:",
        content,
      ].join("\n"),
    });

    return res.text;
  }
}
