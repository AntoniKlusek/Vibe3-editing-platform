import { spawn } from "node:child_process";

/**
 * Extracts a single frame from the video as a JPEG thumbnail.
 * @param inputPath  Path to the source video
 * @param outputPath Path to write the .jpg thumbnail
 * @param atSecond   Timestamp in seconds to grab the frame from (default: 5s)
 */
export async function extractThumbnail(
  inputPath: string,
  outputPath: string,
  atSecond = 5
): Promise<void> {
  const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";

  const args = [
    "-ss", String(atSecond),   // seek to timestamp first (fast seek)
    "-i", inputPath,
    "-vframes", "1",            // extract exactly 1 frame
    "-q:v", "2",                // JPEG quality (2 = very high)
    "-vf", "scale=1280:-1",     // resize to 1280px wide, keep aspect ratio
    "-y",                       // overwrite output
    outputPath,
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpegBin, args, { stdio: "pipe" });
    let stderr = "";
    proc.stderr.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg thumbnail: ${stderr.slice(-1000)}`))));
    proc.on("error", reject);
  });
}
