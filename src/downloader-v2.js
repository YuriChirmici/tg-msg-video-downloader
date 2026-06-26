import ytDlp from "youtube-dl-exec";
import path from "path";
import os from "os";
import fs from "fs";

export async function downloadVideo(url, retries = 2) {
  const baseName = `yt_${Date.now()}`;
  const outputTemplate = path.join(os.tmpdir(), `${baseName}.%(ext)s`);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await ytDlp(url, {
        output: outputTemplate,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        mergeOutputFormat: "mp4",
        postprocessorArgs: "ffmpeg:-c:a aac",
        ffmpegLocation: process.env.FFMPEG_PATH ?? "ffmpeg",
        noPlaylist: true,
      });

      const file = fs.readdirSync(os.tmpdir()).find((f) => f.startsWith(baseName) && f.endsWith(".mp4"));
      if (!file) throw new Error("Файл не найден после скачивания");

      return path.join(os.tmpdir(), file);
    } catch (err) {
      if (attempt <= retries) {
        console.log(`Попытка ${attempt} неудачна, повтор...`);
      } else {
        throw err;
      }
    }
  }
}
