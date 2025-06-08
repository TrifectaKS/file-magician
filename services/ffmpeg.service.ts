import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { FileModel } from "~/models/file.model";

const videoFormats = ["mp4", "avi", "mov", "mkv", "flv", "webm", "wmv", "mpeg"];
const audioFormats = ["mp3", "aac", "wav", "flac", "ogg", "m4a", "wma"];
const imageFormats = ["jpeg", "jpg", "png", "gif", "bmp", "tiff", "webp"];

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<void> {
  if (ffmpeg !== null) return; // already loaded

  ffmpeg = new FFmpeg();

  await ffmpeg.load();
}

export async function loadFile(file: FileModel): Promise<string | null> {
  if (!ffmpeg) {
    console.warn("FFmpeg not loaded.");
    return null;
  }

  const fileName = file.name;

  // Write file into FFmpeg's virtual FS
  await ffmpeg.writeFile(fileName, await fetchFile(file.data));

  return new Promise(async (resolve, reject) => {
    if (!ffmpeg) {
      console.warn("FFmpeg not loaded.");
      return null;
    }

    const onLog = ({ message }: { message: string }) => {
      // Example message: "Stream #0:0: Video: png, rgba(pc), 1528x4693 ..."
      const regex = /Stream #\d+:\d+.*: (\w+),/i;
      const match = message.match(regex);

      if (match && match[1]) {
        const format = match[1].toLowerCase();
        ffmpeg!.off("log", onLog); // remove listener after detecting
        resolve(format);
      }
    };

    ffmpeg.on("log", onLog);

    try {
      await ffmpeg.exec(["-i", fileName]);
      // If no match found after exec, remove listener and resolve null
      ffmpeg.off("log", onLog);
      resolve(null);
    } catch (err) {
      ffmpeg.off("log", onLog);
      reject(err);
    }
  });
}

export function getPossibleExtensions(fileType: string): string[] {
  fileType = fileType.toLowerCase();

  if (videoFormats.includes(fileType)) {
    return videoFormats.filter((x) => x != fileType);
  }

  if (audioFormats.includes(fileType)) {
    return audioFormats.filter((x) => x != fileType);
  }

  if (imageFormats.includes(fileType)) {
    return imageFormats.filter((x) => x != fileType);
  }

  return [...videoFormats, ...audioFormats, ...imageFormats];
}
