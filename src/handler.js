import fs from "fs";
import { downloadVideo } from "./downloader.js";

const YOUTUBE_REGEX =
  /https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+[^\s]*/;

const OUTGOING_CHAT_IDS = new Set(process.env.OUTGOING_CHAT_IDS?.split(",").filter(Boolean) ?? []);
const INCOMING_CHAT_IDS = new Set(process.env.INCOMING_CHAT_IDS?.split(",").filter(Boolean) ?? []);

const HANDLE_OUTGOING = process.env.HANDLE_OUTGOING === "true";
const HANDLE_INCOMING = process.env.HANDLE_INCOMING === "true";

async function sendVideo(client, peerId, videoPath, replyTo) {
//   const { duration, width, height } = await getVideoMeta(videoPath);
  await client.sendFile(peerId, {
    file: videoPath,
    caption: "",
    supportsStreaming: true,
    replyTo,
    // attributes: [
    //   new (await import("telegram")).Api.DocumentAttributeVideo({
    //     duration,
    //     w: width,
    //     h: height,
    //     supportsStreaming: true,
    //   }),
    // ],
  });
}

export async function handleMessage(client, myId, update) {
  const msg = update.message;
  if (!msg?.message) return;

  const chatId = msg.peerId?.userId?.toString() ?? msg.peerId?.channelId?.toString();

  const isSavedMessages = chatId === myId;
  const isOutgoing = msg.out || isSavedMessages;

  if (isOutgoing && !HANDLE_OUTGOING) return;
  if (isOutgoing && OUTGOING_CHAT_IDS.size > 0 && !OUTGOING_CHAT_IDS.has(chatId)) return;

  if (!isOutgoing && !HANDLE_INCOMING) return;
  if (!isOutgoing && INCOMING_CHAT_IDS.size === 0) return;
  if (!isOutgoing && !INCOMING_CHAT_IDS.has(chatId)) return;

  const match = msg.message.match(YOUTUBE_REGEX);
  if (!match) return;

  const url = match[0];
  console.log(msg.message.trim());
  console.log(url);
  if (msg.message.trim() !== url) return;

  console.log("Найдена ссылка:", url);

  let videoPath;
  try {
    videoPath = await downloadVideo(url);
  } catch (err) {
    console.error("Ошибка скачивания:", err.message);
    return;
  }

  try {
    if (isOutgoing) {
      await sendVideo(client, msg.peerId, videoPath, msg.replyTo?.replyToMsgId);
      console.log("Видео отправлено");
      await client.deleteMessages(msg.peerId, [msg.id], { revoke: true });
      console.log("Сообщение удалено");
    } else {
      await sendVideo(client, msg.peerId, videoPath, msg.id);
      console.log("Видео отправлено в ответ");
    }
  } catch (err) {
    console.error("Ошибка отправки:", err.message);
  } finally {
    fs.unlink(videoPath, () => {});
  }
}
