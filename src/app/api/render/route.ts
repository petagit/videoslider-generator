import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia } from "@remotion/renderer";

import type { SliderCompositionProps } from "../../../../remotion/SliderComposition";

export const dynamic = "force-dynamic";

const REMOTION_ROOT = path.join(process.cwd(), "remotion");
const ENTRY_POINT = path.join(REMOTION_ROOT, "index.ts");

const DEFAULT_VIDEO_NAME = "slider-reveal.mp4";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SliderCompositionProps;

    const bundleLocation = await bundle({ entryPoint: ENTRY_POINT, outDir: undefined });

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "slider-render-"));
    const outputLocation = path.join(tmpDir, DEFAULT_VIDEO_NAME);

    await renderMedia({
      serveUrl: bundleLocation,
      compositionId: "slider-reveal",
      codec: "h264",
      outputLocation,
      inputProps: payload,
      onDownload: () => undefined,
    });

    const file = await fs.readFile(outputLocation);
    await fs.rm(tmpDir, { recursive: true, force: true });

    return new NextResponse(file, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename=${DEFAULT_VIDEO_NAME}`,
        "Content-Length": String(file.byteLength),
      },
    });
  } catch (error) {
    console.error("Remotion render failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
