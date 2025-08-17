import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Model } from "@soonagi/core/model";
import { RefreshCcw as RetryIcon } from "lucide-react";
import { OpenAI } from "@/icons/OpenAI";
import { Anthropic } from "@/icons/Anthropic";
import { Gemini } from "@/icons/Gemini";
import { Tooltip } from "@/components/Tooltip";
import { useRetryMessage } from "@/query/message";
import { toast } from "sonner";
import { useConversationStore } from "@/stores/conversationStore";
import { useRouteContext } from "@tanstack/react-router";
import { useUIStore } from "@/stores/uiStore";

type Props = {
  conversationID: string;
  messageID: string;
};

export function RetryMessage(props: Props) {
  const { messageID, conversationID } = props;

  const user = useRouteContext({ from: "__root__" }).user;
  let options = Model.modelOptions();
  options = user?.apiKey ? options : options.filter((opt) => opt.free);

  const { mutateAsync: retryMutate } = useRetryMessage();
  const requestGenerateContent = useConversationStore().requestGenerateContent;

  const selectModel = useUIStore().selectModel;

  async function retry(model?: string) {
    try {
      await retryMutate({
        conversationID,
        messageID,
        model,
      });
      requestGenerateContent(conversationID);
      if (model) {
        selectModel(model);
      }
    } catch (err) {
      console.error("failed to retry message", err);
      toast.error("Failed to retry message");
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <Tooltip content="Retry Message">
            <button className="flex items-center p-1.5 rounded-md hover:bg-bg-2">
              <RetryIcon size={16} />
            </button>
          </Tooltip>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-bg border border-border p-3 px-2 rounded-md flex flex-col gap-2">
          <DropdownMenu.Item
            className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg-2 cursor-pointer"
            onClick={() => {
              retry();
            }}
          >
            <RetryIcon className="stroke-brand" size={16} />
            <span>Retry Same</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="m-1 h-px bg-border" />
          {options.map((option) => {
            return (
              <DropdownMenu.Item
                key={option.value}
                className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg-2 cursor-pointer"
                onClick={() => {
                  retry(option.value);
                }}
              >
                <span>
                  {option.value.startsWith("openai") ? (
                    <OpenAI />
                  ) : option.value.startsWith("anthropic") ? (
                    <Anthropic />
                  ) : option.value.startsWith("google") ? (
                    <Gemini />
                  ) : null}
                </span>
                <span>{option.label}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
