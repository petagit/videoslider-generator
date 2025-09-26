import { Composition } from "remotion";
import { SliderComposition, type SliderCompositionProps } from "./SliderComposition";

const defaultOverlay: SliderCompositionProps["overlay"] = {
  markdown: "## Overlay headline\nExplain your comparison with Markdown.",
  fontFamily: "'Geist', 'Geist Variable', 'Helvetica Neue', Arial, sans-serif",
  fontSizePx: 64,
  color: "#ffffff",
  background: null,
  maxWidthPct: 60,
  align: "center",
  borderColor: "#000000",
  borderWidthPx: 2,
  borderStyle: "solid",
  borderRadiusPx: 24,
};

const defaultAnimation: SliderCompositionProps["animation"] = {
  durationMs: 11000,
  frameRate: 30,
  easing: "easeInOut",
  direction: "forward",
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="slider-reveal"
    component={SliderComposition}
    // TikTok 9:16 portrait, safe zone 1080x1920
    durationInFrames={Math.round((defaultAnimation.durationMs / 1000) * defaultAnimation.frameRate)}
    fps={defaultAnimation.frameRate}
    width={1080}
    height={1920}
    defaultProps={{
      topImages: [""],
      bottomImages: [""],
      compare: { orientation: "vertical", showDivider: true },
      overlay: defaultOverlay,
      animation: defaultAnimation,
    }}
  />
);
