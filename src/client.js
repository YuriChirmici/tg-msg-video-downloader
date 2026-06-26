import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import fs from "fs";

export async function createClient() {
  const apiId = parseInt(process.env.API_ID);
  const apiHash = process.env.API_HASH;

  if (!apiId || !apiHash) {
    console.error("Укажи API_ID и API_HASH в .env файле");
    process.exit(1);
  }

  const client = new TelegramClient(
    new StringSession(process.env.SESSION ?? ""),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: () => input.text("Номер телефона: "),
    password: () => input.text("Пароль 2FA (если есть): "),
    phoneCode: () => input.text("Код из Telegram: "),
    onError: (err) => console.error(err),
  });

  const session = client.session.save();
  if (session !== process.env.SESSION) {
    const envPath = "./.env";
    let env = fs.readFileSync(envPath, "utf-8");
    if (env.includes("SESSION=")) {
      env = env.replace(/^SESSION=.*$/m, `SESSION=${session}`);
    } else {
      env += `\nSESSION=${session}`;
    }
    fs.writeFileSync(envPath, env);
    console.log("Сессия сохранена в .env:", session);
  }

  console.log("Авторизация успешна. Слушаю исходящие сообщения...");
  return client;
}
