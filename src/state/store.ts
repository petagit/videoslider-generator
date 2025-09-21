import { create } from "zustand";
import type {
  AnimationSettings,
  AppState,
  CompareSettings,
  ExportOptions,
  OverlayTextStyle,
  UploadedImage,
  VideoExportOptions,
} from "./types";

const defaultOverlay: OverlayTextStyle = {
  markdown: "## Overlay headline\nAdd *Markdown* to annotate your comparison.",
  position: { xPct: 50, yPct: 50 },
  maxWidthPct: 60,
  fontFamily: "system-ui",
  fontSizePx: 28,
  color: "#ffffff",
  background: "#0f172a",
  align: "center",
};

const defaultCompare: CompareSettings = {
  sliderPct: 50,
  orientation: "vertical",
  showDivider: true,
};

const defaultExport: ExportOptions = {
  format: "mp4",
  quality: 0.92,
  includeBackground: true,
  size: "canvas",
};

const defaultAnimation: AnimationSettings = {
  durationMs: 2500,
  frameRate: 30,
  easing: "easeInOut",
  direction: "forward",
};

const defaultVideo: VideoExportOptions = {
  codec: "webm-vp9",
  resolution: { width: 1920, height: 1080 },
  bitrateKbps: 4500,
  fileName: "slider-reveal",
};

export interface AppStore extends AppState {
  setTopImage: (image?: UploadedImage) => void;
  setBottomImage: (image?: UploadedImage) => void;
  clearImages: () => void;
  setSliderPct: (pct: number) => void;
  setOrientation: (orientation: CompareSettings["orientation"]) => void;
  toggleDivider: () => void;
  setOverlayMarkdown: (markdown: string) => void;
  setOverlayFontSize: (size: number) => void;
  setOverlayColor: (color: string) => void;
  setOverlayMaxWidth: (pct: number) => void;
  setOverlayAlignment: (align: OverlayTextStyle["align"]) => void;
  setOverlayBackground: (background?: string) => void;
  setExportFormat: (format: ExportOptions["format"]) => void;
}

const revokeIfObjectUrl = (image?: UploadedImage) => {
  if (image?.src.startsWith("blob:")) {
    URL.revokeObjectURL(image.src);
  }
};

export const useAppStore = create<AppStore>((set) => ({
  topImage: undefined,
  bottomImage: undefined,
  overlay: defaultOverlay,
  compare: defaultCompare,
  exportOptions: defaultExport,
  animation: defaultAnimation,
  video: defaultVideo,
  setTopImage: (image) =>
    set((state) => {
      revokeIfObjectUrl(state.topImage);
      return { topImage: image };
    }),
  setBottomImage: (image) =>
    set((state) => {
      revokeIfObjectUrl(state.bottomImage);
      return { bottomImage: image };
    }),
  clearImages: () =>
    set((state) => {
      revokeIfObjectUrl(state.topImage);
      revokeIfObjectUrl(state.bottomImage);
      return { topImage: undefined, bottomImage: undefined };
    }),
  setSliderPct: (pct) =>
    set((state) => ({
      compare: { ...state.compare, sliderPct: Math.min(100, Math.max(0, pct)) },
    })),
  setOrientation: (orientation) =>
    set((state) => ({ compare: { ...state.compare, orientation } })),
  toggleDivider: () =>
    set((state) => ({ compare: { ...state.compare, showDivider: !state.compare.showDivider } })),
  setOverlayMarkdown: (markdown) =>
    set((state) => ({ overlay: { ...state.overlay, markdown } })),
  setOverlayFontSize: (size) =>
    set((state) => ({ overlay: { ...state.overlay, fontSizePx: size } })),
  setOverlayColor: (color) =>
    set((state) => ({ overlay: { ...state.overlay, color } })),
  setOverlayMaxWidth: (pct) =>
    set((state) => ({ overlay: { ...state.overlay, maxWidthPct: pct } })),
  setOverlayAlignment: (align) =>
    set((state) => ({ overlay: { ...state.overlay, align } })),
  setOverlayBackground: (background) =>
    set((state) => ({ overlay: { ...state.overlay, background } })),
  setExportFormat: (format) =>
    set((state) => ({ exportOptions: { ...state.exportOptions, format } })),
}));
