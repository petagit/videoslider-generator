/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, DragEvent, MouseEvent, useCallback, useMemo, useState } from "react";
import { useAppStore } from "../state/store";
import type { UploadedImage } from "../state/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

type SlotKind = "top" | "bottom";

interface DragTarget {
  pairIndex: number;
  slot: SlotKind;
}

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
    return <span className="text-xs font-medium text-slate-400">Drop image or browse</span>;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <img src={image.src} alt={image.alt} className="h-32 w-full rounded-md object-cover" />
      <div className="text-[11px] font-medium leading-tight text-slate-300">
        <p className="truncate">{image.alt}</p>
        <p>
          {image.naturalWidth} × {image.naturalHeight}
        </p>
      </div>
    </div>
  );
};

const slotLabel = (slot: SlotKind, index: number) =>
  `${slot === "top" ? "Top" : "Bottom"} photo ${index + 1}`;

export function MediaPanel() {
  const photoPairs = useAppStore((state) => state.photoPairs);
  const activePairIndex = useAppStore((state) => state.activePairIndex);
  const compare = useAppStore((state) => state.compare);
  const setPhotoAt = useAppStore((state) => state.setPhotoAt);
  const addPhotoPair = useAppStore((state) => state.addPhotoPair);
  const removePhotoPair = useAppStore((state) => state.removePhotoPair);
  const setActivePairIndex = useAppStore((state) => state.setActivePairIndex);
  const clearImages = useAppStore((state) => state.clearImages);
  const setOrientation = useAppStore((state) => state.setOrientation);
  const toggleDivider = useAppStore((state) => state.toggleDivider);

  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const assignImage = useCallback(
    async (pairIndex: number, slot: SlotKind, file?: File) => {
      if (!file || !ACCEPTED_TYPES.includes(file.type)) {
        return;
      }
      const uploaded = await buildUploadedImage(file);
      setPhotoAt(pairIndex, slot, uploaded);
    },
    [setPhotoAt],
  );

  const handleFileInput = useCallback(
    async (event: ChangeEvent<HTMLInputElement>, pairIndex: number, slot: SlotKind) => {
      const [file] = Array.from(event.target.files ?? []);
      await assignImage(pairIndex, slot, file);
      event.target.value = "";
    },
    [assignImage],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>, pairIndex: number, slot: SlotKind) => {
      event.preventDefault();
      setDragTarget(null);
      const [file] = Array.from(event.dataTransfer.files ?? []);
      await assignImage(pairIndex, slot, file);
    },
    [assignImage],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>, pairIndex: number, slot: SlotKind) => {
    event.preventDefault();
    setDragTarget({ pairIndex, slot });
  }, []);

  const handleDragLeave = useCallback(() => setDragTarget(null), []);

  const handleRemoveImage = useCallback(
    (event: MouseEvent<HTMLButtonElement>, pairIndex: number, slot: SlotKind) => {
      event.preventDefault();
      event.stopPropagation();
      setPhotoAt(pairIndex, slot, undefined);
    },
    [setPhotoAt],
  );

  const hasIncompletePair = useMemo(
    () => photoPairs.some((pair) => !pair.top || !pair.bottom),
    [photoPairs],
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Media</h2>
          <p className="text-xs text-slate-400">Upload matching photo pairs to build sequential cuts.</p>
        </div>
        <button
          type="button"
          onClick={clearImages}
          className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Clear
        </button>
      </header>

      <div className="flex flex-col gap-4">
        {photoPairs.map((pair, index) => {
          const topImage = pair.top;
          const bottomImage = pair.bottom;
          const isComplete = Boolean(topImage && bottomImage);
          return (
            <div key={pair.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Pair {index + 1}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${isComplete ? "text-emerald-300" : "text-amber-300"}`}
                  >
                    {isComplete ? "Ready" : "Add both photos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePairIndex(index)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${
                      activePairIndex === index
                        ? "bg-sky-500/30 text-sky-100"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    Preview
                  </button>
                  {photoPairs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removePhotoPair(index)}
                      className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {( [
                  ["top", topImage],
                  ["bottom", bottomImage],
                ] as const ).map(([slot, image]) => {
                  const isDragging = dragTarget?.pairIndex === index && dragTarget.slot === slot;
                  return (
                    <label
                      key={slot}
                      onDrop={(event) => void handleDrop(event, index, slot)}
                      onDragOver={(event) => handleDragOver(event, index, slot)}
                      onDragLeave={handleDragLeave}
                      className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-center transition hover:border-slate-500 ${
                        isDragging ? "border-sky-400 text-sky-200" : "text-slate-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        className="hidden"
                        onChange={(event) => void handleFileInput(event, index, slot)}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {slotLabel(slot, index)}
                      </span>
                      <div className="relative w-full">
                        {imagePreview(image)}
                        {image ? (
                          <button
                            type="button"
                            onClick={(event) => handleRemoveImage(event, index, slot)}
                            className="absolute right-2 top-2 rounded-full bg-slate-900/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-slate-800"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={addPhotoPair}
          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Add photo pair
        </button>
        {hasIncompletePair ? (
          <p className="text-[11px] text-amber-300">
            Add both top and bottom photos for every pair to enable seamless cuts.
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-950/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Orientation</p>
            <p className="text-[11px] text-slate-500">
              {compare.orientation === "vertical" ? "Vertical (left vs right)" : "Horizontal (top vs bottom)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOrientation(compare.orientation === "vertical" ? "horizontal" : "vertical")}
            className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-slate-700"
          >
            Flip
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Divider</p>
            <p className="text-[11px] text-slate-500">Show reference line over the slider.</p>
          </div>
          <button
            type="button"
            onClick={toggleDivider}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${
              compare.showDivider
                ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {compare.showDivider ? "On" : "Off"}
          </button>
        </div>
      </div>
    </section>
  );
}
