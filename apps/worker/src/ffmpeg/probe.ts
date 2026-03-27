import { spawn } from "node:child_process";

export interface ProbeResult {
  durationSec: number;
  widthPx: number;
  heightPx: number;
  codec: string;
  fps: number;
}

/**
 * Runs ffprobe on a video file and returns key metadata.
 * Used to populate the `videos` table after transcoding.
 */
export async function probeVideo(inputPath: string): Promise<ProbeResult> {
  const ffprobeBin = (process.env.FFMPEG_PATH && process.env.FFMPEG_PATH.length > 0)
    ? process.env.FFMPEG_PATH.replace("ffmpeg", "ffprobe")
    : "ffprobe";

  const args = [
    "-v", "quiet",
    "-print_format", "json",
    "-show_streams",
    "-show_format",
    inputPath,
  ];

  const output = await new Promise<string>((resolve, reject) => {
    const proc = spawn(ffprobeBin, args, { stdio: "pipe" });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (c: Buffer) => { stdout += c.toString(); });
    proc.stderr.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error(`ffprobe: ${stderr}`))));
    proc.on("error", reject);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = JSON.parse(output) as {
    streams: Array<{ codec_type: string; codec_name: string; width?: number; height?: number; r_frame_rate?: string }>;
    format: { duration?: string };
  };

  const videoStream = data.streams.find((s) => s.codec_type === "video");
  const [fpsNum, fpsDen] = (videoStream?.r_frame_rate ?? "30/1").split("/").map(Number);

  return {
    durationSec: parseFloat(data.format.duration ?? "0"),
    widthPx: videoStream?.width ?? 0,
    heightPx: videoStream?.height ?? 0,
    codec: videoStream?.codec_name ?? "unknown",
    fps: fpsDen ? (fpsNum ?? 30) / fpsDen : 30,
  };
}
