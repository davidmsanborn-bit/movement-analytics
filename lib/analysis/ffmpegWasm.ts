import "./ffmpegWorkerPolyfill";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CORE_DIR = path.join(process.cwd(), "node_modules/@ffmpeg/core/dist/esm");

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Shared FFmpeg instance (WASM loaded once per server process / warm lambda).
 */
export async function getFfmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }
  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const coreURL = pathToFileURL(path.join(CORE_DIR, "ffmpeg-core.js")).href;
      const wasmURL = pathToFileURL(path.join(CORE_DIR, "ffmpeg-core.wasm")).href;
      await ffmpeg.load({ coreURL, wasmURL });
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })();
  }
  return loadPromise;
}
