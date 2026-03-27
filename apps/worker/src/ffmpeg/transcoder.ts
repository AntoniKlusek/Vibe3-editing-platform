import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  segmentDuration: number; // seconds, default 2
}

export interface TranscodeResult {
  manifestPath: string;
  segmentPaths: string[];
}

/**
 * Transcodes a video file to HLS using FFmpeg.
 * Produces N × `segmentDuration`-second .ts segments and an index.m3u8 manifest.
 */
export async function transcodeToHls(opts: TranscodeOptions): Promise<TranscodeResult> {
  const { inputPath, outputDir, segmentDuration = 2 } = opts;
  const manifestPath = path.join(outputDir, "index.m3u8");
  const segmentPattern = path.join(outputDir, "segment_%05d.ts");
  const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";

  const args = [
    "-i", inputPath,
    // Video codec
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-profile:v", "main",
    "-level", "4.0",
    // Audio codec
    "-c:a", "aac",
    "-b:a", "128k",
    "-ar", "44100",
    // HLS container
    "-f", "hls",
    "-hls_time", String(segmentDuration),
    "-hls_list_size", "0",                // keep ALL segments in .m3u8
    "-hls_segment_type", "mpegts",
    "-hls_segment_filename", segmentPattern,
    "-hls_playlist_type", "vod",
    // Optimizations
    "-movflags", "+faststart",
    "-sc_threshold", "0",                 // disable scene-cut → exact 2s cuts
    "-g", String(segmentDuration * 30),   // GOP = 2s × 30fps
    manifestPath,
  ];

  await runFfmpeg(ffmpegBin, args);

  const dir = await fs.readdir(outputDir);
  const segmentPaths = dir
    .filter((f) => f.endsWith(".ts"))
    .sort()
    .map((f) => path.join(outputDir, f));

  return { manifestPath, segmentPaths };
}

function runFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: "pipe" });
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited ${code}:\n${stderr.slice(-2000)}`));
    });
    proc.on("error", reject);
  });
}
