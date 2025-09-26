import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";

import type { SliderCompositionProps } from "../../../../remotion/SliderComposition";

export const dynamic = "force-dynamic";

const DEFAULT_VIDEO_NAME = "slider-reveal-tiktok.mp4";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = (await request.json()) as SliderCompositionProps & { audio?: string | null };

    const tmpDir: string = await fs.mkdtemp(path.join(os.tmpdir(), "slider-render-"));
    // If audio is a remote URL, fetch it and convert to data URL so Chromium can load it without CORS issues
    let audioDataUrl: string | null = payload.audio ?? null;
    if (audioDataUrl && /^https?:\/\//i.test(audioDataUrl)) {
      try {
        const res = await fetch(audioDataUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        const mime = res.headers.get("content-type") ?? "audio/mpeg";
        audioDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      } catch {
        audioDataUrl = null;
      }
    }

    const payloadPath: string = path.join(tmpDir, "payload.json");
    await fs.writeFile(payloadPath, JSON.stringify({ ...payload, audio: audioDataUrl }), "utf-8");

    const scriptPath: string = path.join(process.cwd(), "scripts", "render.js");

    const outputPath: string = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [scriptPath, payloadPath, DEFAULT_VIDEO_NAME], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d: Buffer) => {
        stdout += d.toString();
      });
      child.stderr.on("data", (d: Buffer) => {
        stderr += d.toString();
      });
      child.on("close", (code: number) => {
        if (code === 0) {
          const lastLine = stdout.trim().split("\n").pop() ?? "";
          if (lastLine.startsWith("/")) {
            resolve(lastLine);
          } else {
            reject(new Error(`Unexpected child output: ${lastLine}`));
          }
        } else {
          reject(new Error(`Render process exited with code ${code}: ${stderr}`));
        }
      });
      child.on("error", (err: Error) => reject(err));
    });

    const file: Buffer = await fs.readFile(outputPath);
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
