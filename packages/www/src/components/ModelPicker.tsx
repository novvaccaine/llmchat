import { useUIStore } from "@/stores/uiStore";
import * as Select from "@radix-ui/react-select";
import { Model } from "@soonagi/core/model";
import { ChevronDown as DownIcon, Check as CheckIcon } from "lucide-react";

export function ModelPicker() {
  const options = modelOptions(Model.models);
  const model = useUIStore().selectedModel;
  const selectModel = useUIStore().selectModel;

  return (
    <Select.Root value={model} onValueChange={selectModel}>
      <Select.Trigger className="flex gap-2 items-center hover:bg-muted/10 px-2 py-1 rounded-md focus:outline-none">
        <Select.Value placeholder="Select model" />
        <Select.Icon>
          <DownIcon size={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          className="bg-sidebar p-3 px-2 rounded-md flex flex-col gap-2"
        >
          {options.map((option) => {
            return (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg cursor-pointer"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function modelOptions(
  models: Model.Models,
): { label: string; value: string }[] {
  const options: Option[] = [];

  for (const provider in models) {
    const providerModels = models[provider];
    for (const modelKey in providerModels) {
      const model = providerModels[modelKey];
      options.push({
        label: model.label,
        value: `${provider}/${modelKey}`,
      });
    }
  }

  return options;
}

type Option = {
  label: string;
  value: string;
};
