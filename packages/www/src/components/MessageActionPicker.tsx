import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Model } from "@soonagi/core/model";
import { RefreshCcw as RetryIcon, Split as BranchOffIcon } from "lucide-react";
import { OpenAI } from "@/icons/OpenAI";
import { Anthropic } from "@/icons/Anthropic";
import { Gemini } from "@/icons/Gemini";
import { Tooltip } from "@/components/Tooltip";
import { useRetryMessage } from "@/query/message";
import { toast } from "sonner";
import { useConversationStore } from "@/stores/conversationStore";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useUIStore } from "@/stores/uiStore";
import { useBranchOff } from "@/query/conversation";
import { Message } from "@soonagi/core/messsage/message";

type Props = {
  conversationID: string;
  messageID: string;
  messageRole: Message.Entity["role"];
  action: "retry" | "branchOff";
};

export function MessageActionPicker(props: Props) {
  const { messageID, messageRole, conversationID, action } = props;
  const navigate = useNavigate();

  const requestGenerateContent = useConversationStore().requestGenerateContent;
  const selectModel = useUIStore().selectModel;

  const user = useRouteContext({ from: "__root__" }).user;
  let options = Model.modelOptions();
  options = user?.apiKey ? options : options.filter((opt) => opt.free);

  const { mutateAsync: retryMutate } = useRetryMessage();
  const { mutateAsync: branchOff } = useBranchOff();

  async function onSelect(model?: string) {
    try {
      let newConversationID: string | null = null;
      if (action === "retry") {
        await retryMutate({
          conversationID,
          messageID,
          model,
        });
      } else {
        const { conversationID: cID } = await branchOff({
          conversationID,
          messageID,
          model,
        });
        newConversationID = cID;
      }

      if (model) {
        selectModel(model);
      }

      if (newConversationID && action === "branchOff") {
        if (messageRole === "user") {
          requestGenerateContent(newConversationID);
        }
        navigate({
          to: "/conversation/$conversationID",
          params: { conversationID: newConversationID },
        });
      } else if (action === "retry") {
        requestGenerateContent(conversationID);
      }
    } catch (err) {
      const message = action == "retry" ? "retry message" : "branch off";
      console.error(`failed to ${message}`, err);
      toast.error(`Failed to ${message}`);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <Tooltip
            content={action === "retry" ? "Retry Message" : "Branch off"}
          >
            <button className="flex items-center p-1.5 rounded-md hover:bg-bg-2">
              {action === "retry" ? (
                <RetryIcon size={16} />
              ) : (
                <BranchOffIcon size={16} />
              )}
            </button>
          </Tooltip>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-bg border border-border p-3 px-2 rounded-md flex flex-col gap-2">
          <DropdownMenu.Item
            className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg-2 cursor-pointer"
            onClick={() => {
              onSelect();
            }}
          >
            {action === "retry" && (
              <>
                <RetryIcon className="stroke-brand" size={16} />
                <span>Retry Same</span>
              </>
            )}
            {action === "branchOff" && (
              <>
                <BranchOffIcon className="stroke-brand" size={16} />
                <span>Branch off</span>
              </>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator asChild>
            <div className="flex items-center mt-1 mb-1.5">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-2">or switch model</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
          </DropdownMenu.Separator>

          {options.map((option) => {
            return (
              <DropdownMenu.Item
                key={option.value}
                className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg-2 cursor-pointer"
                onClick={() => {
                  onSelect(option.value);
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
