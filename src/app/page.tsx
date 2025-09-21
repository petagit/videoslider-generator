import { ExportPanel } from "../components/export-panel";
import { MediaPanel } from "../components/media-panel";
import { OverlayPanel } from "../components/overlay-panel";
import { PreviewStage } from "../components/preview-stage";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:gap-8">
        <aside className="flex w-full flex-col gap-6 lg:w-[360px]">
          <MediaPanel />
          <OverlayPanel />
          <ExportPanel />
        </aside>
        <main className="flex w-full flex-1 flex-col">
          <PreviewStage />
        </main>
      </div>
    </div>
  );
}
