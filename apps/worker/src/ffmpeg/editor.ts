import { spawn } from "node:child_process";

export interface ClipOptions {
  inputPath: string;
  outputPath: string;
  startTimeMs: number;
  endTimeMs: number;
  speed: number;
}

/**
 * Clips a video and adjusts its playback speed using FFmpeg.
 * Uses complex filters (setpts, atempo) to keep audio/video in sync.
 */
export async function clipVideo(opts: ClipOptions): Promise<void> {
  const { inputPath, outputPath, startTimeMs, endTimeMs, speed } = opts;
  const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";

  const startSec = startTimeMs / 1000;
  const durationSec = (endTimeMs - startTimeMs) / 1000;

  // FFmpeg filters for speed:
  // Video: setpts=1/SPEED*PTS
  // Audio: atempo=SPEED
  // Note: atempo only supports 0.5 to 2.0. For higher speeds, chain them like "atempo=2.0,atempo=2.0"
  
  let audioFilter = `atempo=${speed}`;
  if (speed > 2.0) {
    const count = Math.ceil(Math.log2(speed));
    audioFilter = Array(count).fill(`atempo=${Math.pow(speed, 1/count)}`).join(",");
  } else if (speed < 0.5) {
    const count = Math.ceil(Math.log2(1/speed));
    audioFilter = Array(count).fill(`atempo=${Math.pow(speed, 1/count)}`).join(",");
  }

  const videoFilter = `setpts=${(1/speed).toFixed(4)}*PTS`;

  const args = [
    "-ss", startSec.toFixed(3),
    "-i", inputPath,
    "-t", (durationSec / speed).toFixed(3), // Adjusted duration for output
    "-filter_complex", `[0:v]${videoFilter}[v];[0:a]${audioFilter}[a]`,
    "-map", "[v]",
    "-map", "[a]",
    "-preset", "ultrafast", // Keep it quick for MVP
    "-c:v", "libx264",
    "-c:a", "aac",
    "-y",
    outputPath
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpegBin, args, { stdio: "pipe" });
    let stderr = "";
    proc.stderr.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg clipping error: ${stderr.slice(-1000)}`))));
    proc.on("error", reject);
  });
}
