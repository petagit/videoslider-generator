#!/usr/bin/env node
// Minimal Node renderer to decouple heavy deps from Next bundler
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');

async function main() {
  const [payloadPath, fileName] = process.argv.slice(2);
  if (!payloadPath || !fileName) {
    console.error('Usage: render <payload.json> <output-file-name>');
    process.exit(2);
  }

  const payload = JSON.parse(await fs.readFile(payloadPath, 'utf-8'));
  const audioDataUrl = payload.audio;
  const { topImages = [], bottomImages = [], animation } = payload;

  if (!Array.isArray(topImages) || !Array.isArray(bottomImages)) {
    throw new Error('Expected photo arrays in payload.');
  }

  if (topImages.length !== bottomImages.length) {
    throw new Error('Top and bottom photo counts must match.');
  }

  if (topImages.length === 0) {
    throw new Error('Add at least one photo pair before rendering.');
  }

  const frameRate = animation?.frameRate ?? 30;
  const durationMs = animation?.durationMs ?? 3000;
  const framesPerSegment = Math.max(1, Math.round((durationMs / 1000) * frameRate));
  const totalFrames = framesPerSegment * topImages.length;

  // Require here so Next.js doesn't try to bundle these modules
  const { bundle } = require('@remotion/bundler');
  const { renderMedia, getCompositions } = require('@remotion/renderer');

  const remotionRoot = path.join(process.cwd(), 'remotion');
  const entryPoint = path.join(remotionRoot, 'index.ts');

  const bundleLocation = await bundle({ entryPoint, outDir: undefined });

  const compositions = await getCompositions(bundleLocation);
  const base = compositions.find((c) => c.id === 'slider-reveal');
  if (!base) {
    throw new Error('Composition "slider-reveal" not found');
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'slider-render-'));
  const outputLocation = path.join(tmpDir, fileName);

  const composition = {
    ...base,
    durationInFrames: totalFrames,
    fps: frameRate,
    props: { ...payload, audio: audioDataUrl },
  };

  await renderMedia({
    serveUrl: bundleLocation,
    composition,
    codec: 'h264',
    outputLocation,
    // inputProps intentionally omitted because props are supplied via composition
    onDownload: () => undefined,
    // Let Remotion embed audio from <Audio /> inside the composition
    audioCodec: 'aac',
    enforceAudioTrack: true,
    muted: false,
    // Keep stdout clean so parent can read only the output path
  });


  // Print the output path so the caller can read it
  process.stdout.write(outputLocation);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
