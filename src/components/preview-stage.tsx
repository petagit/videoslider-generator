/* eslint-disable @next/next/no-img-element */
"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import { motion, useMotionTemplate, useSpring, useTransform } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAppStore } from "../state/store";

export function PreviewStage() {
  const topImage = useAppStore((state) => state.topImage);
  const bottomImage = useAppStore((state) => state.bottomImage);
  const compare = useAppStore((state) => state.compare);
  const overlay = useAppStore((state) => state.overlay);
  const setSliderPct = useAppStore((state) => state.setSliderPct);

  const sliderSpring = useSpring(compare.sliderPct, { stiffness: 90, damping: 18, mass: 0.8 });

  useEffect(() => {
    sliderSpring.set(compare.sliderPct);
  }, [compare.sliderPct, sliderSpring]);

  const verticalClip = useMotionTemplate`polygon(0 0, ${sliderSpring}% 0, ${sliderSpring}% 100%, 0 100%)`;
  const horizontalClip = useMotionTemplate`polygon(0 0, 100% 0, 100% ${sliderSpring}%, 0 ${sliderSpring}%)`;
  const clipPath = compare.orientation === "vertical" ? verticalClip : horizontalClip;

  const clipPathFallback = useMemo(() => {
    if (compare.orientation === "vertical") {
      return `polygon(0 0, ${compare.sliderPct}% 0, ${compare.sliderPct}% 100%, 0 100%)`;
    }

    return `polygon(0 0, 100% 0, 100% ${compare.sliderPct}%, 0 ${compare.sliderPct}%)`;
  }, [compare.orientation, compare.sliderPct]);

  const dividerPosition = useTransform(sliderSpring, (value) => `${value}%`);

  const overlayStyles = useMemo<CSSProperties>(() => {
    const base: CSSProperties = {
      maxWidth: `${overlay.maxWidthPct}%`,
      fontSize: `${overlay.fontSizePx}px`,
      color: overlay.color,
      backgroundColor: overlay.background ?? "transparent",
      padding: overlay.background ? "1rem" : "0",
      borderRadius: overlay.background ? "0.75rem" : "0",
    };

    if (overlay.align === "center") {
      base.marginLeft = "auto";
      base.marginRight = "auto";
      base.textAlign = "center";
    } else if (overlay.align === "right") {
      base.marginLeft = "auto";
      base.marginRight = "0";
      base.textAlign = "right";
    } else {
      base.marginLeft = "0";
      base.marginRight = "auto";
      base.textAlign = "left";
    }

    return base;
  }, [overlay.align, overlay.background, overlay.color, overlay.fontSizePx, overlay.maxWidthPct]);

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Live Preview
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">
          Slider reveal prototype
        </h1>
        <p className="text-sm text-slate-400">
          Drag the slider to test the mask. Drop your own images on the left to see this stage
          update instantly.
        </p>
      </header>

      <div className="relative w-full flex-1">
        <div
          id="preview-stage"
          className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_70%)]"
        >
          {bottomImage ? (
            <img
              key={bottomImage.id}
              src={bottomImage.src}
              alt={bottomImage.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Placeholder label="Bottom image" position="bottom" />
          )}

          {topImage ? (
            <motion.img
              key={topImage.id}
              src={topImage.src}
              alt={topImage.alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath }}
            />
          ) : (
            <Placeholder label="Top image" position="top" clipPath={clipPathFallback} />
          )}

          <motion.div
            className="pointer-events-none absolute bg-sky-400/70"
            style={
              compare.showDivider
                ? compare.orientation === "vertical"
                  ? { left: dividerPosition, top: 0, bottom: 0, width: "2px" }
                  : { top: dividerPosition, left: 0, right: 0, height: "2px" }
                : { display: "none" }
            }
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
            <div style={overlayStyles} className="markdown-preview">
              {overlay.markdown.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{overlay.markdown}</ReactMarkdown>
              ) : (
                <p className="text-sm text-slate-400">
                  Start typing Markdown in the overlay panel to see it land here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-slate-950/50 px-6 py-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            <span>Reveal percentage</span>
            <span className="text-sky-200">{compare.sliderPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={compare.sliderPct}
            onChange={(event) => setSliderPct(Number(event.target.value))}
            className="accent-sky-500"
          />
        </div>
        <div className="min-w-[120px] rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          {compare.orientation === "vertical" ? "Left ↔ Right" : "Top ↕ Bottom"}
        </div>
      </div>
    </div>
  );
}

interface PlaceholderProps {
  label: string;
  position: "top" | "bottom";
  clipPath?: string;
}

function Placeholder({ label, position, clipPath }: PlaceholderProps) {
  return (
    <div
      className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600 ${position === "top" ? "bg-[radial-gradient(circle_at_top_left,#0f172a,#020617)]" : "bg-[radial-gradient(circle_at_bottom_right,#1e1b4b,#020617)]"}`}
      style={position === "top" ? { clipPath } : undefined}
    >
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="h-10 w-10 text-slate-700"
      >
        <path
          fill="currentColor"
          d="M8 10a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v20H8zm0 20v8a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2v-8l-6-6-7 7-9-9z"
        />
      </svg>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]">{label}</p>
      <p className="text-[11px] text-slate-500">Drop an image to replace this placeholder.</p>
    </div>
  );
}
