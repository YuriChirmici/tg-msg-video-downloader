import ytDlp from "youtube-dl-exec";
import path from "path";
import os from "os";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const ffmpegPath = process.env.FFMPEG_PATH ?? "ffmpeg";
const ffprobePath = ffmpegPath.replace(/ffmpeg(\.exe)?$/, "ffprobe$1");

export async function getVideoMeta(filePath) {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v", "quiet",
      "-print_format", "json",
      "-show_streams",
      filePath,
    ]);
    const streams = JSON.parse(stdout).streams;
    const video = streams.find((s) => s.codec_type === "video");
    return {
      duration: Math.round(parseFloat(video?.duration ?? 0)),
      width: video?.width ?? 0,
      height: video?.height ?? 0,
    };
  } catch {
    return { duration: 0, width: 0, height: 0 };
  }
}

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
        ffmpegLocation: ffmpegPath,
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
