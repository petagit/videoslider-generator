let ffmpegInstance: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
let ffmpegLoaded = false;
let ffmpegLoading: Promise<void> | null = null;

const CORE_VERSION = "0.12.9" as const;
const CORE_BASE = `https://unpkg.com/@ffmpeg/core-st@${CORE_VERSION}/dist/ffmpeg-core` as const;

export async function getFFmpeg() {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg is only available in the browser.");
  }

  if (!ffmpegInstance) {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    ffmpegInstance = new FFmpeg();
  }

  if (!ffmpegLoaded) {
    if (!ffmpegLoading) {
      ffmpegLoading = ffmpegInstance
        .load({
          coreURL: `${CORE_BASE}.js`,
          wasmURL: `${CORE_BASE}.wasm`,
          workerURL: `${CORE_BASE}.worker.js`,
        })
        .then(() => {
          ffmpegLoaded = true;
        })
        .catch((error) => {
          ffmpegLoaded = false;
          throw error;
        })
        .finally(() => {
          ffmpegLoading = null;
        });
    }

    await ffmpegLoading;
  }

  return { ffmpeg: ffmpegInstance } as const;
}
