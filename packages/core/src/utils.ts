import { env } from "./env";
import { AppError, errorCodes } from "./error";

export function getTodayDateUTC() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = now.getUTCDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

export async function triggerStream(
  userID: string,
  conversationID: string,
  model: string,
  webSearch: boolean,
) {
  const url = env.STREAM_URL + "/api/stream";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": env.SVC_API_KEY,
    },
    body: JSON.stringify({ userID, conversationID, model, webSearch }),
  });

  if (!res.ok) {
    console.error("stream: received status code:", res.status);
    throw new AppError(
      "internal",
      errorCodes.internal.DEPENDENCY_FAILURE,
      "Stream failure",
    );
  }

  return res.json();
}
