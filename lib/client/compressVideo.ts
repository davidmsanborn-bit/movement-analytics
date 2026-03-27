const MAX_WIDTH = 1280;
const TARGET_VIDEO_BITRATE = 2_500_000;
const COMPRESSION_TIMEOUT_MS = 60_000;

function waitForEvent(target: EventTarget, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onDone = () => {
      target.removeEventListener(event, onDone);
      resolve();
    };
    const onError = () => {
      target.removeEventListener(event, onDone);
      reject(new Error(`Failed while waiting for ${event}`));
    };
    target.addEventListener(event, onDone, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function chooseWebmMimeType(): string | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return null;
  }

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<File> {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof MediaRecorder === "undefined"
  ) {
    return file;
  }

  const mimeType = chooseWebmMimeType();
  if (!mimeType) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<File>((resolve) => {
      timeoutId = setTimeout(() => resolve(file), COMPRESSION_TIMEOUT_MS);
    });

    const compressPromise = (async (): Promise<File> => {
      onProgress?.(0);

      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.src = objectUrl;

      await waitForEvent(video, "loadedmetadata");

      const srcWidth = Math.max(1, video.videoWidth || 1);
      const srcHeight = Math.max(1, video.videoHeight || 1);
      const scale = srcWidth > MAX_WIDTH ? MAX_WIDTH / srcWidth : 1;
      const outWidth = Math.round(srcWidth * scale);
      const outHeight = Math.round(srcHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      const stream = canvas.captureStream(30);
      const chunks: BlobPart[] = [];
      let recorderStopped = false;

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: TARGET_VIDEO_BITRATE,
      });

      const drawLoop = () => {
        if (video.ended || video.paused) return;
        ctx.drawImage(video, 0, 0, outWidth, outHeight);

        if (Number.isFinite(video.duration) && video.duration > 0) {
          const pct = Math.min(
            99,
            Math.max(0, Math.round((video.currentTime / video.duration) * 100)),
          );
          onProgress?.(pct);
        }
        requestAnimationFrame(drawLoop);
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          recorderStopped = true;
          resolve();
        };
      });

      recorder.start(100);

      try {
        await video.play();
      } catch {
        recorder.stop();
        return file;
      }

      drawLoop();
      await waitForEvent(video, "ended");

      if (!recorderStopped && recorder.state !== "inactive") {
        recorder.stop();
      }
      await stopped;

      if (chunks.length === 0) return file;

      onProgress?.(100);

      const compressedBlob = new Blob(chunks, { type: "video/webm" });
      console.log("[compress] result:", {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        type: compressedBlob.type,
        duration: video.duration,
      });

      if (compressedBlob.size >= file.size * 0.9) {
        console.log("[compress] compression ineffective, using original");
        return file;
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return new File([compressedBlob], `${baseName}.webm`, {
        type: "video/webm",
        lastModified: Date.now(),
      });
    })();

    return await Promise.race([compressPromise, timeoutPromise]);
  } catch {
    return file;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    URL.revokeObjectURL(objectUrl);
  }
}

