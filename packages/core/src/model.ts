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
      "gpt-5-mini": {
        label: "GPT 5 Mini",
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

  export const freeModels = modelOptions()
    .filter((opt) => opt.free)
    .map((opt) => opt.value);

  export const availableModels = modelOptions().map((opt) => opt.value);

  type Option = {
    label: string;
    value: string;
    free?: boolean;
  };

  export function modelOptions() {
    const options: Option[] = [];

    for (const provider in models) {
      const providerModels = (models as Models)[provider];
      for (const modelKey in providerModels) {
        const model = providerModels[modelKey];
        options.push({
          label: model.label,
          value: `${provider}/${modelKey}`,
          free: model.free,
        });
      }
    }

    return options;
  }
}
