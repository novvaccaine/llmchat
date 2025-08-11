import z from "zod";

export const OKOutput = z.object({ message: z.literal("ok") });
