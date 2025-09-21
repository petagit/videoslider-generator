import { Composition } from "remotion";
import { SliderComposition, type SliderCompositionProps } from "./SliderComposition";

const defaultOverlay: SliderCompositionProps["overlay"] = {
  markdown: "## Overlay headline\nExplain your comparison with Markdown.",
  fontSizePx: 48,
  color: "#ffffff",
  background: "rgba(15,23,42,0.72)",
  maxWidthPct: 60,
  align: "center",
};

const defaultAnimation: SliderCompositionProps["animation"] = {
  durationMs: 3000,
  frameRate: 30,
  easing: "easeInOut",
  direction: "forward",
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="slider-reveal"
    component={SliderComposition}
    durationInFrames={Math.round((defaultAnimation.durationMs / 1000) * defaultAnimation.frameRate)}
    fps={defaultAnimation.frameRate}
    width={1920}
    height={1080}
    defaultProps={{
      topImage: "",
      bottomImage: "",
      compare: { orientation: "vertical", showDivider: true },
      overlay: defaultOverlay,
      animation: defaultAnimation,
    }}
  />
);
