export namespace Model {
  export type Models = {
    [provider: string]: {
      [modelKey: string]: {
        label: string;
        free?: boolean;
      };
    };
  };

  export const DEFAULT_MODEL = "google/gemini-2.5-flash";

  export const GENERATE_TITLE_MODEL = "openai/gpt-4.1-mini";

  export const models = {
    openai: {
      "gpt-5-chat": {
        label: "GPT 5 Chat",
      },
      "gpt-4.1": {
        label: "GPT 4.1",
      },
      "gpt-4.1-mini": {
        label: "GPT 4.1 Mini",
        free: true,
      },
    },
    google: {
      "gemini-2.5-flash": {
        label: "Gemini 2.5 Flash",
        free: true,
      },
      "gemini-2.5-pro": {
        label: "Gemini 2.5 Pro",
      },
    },
    anthropic: {
      "claude-sonnet-4": {
        label: "Claude Sonnet 4",
      },
      "claude-3.7-sonnet": {
        label: "Claude 3.7 Sonnet",
      },
    },
  };
}
