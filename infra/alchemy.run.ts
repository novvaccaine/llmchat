import alchemy, { secret } from "alchemy";
import { Worker, DurableObjectNamespace } from "alchemy/cloudflare";

const app = await alchemy("soonagi", {
  password: process.env.ALCHEMY_SECRET,
});

const streamDO = DurableObjectNamespace("streamDO", {
  className: "StreamDO",
  sqlite: true,
});

const worker = await Worker("stream", {
  name: "stream",
  entrypoint: "../packages/stream/src/index.ts",
  bindings: {
    STREAM_DO: streamDO,
    STREAM_URL: "https://stream.soonagi.com",
    TURSO_CONNECTION_URL: secret(process.env.TURSO_CONNECTION_URL),
    TURSO_AUTH_TOKEN: secret(process.env.TURSO_AUTH_TOKEN),
    BETTER_AUTH_SECRET: secret(process.env.BETTER_AUTH_SECRET),
    GOOGLE_CLIENT_ID: secret(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: secret(process.env.GOOGLE_CLIENT_SECRET),
  },
  compatibility: "node",
  domains: [
    {
      domainName: "stream.soonagi.com",
      zoneId: "725001bf91238e65a0891223b4ad2447",
      adopt: true,
    },
  ],
});

console.log(`stream worker deployed at: ${worker.url}`);
await app.finalize();
