import ytDlp from "youtube-dl-exec";
import path from "path";
import os from "os";

export async function downloadVideo(url, retries = 2) {
  const outputPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await ytDlp(url, {
        output: outputPath,
        format: "mp4[height<=1080]/best[ext=mp4]/best",
        noPlaylist: true,
      });
      return outputPath;
    } catch (err) {
      if (attempt <= retries) {
        console.log(`Попытка ${attempt} неудачна, повтор...`);
      } else {
        throw err;
      }
    }
  }
}
