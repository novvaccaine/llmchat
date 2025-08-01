import { createContext } from "./context";

export namespace Actor {
  export type User = {
    type: "user";
    properties: {
      userID: string;
    };
  };

  export type Public = {
    type: "public";
    properties: {};
  };

  export type Info = User | Public;

  const context = createContext<Info>();

  export function userID() {
    const actor = context.use();
    if (!("userID" in actor.properties)) {
      throw new Error("no userID found");
    }
    return actor.properties.userID;
  }

  export function provide<
    T extends Info["type"],
    Next extends (...args: any) => any,
  >(type: T, properties: Extract<Info, { type: T }>["properties"], fn: Next) {
    return context.provide({ type, properties } as any, fn);
  }
}
