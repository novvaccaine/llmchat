import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import { env } from "./env";

export const storage = createStorage({
  driver: redisDriver({
    base: "unstorage",
    url: env.REDIS_URL,
  }),
});
