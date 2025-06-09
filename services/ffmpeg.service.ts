import { FFmpeg, type FileData } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { FileModel } from "~/models/file.model";

export const videoFormats = ["mp4", "avi", "mov", "mkv", "flv", "webm", "wmv", "mpeg"];
export const audioFormats = ["mp3", "aac", "wav", "flac", "ogg", "m4a", "wma"];
export const imageFormats = ["jpeg", "jpg", "png", "gif", "bmp", "tiff", "webp"];

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<void> {
  if (ffmpeg !== null) return;

  ffmpeg = new FFmpeg();

  await ffmpeg.load();
}

export async function loadFile(file: FileModel): Promise<string | null> {
  if (!ffmpeg) {
    console.warn("FFmpeg not loaded.");
    return null;
  }

  const fileName = file.name;

  await ffmpeg.writeFile(fileName, await fetchFile(file.data));

  return new Promise(async (resolve, reject) => {
    if (!ffmpeg) {
      console.warn("FFmpeg not loaded.");
      return null;
    }

    const onLog = ({ message }: { message: string }) => {
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

export async function convertImage(file: FileModel): Promise<boolean> {
  if (!ffmpeg) {
    console.warn("FFmpeg not loaded.");
    return false;
  }

  ffmpeg.on("log", ({ message }) => console.log("[ffmpeg]", message));

  const targetName = `${file.nameNoExtension}.${file.targetType}`;
  //ffmpeg -i "src.png" -vf "$vf" -update true "dst.png"
  await ffmpeg.exec(["-i", file.name, '-vf', 'setsar=1', '-update', 'true', targetName]);
  
  console.log(targetName)
  file.resultData = await ffmpeg.readFile(targetName);
  console.log(file.resultData)
  return true;
}

function getMimeType(ext: string): string {
  switch (ext) {
    case 'mp3': return 'audio/mpeg';
    case 'mp4': return 'video/mp4';
    case 'jpeg':
    case 'jpg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

export function downloadFile(file: FileModel) {
  if (!file.resultData) {
    console.warn('No resultData to download');
    return;
  }
  
  const blob = new Blob([file.resultData], {
    type: getMimeType(file.targetType)
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.nameNoExtension}.${file.targetType}`;
  a.click();
  URL.revokeObjectURL(url);
}
