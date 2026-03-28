/**
 * Movement Analytics — frame extraction service (Railway / Node)
 * Universal motion-based strategy for all movement types.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { createClient } = require("@supabase/supabase-js");

const execFileAsync = promisify(execFile);

const FFMPEG = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";
const PORT = Number(process.env.PORT) || 3000;

const FIXED_FALLBACK = {
  shooting: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5],
  deadlift: [1, 2, 3, 4, 5, 6, 7, 8],
  bench: [1, 2, 3, 4, 5, 6, 7, 8],
  default: [1, 2, 3],
};

const EVEN_SPREAD_COUNT = 8;

function isWebm(filePath) {
  return path.extname(filePath).toLowerCase() === ".webm";
}

function ffmpegInputArgs(inputPath) {
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  if (isWebm(inputPath)) {
    args.push("-fflags", "+genpts");
  }
  args.push("-i", inputPath);
  return args;
}

async function getDurationSeconds(inputPath) {
  const { stdout } = await execFileAsync(FFPROBE, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    inputPath,
  ]);
  const d = parseFloat(String(stdout).trim());
  return Number.isFinite(d) && d > 0 ? d : null;
}

/**
 * Run scene-change detection; writes scene_${analysisId}_NNN.jpg into outputDir.
 */
async function runSceneDetection(inputPath, outputDir, analysisId, threshold) {
  const pattern = path.join(outputDir, `scene_${analysisId}_%03d.jpg`);
  const vf = `select=gt(scene\\,${threshold}),scale=800:-1,fps=30`;
  const args = [
    ...ffmpegInputArgs(inputPath),
    "-an",
    "-vf",
    vf,
    "-vsync",
    "vfr",
    "-pix_fmt",
    "yuvj420p",
    "-q:v",
    "2",
    pattern,
  ];
  await execFileAsync(FFMPEG, args, { maxBuffer: 10 * 1024 * 1024 });
}

function listSceneFrames(outputDir, analysisId) {
  const prefix = `scene_${analysisId}_`;
  let files = [];
  try {
    files = fs.readdirSync(outputDir);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.startsWith(prefix) && f.endsWith(".jpg"))
    .sort()
    .map((f) => path.join(outputDir, f));
}

/**
 * If more than maxKeep frames, keep maxKeep evenly sampled (by index order ≈ time order).
 */
function subsampleEvenly(paths, maxKeep) {
  if (paths.length <= maxKeep) return paths;
  const n = paths.length;
  const out = [];
  for (let k = 0; k < maxKeep; k++) {
    const idx = Math.round((k * (n - 1)) / (maxKeep - 1 || 1));
    out.push(paths[idx]);
  }
  return out;
}

async function extractSingleFrameAtTime(inputPath, outputJpg, timeSeconds) {
  const args = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-ss",
    String(timeSeconds),
  ];
  if (isWebm(inputPath)) {
    args.push("-fflags", "+genpts");
  }
  args.push(
    "-i",
    inputPath,
    "-an",
    "-vf",
    "scale=800:-1,fps=30",
    "-vframes",
    "1",
    "-q:v",
    "2",
    outputJpg,
  );
  await execFileAsync(FFMPEG, args, { maxBuffer: 10 * 1024 * 1024 });
}

function unlinkSceneFrames(outputDir, analysisId) {
  for (const f of listSceneFrames(outputDir, analysisId)) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
}

function unlinkEvenFrames(outputDir, analysisId) {
  const prefix = `even_${analysisId}_`;
  let files = [];
  try {
    files = fs.readdirSync(outputDir);
  } catch {
    return;
  }
  for (const name of files) {
    if (!name.startsWith(prefix) || !name.endsWith(".jpg")) continue;
    try {
      fs.unlinkSync(path.join(outputDir, name));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Evenly spaced frames across [0, duration).
 */
async function extractEvenlySpacedByDuration(
  inputPath,
  outputDir,
  analysisId,
  count,
) {
  const duration = await getDurationSeconds(inputPath);
  if (duration == null || duration <= 0) {
    return [];
  }
  const paths = [];
  for (let i = 0; i < count; i++) {
    const t = ((i + 0.5) * duration) / count;
    const out = path.join(
      outputDir,
      `even_${analysisId}_${String(i + 1).padStart(3, "0")}.jpg`,
    );
    try {
      await extractSingleFrameAtTime(inputPath, out, t);
      paths.push(out);
    } catch {
      /* skip broken slice */
    }
  }
  return paths.filter((p) => fs.existsSync(p));
}

async function extractAtFixedTimestamps(
  inputPath,
  outputDir,
  analysisId,
  timestamps,
) {
  const paths = [];
  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i];
    const out = path.join(
      outputDir,
      `fixed_${analysisId}_${String(i + 1).padStart(3, "0")}.jpg`,
    );
    try {
      await extractSingleFrameAtTime(inputPath, out, t);
      if (fs.existsSync(out)) paths.push(out);
    } catch {
      /* try next */
    }
  }
  return paths;
}

function normalizeMovementType(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "default";
  const s = raw.trim().toLowerCase();
  if (s === "shooting") return "shooting";
  if (s === "deadlift") return "deadlift";
  if (s === "bench") return "bench";
  return "default";
}

function fixedTimestampsForMovement(movementKey) {
  if (movementKey === "shooting") return FIXED_FALLBACK.shooting;
  if (movementKey === "deadlift") return FIXED_FALLBACK.deadlift;
  if (movementKey === "bench") return FIXED_FALLBACK.bench;
  return FIXED_FALLBACK.default;
}

async function readFramesAsPayload(jpegPaths) {
  const frames = [];
  for (const p of jpegPaths) {
    const buf = await fs.promises.readFile(p);
    frames.push({
      base64: buf.toString("base64"),
      mediaType: "image/jpeg",
    });
  }
  return frames;
}

async function extractUniversalFrames(inputPath, analysisId, movementTypeRaw) {
  const movementKey = normalizeMovementType(movementTypeRaw);
  const tmpRoot = fs.mkdtempSync(
    path.join(require("os").tmpdir(), `frames_${analysisId}_`),
  );

  let strategyName = "unknown";
  let jpegPaths = [];

  try {
    // --- STEP 1: scene detection 0.15
    try {
      await runSceneDetection(inputPath, tmpRoot, analysisId, 0.15);
    } catch {
      /* may produce zero files */
    }
    jpegPaths = listSceneFrames(tmpRoot, analysisId);
    if (jpegPaths.length > 10) {
      jpegPaths = subsampleEvenly(jpegPaths, 10);
    }

    if (jpegPaths.length >= 4) {
      strategyName = "scene_detection_0.15";
    } else {
      // --- STEP 2a: retry 0.08 (remove all scene outputs from first pass)
      unlinkSceneFrames(tmpRoot, analysisId);
      try {
        await runSceneDetection(inputPath, tmpRoot, analysisId, 0.08);
      } catch {
        /* */
      }
      jpegPaths = listSceneFrames(tmpRoot, analysisId);
      if (jpegPaths.length > 10) {
        jpegPaths = subsampleEvenly(jpegPaths, 10);
      }

      if (jpegPaths.length >= 4) {
        strategyName = "scene_detection_0.08";
      } else {
        // --- STEP 2b: evenly spaced by duration
        for (const f of listSceneFrames(tmpRoot, analysisId)) {
          try {
            fs.unlinkSync(f);
          } catch {
            /* */
          }
        }
        jpegPaths = await extractEvenlySpacedByDuration(
          inputPath,
          tmpRoot,
          analysisId,
          EVEN_SPREAD_COUNT,
        );
        if (jpegPaths.length >= 4) {
          strategyName = "evenly_spaced_duration";
        } else {
          // --- STEP 3: fixed timestamps by movementType
          unlinkEvenFrames(tmpRoot, analysisId);
          jpegPaths = await extractAtFixedTimestamps(
            inputPath,
            tmpRoot,
            analysisId,
            fixedTimestampsForMovement(movementKey),
          );
          strategyName = `fixed_timestamps_${movementKey}`;
        }
      }
    }

    const frameCount = jpegPaths.length;
    console.log("[frames] strategy used:", strategyName);
    console.log("[frames] frames extracted:", frameCount);
    console.log("[frames] movement type:", movementTypeRaw ?? movementKey);

    if (frameCount === 0) {
      throw new Error("No frames could be extracted from video");
    }

    return await readFramesAsPayload(jpegPaths);
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      /* */
    }
  }
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

async function downloadVideoToTemp(storagePath, analysisId) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from("videos")
    .download(storagePath);
  if (error || !data) {
    throw new Error(error?.message || "Failed to download video from storage");
  }
  const buf = Buffer.from(await data.arrayBuffer());
  const ext = path.extname(storagePath) || ".mp4";
  const inputPath = path.join(
    require("os").tmpdir(),
    `input_${analysisId}${ext}`,
  );
  await fs.promises.writeFile(inputPath, buf);
  return inputPath;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/extract-frames", async (req, res) => {
  const auth = req.headers.authorization || "";
  const secret = process.env.FRAMES_SERVICE_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { analysisId, storagePath, movementType } = req.body || {};
  if (typeof analysisId !== "string" || !analysisId.trim()) {
    return res.status(400).json({ error: "analysisId required" });
  }
  if (typeof storagePath !== "string" || !storagePath.trim()) {
    return res.status(400).json({ error: "storagePath required" });
  }

  let inputPath = null;
  try {
    inputPath = await downloadVideoToTemp(storagePath.trim(), analysisId.trim());
    const frames = await extractUniversalFrames(
      inputPath,
      analysisId.trim(),
      movementType,
    );
    return res.json({ frames });
  } catch (err) {
    console.error("[extract-frames]", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Frame extraction failed",
    });
  } finally {
    if (inputPath && fs.existsSync(inputPath)) {
      try {
        fs.unlinkSync(inputPath);
      } catch {
        /* */
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`[frames] listening on ${PORT}`);
});
