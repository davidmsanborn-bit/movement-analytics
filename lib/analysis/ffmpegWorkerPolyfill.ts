/**
 * @ffmpeg/ffmpeg uses the browser Worker global. Node provides the same API via
 * worker_threads — alias it before FFmpeg is instantiated (server / API routes).
 */
import { Worker as NodeWorker } from "node:worker_threads";

if (typeof globalThis.Worker === "undefined") {
  // worker_threads Worker is compatible with ffmpeg.wasm's `new Worker(url, { type: "module" })`.
  // @ts-expect-error — DOM Worker vs worker_threads types differ; runtime usage matches.
  globalThis.Worker = NodeWorker;
}
