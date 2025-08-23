import type { Message as TMessage } from "@soonagi/core/messsage/message";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/Markdown";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ChevronRight as RightIcon,
  Brain as ReasoningIcon,
  Layers as StepsIcon,
  Globe as WebIcon,
  Search as SearchIcon,
  ArrowUpRight as OpenIcon,
  Hammer as ToolIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { LoadingIcon } from "@/icons/LoadingIcon";

type Props = {
  role: TMessage.Entity["role"];
  content: TMessage.Entity["content"];
};

export function Message(props: Props) {
  const { role, content } = props;
  const [open, setOpen] = useState("steps");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content.steps]);

  return (
    <div
      className={cn({
        "max-w-full self-end border border-border rounded-md bg-bg-2 p-2":
          role === "user",
      })}
    >
      {content.steps && (
        <Accordion.Root
          type="single"
          className="mb-5"
          collapsible
          value={open}
          onValueChange={setOpen}
        >
          <Accordion.Item value="steps">
            <Accordion.Trigger className="group border border-border rounded-xl pl-4 pr-2 py-2 data-[state=open]:border-b-0 data-[state=open]:rounded-b-none flex items-center justify-between w-full focus:outline-none">
              <div className="flex items-center gap-2.5">
                <StepsIcon size={16} />
                <p>Steps</p>
              </div>
              <div
                className="flex items-center p-1.5 rounded-md hover:bg-bg-2"
                role="button"
              >
                <RightIcon
                  size={17}
                  className="transition-transform group-data-[state=open]:rotate-90"
                />
              </div>
            </Accordion.Trigger>
            <Accordion.Content
              ref={containerRef}
              className="border border-border border-t-0 rounded-b-md px-4 py-2 w-full max-h-[450px] overflow-auto flex flex-col"
            >
              {content.steps.map((s, i) => {
                const isLast = i === content.steps!.length - 1;
                return (
                  <div key={s.id} className="relative pb-5">
                    {!isLast && (
                      <div className="absolute left-[7.5px] top-5 w-px h-[calc(100%-16px)] bg-border" />
                    )}
                    <div>
                      {s.type === "reasoning" && (
                        <Reasoning text={s.data.text} />
                      )}
                      {s.type === "tool" && <Tool tool={s.data as any} />}
                    </div>
                  </div>
                );
              })}
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}

      <Markdown className="prose prose-soonagi max-w-none">
        {content.text}
      </Markdown>
    </div>
  );
}

type ReasoningProps = {
  text: string;
};

function Reasoning(props: ReasoningProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <ReasoningIcon size={16} />
        <p>Reasoning</p>
      </div>
      <Markdown className="prose prose-soonagi max-w-none ml-[29px] mt-1.5">
        {props.text}
      </Markdown>
    </div>
  );
}

type ToolProps = {
  tool: {
    name: string;
    input: any;
    output: any;
  };
};

function Tool(props: ToolProps) {
  const { tool } = props;

  return (
    <div>
      <div className="flex items-center gap-2.5">
        {!("output" in tool) ? (
          <LoadingIcon className="text-white/40 fill-white" />
        ) : (
          <>
            {tool.name === "webSearch" ? (
              <WebIcon size={16} />
            ) : (
              <ToolIcon size={16} />
            )}
          </>
        )}
        <p>{tool.name === "webSearch" ? "Web Search" : "Scrape Content"}</p>
      </div>
      <div className="ml-[29px] mt-1.5">
        <p className="inline-flex items-center gap-2 py-1 px-2 rounded-md bg-bg-2">
          <SearchIcon size={16} />
          <span className="truncate">
            {props.tool.input.query ?? props.tool.input.url}
          </span>
        </p>
        {Array.isArray(tool.output) && (
          <div className="flex flex-col gap-3 mt-4 max-h-[250px] overflow-auto pr-1.5">
            {tool.output.map((item) => {
              return (
                <a
                  target="_blank"
                  href={item.url}
                  className="flex flex-col rounded-md py-1 px-2 bg-sidebar relative"
                >
                  <p className="text-muted text-sm">{new URL(item.url).host}</p>
                  <p className="truncate">{item.title}</p>
                  <p className="text-muted text-sm mt-0.5 truncate">
                    {item.description}
                  </p>
                  <OpenIcon
                    className="absolute top-2 right-2 text-muted"
                    size={16}
                  />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
