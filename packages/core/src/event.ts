export namespace Event {
  type ContentData = {
    conversationID: string;
    content: string;
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
      conversationID: string
      title: string
    };
  };

  export type Event = GeneratingContent | GeneratedContent | GeneratedTitle
}
