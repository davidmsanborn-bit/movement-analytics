import { execSync } from "child_process"
import fs from "fs"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export type PreScanResult = {
  movementPosition: "early" | "middle" | "late" | "unknown"
  confidence: "high" | "low"
}

export async function preScanVideo(
  buffer: Buffer,
  analysisId: string
): Promise<PreScanResult> {
  const defaultResult: PreScanResult = {
    movementPosition: "unknown",
    confidence: "low"
  }

  try {
    const inputPath = `/tmp/prescan_${analysisId}.mov`
    fs.writeFileSync(inputPath, buffer)

    let duration = 0
    try {
      const stderr = execSync(
        `/usr/bin/ffmpeg -i ${inputPath} 2>&1 || true`,
        { encoding: "utf8" }
      )
      const match = stderr.match(
        /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/)
      if (match) {
        duration = parseInt(match[1]) * 3600 +
                   parseInt(match[2]) * 60 +
                   parseFloat(match[3])
      }
    } catch {}

    if (duration < 3) {
      try { fs.unlinkSync(inputPath) } catch {}
      return defaultResult
    }

    const timestamps = [
      duration * 0.25,
      duration * 0.50,
      duration * 0.75
    ]

    const frames: string[] = []
    for (let i = 0; i < timestamps.length; i++) {
      const outputPath = 
        `/tmp/prescan_${analysisId}_f${i}.jpg`
      try {
        execSync(
          `/usr/bin/ffmpeg -ss ${timestamps[i]} ` +
          `-i ${inputPath} -vframes 1 ` +
          `-vf scale=400:-1 -q:v 5 ${outputPath} -y`,
          { stdio: "pipe" }
        )
        const frameBuffer = fs.readFileSync(outputPath)
        frames.push(frameBuffer.toString("base64"))
        fs.unlinkSync(outputPath)
      } catch {}
    }

    try { fs.unlinkSync(inputPath) } catch {}

    if (frames.length < 2) return defaultResult

    const imageContent = frames.map((f) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data: f
      }
    }))

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `These 3 frames are from 25%, 50%, and 75% 
through a sports/fitness video. Which frame shows the athlete 
actively performing the movement (mid-squat, mid-lift, 
mid-shot)?

Return ONLY JSON - no markdown:
{"activeFrame": <1, 2, 3, or 0 if none clearly active>}`
          }
        ]
      }]
    })

    const text = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("")

    const parsed = JSON.parse(
      text.replace(/```json|```/g, "").trim()
    )

    const frameMap: Record<number, PreScanResult> = {
      1: { movementPosition: "early", confidence: "high" },
      2: { movementPosition: "middle", confidence: "high" },
      3: { movementPosition: "late", confidence: "high" },
      0: { movementPosition: "unknown", confidence: "low" }
    }

    return frameMap[parsed.activeFrame] ?? defaultResult

  } catch (err) {
    console.log("[prescan] failed, using unknown:", err)
    return defaultResult
  }
}
