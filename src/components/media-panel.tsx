/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, DragEvent, useCallback, useState } from "react";
import { useAppStore } from "../state/store";
import type { UploadedImage } from "../state/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

type SlotKind = "top" | "bottom";

const friendlyLabel: Record<SlotKind, string> = {
  top: "Top image",
  bottom: "Bottom image",
};

const loadImageDimensions = async (src: string) =>
  new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });

const buildUploadedImage = async (file: File): Promise<UploadedImage> => {
  const src = URL.createObjectURL(file);
  const { width, height } = await loadImageDimensions(src);
  return {
    id: crypto.randomUUID(),
    file,
    src,
    alt: file.name || "Uploaded image",
    naturalWidth: width,
    naturalHeight: height,
  };
};

const imagePreview = (image?: UploadedImage) => {
  if (!image) {
    return (
      <span className="text-xs font-medium text-slate-400">
        Drop image or browse
      </span>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <img
        src={image.src}
        alt={image.alt}
        className="h-32 w-full rounded-md object-cover"
      />
      <div className="text-[11px] font-medium leading-tight text-slate-300">
        <p className="truncate">{image.alt}</p>
        <p>
          {image.naturalWidth} × {image.naturalHeight}
        </p>
      </div>
    </div>
  );
};

export function MediaPanel() {
  const topImage = useAppStore((state) => state.topImage);
  const bottomImage = useAppStore((state) => state.bottomImage);
  const compare = useAppStore((state) => state.compare);
  const setTopImage = useAppStore((state) => state.setTopImage);
  const setBottomImage = useAppStore((state) => state.setBottomImage);
  const clearImages = useAppStore((state) => state.clearImages);
  const setOrientation = useAppStore((state) => state.setOrientation);
  const toggleDivider = useAppStore((state) => state.toggleDivider);

  const [draggingSlot, setDraggingSlot] = useState<SlotKind | null>(null);

  const assignImage = useCallback(
    async (slot: SlotKind, file?: File) => {
      if (!file || !ACCEPTED_TYPES.includes(file.type)) {
        return;
      }

      const uploaded = await buildUploadedImage(file);
      if (slot === "top") {
        setTopImage(uploaded);
      } else {
        setBottomImage(uploaded);
      }
    },
    [setTopImage, setBottomImage],
  );

  const handleFileInput = useCallback(
    async (event: ChangeEvent<HTMLInputElement>, slot: SlotKind) => {
      const [file] = Array.from(event.target.files ?? []);
      await assignImage(slot, file);
      event.target.value = "";
    },
    [assignImage],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>, slot: SlotKind) => {
      event.preventDefault();
      setDraggingSlot(null);
      const [file] = Array.from(event.dataTransfer.files ?? []);
      await assignImage(slot, file);
    },
    [assignImage],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>, slot: SlotKind) => {
    event.preventDefault();
    setDraggingSlot(slot);
  }, []);

  const handleDragLeave = useCallback(() => setDraggingSlot(null), []);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Media
          </h2>
          <p className="text-xs text-slate-400">Upload the two frames to compare.</p>
        </div>
        <button
          type="button"
          onClick={clearImages}
          className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Clear
        </button>
      </header>

      <div className="flex flex-col gap-3">
        {( [
          ["top", topImage],
          ["bottom", bottomImage],
        ] as const ).map(([slot, image]) => {
          const isActive = draggingSlot === slot;
          return (
            <label
              key={slot}
              onDrop={(event) => void handleDrop(event, slot)}
              onDragOver={(event) => handleDragOver(event, slot)}
              onDragLeave={handleDragLeave}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-center transition hover:border-slate-500 ${isActive ? "border-sky-400 text-sky-200" : "text-slate-400"}`}
            >
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(event) => void handleFileInput(event, slot)}
              />
              <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                {friendlyLabel[slot]}
              </span>
              {imagePreview(image)}
            </label>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-950/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Orientation
            </p>
            <p className="text-[11px] text-slate-500">
              {compare.orientation === "vertical" ? "Vertical (left vs right)" : "Horizontal (top vs bottom)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setOrientation(compare.orientation === "vertical" ? "horizontal" : "vertical")
            }
            className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-slate-700"
          >
            Flip
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Divider
            </p>
            <p className="text-[11px] text-slate-500">Show reference line over the slider.</p>
          </div>
          <button
            type="button"
            onClick={toggleDivider}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${compare.showDivider ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {compare.showDivider ? "On" : "Off"}
          </button>
        </div>
      </div>
    </section>
  );
}
