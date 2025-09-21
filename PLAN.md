# Image Slider Video – Prototype Plan

## 1. Product Snapshot
- **Core Idea**: Web app to compare two images with a draggable reveal slider, overlay Markdown-formatted text, then export as still image or animated video.
- **Target Users**: Designers, marketers, educators who need before/after reveals or annotated comparisons.
- **Success Signals**: Smooth slider interaction, accessible controls, reliable export pipeline.

## 2. Experience Pillars
- **Clarity**: Minimal UI, immediate preview updates, sensible defaults.
- **Control**: Fine-grained slider position, markdown styling knobs, export presets.
- **Shareability**: Fast export flows (PNG/WebP/WebM), easy state restoration.

## 3. Roadmap (Prototype → Alpha)
1. **Prototype (now)**
   - Upload placeholders (top/bottom) with drag-and-drop & file picker.
   - Slider mock wired to placeholder images.
   - Markdown editor with live preview overlay.
   - Layout + state store scaffold (Zustand).
2. **Alpha**
   - Export still image via `html-to-image`.
   - Persist settings in localStorage; shareable URL serialization.
   - Keyboard + screen reader support for slider and controls.
3. **Beta**
   - Video export via WebCodecs/MediaRecorder fallback chain.
   - Progress UI; cancelable rendering; background worker integration.
4. **Polish**
   - Templates/presets, multi-overlay support, undo/redo, theming.

## 4. Architecture Snapshot
- **Frontend**: Next.js App Router + Tailwind, React 19, TypeScript strict.
- **State**: Lightweight global store (`zustand`) for images, overlay, export settings.
- **Rendering**: CSS clip-path for live slider; canvas/worker pipeline for exports.
- **Security**: Sanitize Markdown via DOMPurify before injecting into preview.

## 5. UI Skeleton (Prototype Scope)
- **Shell**: Two-column layout (controls left, preview right); responsive to stack on mobile.
- **Panels**:
  - `MediaPanel`: Upload slots, orientation toggle, divider toggle.
  - `OverlayPanel`: Markdown editor, typography controls.
  - `ExportPanel`: Format dropdown, stub actions.
- **Preview Area**: Fixed-aspect stage showing stacked images, draggable slider, overlay layer.
- **Status Bar**: Inline hints, warnings, export progress placeholder.

## 6. Data Contracts (Initial)
```ts
export interface UploadedImage {
  id: string;
  src: string;
  alt: string;
}

export interface CompareState {
  sliderPct: number; // 0 - 100
  orientation: "vertical" | "horizontal";
  showDivider: boolean;
}

export interface OverlayState {
  markdown: string;
  fontSize: number;
  color: string;
  maxWidthPct: number;
}

export interface ExportState {
  format: "png" | "jpeg" | "webp" | "webm";
}

export interface AppState {
  topImage?: UploadedImage;
  bottomImage?: UploadedImage;
  compare: CompareState;
  overlay: OverlayState;
  export: ExportState;
}
```

## 7. Validation Checklist
- Slider responds under 16ms/frame at 1080p images.
- Markdown preview sanitization prevents script injection.
- Keyboard slider control & focus order meet WCAG 2.1 AA.
- Exported image/video matches on-canvas composition (position, colors, typography).

## 8. Open Questions
- How heavy can video exports be before requiring server-side assist?
- Which share format resonates most with target users (direct download vs. signed URL)?
- Should overlays support multiple blocks out of the gate?

## 9. Immediate Next Steps
1. Build state slices + hooks for compare/overlay/export.
2. Flesh out preview canvas with mock images and slider interaction.
3. Wire markdown editor preview with sanitization.
4. Add export button plumbing (no-op until export pipeline lands).
