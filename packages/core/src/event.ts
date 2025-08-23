import { Message } from "./messsage/message";

export namespace Event {
  type ContentData = {
    conversationID: string;
    content: Message.Content;
    title?: string;
  };

  export type GeneratingContent = {
    type: "generating_content";
    data: ContentData;
  };

  export type GeneratedContent = {
    type: "generated_content";
    data: ContentData;
  };

  export type ErrorGeneratingContent = {
    type: "error_generating_content";
    data: {
      conversationID: string;
      message: string;
    };
  };

  export type Event =
    | GeneratingContent
    | GeneratedContent
    | ErrorGeneratingContent;

  export type EventData<T extends Event["type"]> = Extract<
    Event,
    { type: T }
  >["data"];
}
