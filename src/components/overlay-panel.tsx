"use client";

import { ChangeEvent } from "react";
import { useAppStore } from "../state/store";

export function OverlayPanel() {
  const markdown = useAppStore((state) => state.overlay.markdown);
  const fontSizePx = useAppStore((state) => state.overlay.fontSizePx);
  const color = useAppStore((state) => state.overlay.color);
  const maxWidthPct = useAppStore((state) => state.overlay.maxWidthPct);
  const align = useAppStore((state) => state.overlay.align);
  const background = useAppStore((state) => state.overlay.background);
  const borderColor = useAppStore((state) => state.overlay.borderColor);
  const borderWidthPx = useAppStore((state) => state.overlay.borderWidthPx);
  const borderStyle = useAppStore((state) => state.overlay.borderStyle);
  const borderRadiusPx = useAppStore((state) => state.overlay.borderRadiusPx);
  const setOverlayMarkdown = useAppStore((state) => state.setOverlayMarkdown);
  const setOverlayFontSize = useAppStore((state) => state.setOverlayFontSize);
  const setOverlayColor = useAppStore((state) => state.setOverlayColor);
  const setOverlayMaxWidth = useAppStore((state) => state.setOverlayMaxWidth);
  const setOverlayAlignment = useAppStore((state) => state.setOverlayAlignment);
  const setOverlayBackground = useAppStore((state) => state.setOverlayBackground);
  const setOverlayBorder = useAppStore((state) => state.setOverlayBorder);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setOverlayMarkdown(event.target.value);
  };

  const handleFontSize = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayFontSize(Number(event.target.value));
  };

  const handleWidth = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayMaxWidth(Number(event.target.value));
  };

  const handleColor = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayColor(event.target.value);
  };

  const handleBackground = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOverlayBackground(value === "" ? undefined : value);
  };

  const handleBorderColor = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayBorder({ borderColor: event.target.value });
  };
  const handleBorderWidth = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayBorder({ borderWidthPx: Number(event.target.value) });
  };
  const handleBorderRadius = (event: ChangeEvent<HTMLInputElement>) => {
    setOverlayBorder({ borderRadiusPx: Number(event.target.value) });
  };
  const handleBorderStyle = (event: ChangeEvent<HTMLSelectElement>) => {
    setOverlayBorder({ borderStyle: event.target.value as typeof borderStyle });
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Overlay
        </h2>
        <p className="text-xs text-slate-400">Write Markdown and tweak how it appears over the reveal.</p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Markdown
          </label>
          <textarea
            value={markdown}
            onChange={handleTextChange}
            rows={6}
            className="min-h-[120px] resize-y rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            placeholder="Write overlay copy in Markdown"
          />
          <p className="text-xs text-slate-500">
            Supports headings, lists, emphasis, and links. Preview updates instantly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Font size
            </span>
            <input
              type="range"
              min={14}
              max={64}
              value={fontSizePx}
              onChange={handleFontSize}
            />
            <span className="text-xs text-slate-300">{fontSizePx}px</span>
          </label>
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Max width
            </span>
            <input
              type="range"
              min={20}
              max={100}
              value={maxWidthPct}
              onChange={handleWidth}
            />
            <span className="text-xs text-slate-300">{maxWidthPct}% of stage</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Border width</span>
            <input type="range" min={0} max={16} value={borderWidthPx} onChange={handleBorderWidth} />
            <span className="text-xs text-slate-300">{borderWidthPx}px</span>
          </label>
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Border radius</span>
            <input type="range" min={0} max={48} value={borderRadiusPx} onChange={handleBorderRadius} />
            <span className="text-xs text-slate-300">{borderRadiusPx}px</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Border color</span>
            <div className="flex items-center gap-2">
              <input type="color" value={borderColor} onChange={handleBorderColor} className="h-8 w-8 cursor-pointer rounded" />
              <input type="text" value={borderColor} onChange={handleBorderColor} className="flex-1 rounded border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-100 focus:border-sky-400 focus:outline-none" />
            </div>
          </label>
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Border style</span>
            <select value={borderStyle} onChange={handleBorderStyle} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 focus:border-sky-400 focus:outline-none">
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Text color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={handleColor}
                className="h-8 w-8 cursor-pointer rounded"
              />
              <input
                type="text"
                value={color}
                onChange={handleColor}
                className="flex-1 rounded border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 rounded-xl bg-slate-950/40 p-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Background
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background ?? "#0f172a"}
                onChange={handleBackground}
                className="h-8 w-8 cursor-pointer rounded"
              />
              <input
                type="text"
                value={background ?? ""}
                onChange={handleBackground}
                placeholder="rgba(...) or hex"
                className="flex-1 rounded border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-500">Leave blank for transparent.</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {([
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setOverlayAlignment(value)}
              className={`flex-1 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${align === value ? "bg-sky-500/30 text-sky-100" : "bg-slate-950/40 text-slate-400 hover:bg-slate-900/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
