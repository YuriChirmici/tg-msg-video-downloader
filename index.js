import "dotenv/config";
import { NewMessage } from "telegram/events/index.js";

import { createClient } from "./src/client.js";
import { handleMessage } from "./src/handler.js";

const client = await createClient();
const me = await client.getMe();
const myId = me.id.toString();

client.addEventHandler(
  (update) => handleMessage(client, myId, update),
  new NewMessage({})
);

await new Promise(() => {});
