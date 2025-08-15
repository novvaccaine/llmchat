import { OpenAI } from "@/icons/OpenAI";
import { Anthropic } from "@/icons/Anthropic";
import { Gemini } from "@/icons/Gemini";
import { useUIStore } from "@/stores/uiStore";
import * as Select from "@radix-ui/react-select";
import { Model } from "@soonagi/core/model";
import { ChevronDown as DownIcon, Check as CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouteContext } from "@tanstack/react-router";

export function ModelPicker() {
  const user = useRouteContext({ from: "__root__" }).user;
  let options = Model.modelOptions();
  options = user?.apiKey ? options : options.filter((opt) => opt.free);

  const model = useUIStore().selectedModel;
  const selectModel = useUIStore().selectModel;
  const [open, setOpen] = useState(false);
  const modelLabel = options.find((option) => option.value === model)?.label;

  return (
    <Select.Root
      value={model}
      onValueChange={selectModel}
      open={open}
      onOpenChange={setOpen}
    >
      <Select.Trigger className="flex gap-2 items-center hover:bg-muted/10 px-2 py-1 rounded-md focus:outline-none">
        <span>{modelLabel}</span>
        <Select.Icon
          className={cn({
            "rotate-180": open,
          })}
        >
          <DownIcon size={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          className="bg-sidebar border border-border p-3 px-2 rounded-md flex flex-col gap-2"
        >
          {options.map((option) => {
            return (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg cursor-pointer"
              >
                <Select.ItemText>
                  <p className="flex items-center gap-2.5">
                    {option.value.startsWith("openai") ? (
                      <OpenAI />
                    ) : option.value.startsWith("anthropic") ? (
                      <Anthropic />
                    ) : option.value.startsWith("google") ? (
                      <Gemini />
                    ) : null}
                    <span>{option.label}</span>
                  </p>
                </Select.ItemText>
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
