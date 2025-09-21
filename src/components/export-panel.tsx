"use client";

import { useCallback, useState } from "react";

import { useAppStore } from "../state/store";

export function ExportPanel() {
  const format = useAppStore((state) => state.exportOptions.format);
  const setExportFormat = useAppStore((state) => state.setExportFormat);
  const topImage = useAppStore((state) => state.topImage);
  const bottomImage = useAppStore((state) => state.bottomImage);
  const overlay = useAppStore((state) => state.overlay);
  const compare = useAppStore((state) => state.compare);
  const animation = useAppStore((state) => state.animation);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const getDataUrl = useCallback(async (file?: File, fallback?: string) => {
    if (file) {
      const reader = new FileReader();
      const result = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      return result;
    }

    if (fallback) {
      return fallback;
    }

    return "";
  }, []);

  const runMp4Export = useCallback(async () => {
    setStatus("Preparing assets…");

    const [topDataUrl, bottomDataUrl] = await Promise.all([
      getDataUrl(topImage?.file, topImage?.src),
      getDataUrl(bottomImage?.file, bottomImage?.src),
    ]);

    setStatus("Rendering video via Remotion…");

    const response = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topImage: topDataUrl,
        bottomImage: bottomDataUrl,
        compare: {
          orientation: compare.orientation,
          showDivider: compare.showDivider,
        },
        overlay: {
          markdown: overlay.markdown,
          fontSizePx: overlay.fontSizePx,
          color: overlay.color,
          background: overlay.background ?? null,
          maxWidthPct: overlay.maxWidthPct,
          align: overlay.align,
        },
        animation,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ message: "Render failed" }));
      throw new Error(errorPayload.message ?? "Render failed");
    }

    setStatus("Downloading video…");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "slider-reveal.mp4";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setStatus("MP4 exported – check your downloads.");
  }, [animation, compare.orientation, compare.showDivider, getDataUrl, overlay.align, overlay.background, overlay.color, overlay.fontSizePx, overlay.markdown, overlay.maxWidthPct, topImage?.file, topImage?.src, bottomImage?.file, bottomImage?.src]);

  const handleExport = useCallback(async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setStatus(null);

    try {
      if (format !== "mp4") {
        setStatus("Still-image export is coming soon. Switch to MP4 for now.");
        return;
      }

      await runMp4Export();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while exporting the video.";

      setStatus(message);
    } finally {
      setIsExporting(false);
    }
  }, [format, isExporting, runMp4Export]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Export
        </h2>
        <p className="text-xs text-slate-400">
          Render an MP4 via Remotion using the current slider, overlay, and animation settings.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Format
          </span>
          <select
            value={format}
            onChange={(event) => setExportFormat(event.target.value as typeof format)}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none"
          >
            <option value="mp4">MP4 (3s loop)</option>
            <option value="png">PNG (coming soon)</option>
            <option value="jpeg">JPEG (coming soon)</option>
            <option value="webp">WebP (coming soon)</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex items-center justify-center rounded-full bg-sky-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100 shadow-inner shadow-sky-500/20 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isExporting}
        >
          {isExporting ? "Exporting…" : "Export preview"}
        </button>

        {status ? (
          <p className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300">
            {status}
          </p>
        ) : null}
      </div>
    </section>
  );
}
