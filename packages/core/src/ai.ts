import { streamText, generateText, APICallError, tool, stepCountIs } from "ai";
import { Message } from "./messsage/message";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { Conversation } from "./conversation/conversation";
import { AppError, errorCodes } from "./error";
import { Provider } from "./provider/provider";
import { Model } from "./model";
import { env } from "./env";
import z from "zod";

export namespace AI {
  type GenerateContentInput = {
    model: string;
    conversationID: string;
    onFinish: () => void;
    onTitleGenerate: (title: string) => void;
    onError: (message: string) => void;
    webSearch: boolean;
  };

  export async function* generateContent(input: GenerateContentInput) {
    let streamingContent: { title?: string; content: Message.Content };

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
        title = await generateTitle(chat, messages[0].content.text);
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
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content.text,
        })),
        tools: input.webSearch ? tools : {},
        stopWhen: stepCountIs(5),
        onError: (event) => {
          streamError = event.error;
        },
        onFinish: async () => {
          if (apiKey === env.OPENROUTER_API_KEY) {
            await Message.increamentFreeMessagesCount();
          }
          await Message.create({
            content: streamingContent.content,
            conversationID: input.conversationID,
            role: "assistant",
            model: input.model,
            webSearch: input.webSearch,
          });
          input.onFinish();
        },
      });

      streamingContent = {
        title,
        content: {
          text: "",
        },
      };

      for await (const part of stream.fullStream) {
        if (streamError) {
          throw streamError;
        }

        if (
          part.type === "reasoning-delta" ||
          part.type === "tool-call" ||
          part.type === "tool-result"
        ) {
          if (!streamingContent.content.steps) {
            streamingContent.content.steps = [];
          }
        }

        switch (part.type) {
          case "text-delta": {
            streamingContent.content.text += part.text;
            break;
          }

          case "reasoning-delta": {
            const index = streamingContent.content.steps!.findIndex(
              (s) => s.type === "reasoning" && s.id === part.id,
            );

            if (index === -1) {
              streamingContent.content.steps!.push({
                id: part.id,
                type: "reasoning",
                data: {
                  text: part.text,
                },
              });
            } else {
              streamingContent.content.steps =
                streamingContent.content.steps!.map((s) =>
                  s.type === "reasoning" && s.id === part.id
                    ? {
                        ...s,
                        data: { ...s.data, text: s.data.text + part.text },
                      }
                    : s,
                );
            }

            break;
          }

          case "tool-call": {
            streamingContent.content.steps!.push({
              data: {
                name: part.toolName,
                input: part.input,
              },
              id: part.toolCallId,
              type: "tool",
            });
            break;
          }

          case "tool-result": {
            const index = streamingContent.content.steps!.findIndex(
              (s) => s.type === "tool" && s.id === part.toolCallId,
            );
            if (index === -1) {
              console.error("missing tool", part.toolCallId);
              break;
            }
            streamingContent.content.steps![index].data.output =
              part.toolName === "webSearch" ? part.output : {};
          }
        }

        yield streamingContent;
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

  export async function generateTitle(
    chat: OpenRouterProvider,
    content: string,
  ) {
    const res = await generateText({
      model: chat(Model.GENERATE_TITLE_MODEL),
      system: [
        "You are a helpful assistant that generates concise, descriptive titles for user messages.",
        "Create a short title (3-7 words) that summarizes the main idea of the message.",
        "Examples:",
        'User message: "Can you help me reset my password?"',
        "Password Reset Assistance",
        "",
        'User message: "What are the best practices for writing clean code?"',
        "Clean Code Practices",
        "",
        'User message: "I need a recipe for a quick vegan dinner."',
        "Quick Vegan Dinner Recipe",
        "",
      ].join("\n"),
      prompt: ["Generate a title for the following message:", content].join(
        "\n",
      ),
    });

    return res.text;
  }

  // tools

  const WebSearchResults = z.object({
    data: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        description: z.string(),
        date: z.string().optional(),
      }),
    ),
  });

  const tools = {
    webSearch: tool({
      description: "Search the web for up-to-date information",
      inputSchema: z.object({
        query: z.string().min(1).max(100).describe("The search query"),
      }),
      execute: async ({ query }) => {
        const url = `https://s.jina.ai/?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: {
            accept: "application/json",
            "X-Respond-With": "no-content",
            Authorization: `Bearer ${env.JINA_API_KEY}`,
          },
        });
        if (!res.ok) {
          return { error: `received status code: ${res.status}` };
        }
        const data = await res.json();
        const result = WebSearchResults.safeParse(data);
        if (!result.success) {
          console.error(
            "validation failed for web search results",
            z.prettifyError(result.error),
          );
          return { error: "failed to perform web search" };
        }
        return result.data.data;
      },
    }),

    scrapeContent: tool({
      description: [
        "Scrapes the textual content from a given URL.",
        "Use this tool when a web search result provides a promising URL",
        "but the description is not detailed enough to answer the user's question.",
      ].join("\n"),
      inputSchema: z.object({
        url: z.url().describe("The URL to scrape content from"),
      }),
      execute: async ({ url }) => {
        const readerURL = `https://r.jina.ai/${url}`;
        const res = await fetch(readerURL, {
          headers: {
            Authorization: `Bearer ${env.JINA_API_KEY}`,
          },
        });
        if (!res.ok) {
          return { error: `received status code: ${res.status}` };
        }
        const content = await res.text();
        return content;
      },
    }),
  };

  // ---
}
