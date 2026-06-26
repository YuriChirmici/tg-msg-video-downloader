import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const client = new TelegramClient(
  new StringSession(process.env.SESSION ?? ""),
  parseInt(process.env.API_ID),
  process.env.API_HASH,
  { connectionRetries: 5 }
);

await client.connect();

const dialogs = await client.getDialogs({ limit: 50 });
for (const dialog of dialogs) {
  console.log(`[${dialog.id}] ${dialog.title || dialog.name}`);
}

await client.disconnect();
