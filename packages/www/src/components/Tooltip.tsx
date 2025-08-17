import * as RTooltip from "@radix-ui/react-tooltip";

type Props = {
  children: React.ReactNode;
  content: string;
};

export function Tooltip(props: Props) {
  return (
    <RTooltip.Provider>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{props.children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            className="bg-bg px-2 py-1 rounded-md border border-border max-w-[320px]"
            side="bottom"
          >
            {props.content}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}
