import { os } from "@orpc/server";
import { Provider } from "@soonagi/core/provider/provider";
import z from "zod";
import { OKOutput } from "@/orpc/output";

export const provider = {
  list: os.output(z.array(Provider.Entity)).handler(() => {
    return Provider.list();
  }),

  create: os
    .input(Provider.Entity)
    .output(OKOutput)
    .handler(async ({ input }) => {
      await Provider.create(input);
      return { message: "ok" };
    }),
};
