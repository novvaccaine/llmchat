export namespace Event {
  type ContentData = {
    conversationID: string;
    content: string;
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

  export type GeneratedTitle = {
    type: "generated_title";
    data: {
      conversationID: string;
      title: string;
    };
  };

  export type ErrorGeneratingContent = {
    type: "error_generating_content";
    data: {
      conversationID: string;
    };
  };

  export type Event =
    | GeneratingContent
    | GeneratedContent
    | GeneratedTitle
    | ErrorGeneratingContent;

  export type EventData<T extends Event["type"]> = Extract<
    Event,
    { type: T }
  >["data"];
}
