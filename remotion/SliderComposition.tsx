import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface SliderCompositionProps {
  topImage: string;
  bottomImage: string;
  compare: {
    orientation: "vertical" | "horizontal";
    showDivider: boolean;
  };
  overlay: {
    markdown: string;
    fontSizePx: number;
    color: string;
    background: string | null;
    maxWidthPct: number;
    align: "left" | "center" | "right";
  };
  animation: {
    durationMs: number;
    frameRate: number;
    easing: "linear" | "easeIn" | "easeOut" | "easeInOut";
    direction: "forward" | "reverse" | "pingpong";
  };
}

const easingMap: Record<SliderCompositionProps["animation"]["easing"], (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => Easing.in(Easing.cubic)(t),
  easeOut: (t) => Easing.out(Easing.cubic)(t),
  easeInOut: (t) => Easing.inOut(Easing.cubic)(t),
};

const directionMap = (
  direction: SliderCompositionProps["animation"]["direction"],
  value: number,
): number => {
  switch (direction) {
    case "forward":
      return value;
    case "reverse":
      return 1 - value;
    case "pingpong":
      return value <= 0.5 ? value * 2 : 2 - value * 2;
    default:
      return value;
  }
};

const overlayStyle = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    lineHeight: 1.5,
    margin: 0,
  } satisfies React.CSSProperties,
  heading: {
    fontWeight: 700,
    letterSpacing: "-0.01em",
    margin: 0,
  } satisfies React.CSSProperties,
  paragraph: {
    margin: 0,
  } satisfies React.CSSProperties,
  list: {
    margin: 0,
    paddingLeft: "1.25em",
  } satisfies React.CSSProperties,
  link: {
    color: "#38bdf8",
    textDecoration: "underline",
  } satisfies React.CSSProperties,
};

export const SliderComposition: React.FC<SliderCompositionProps> = ({
  topImage,
  bottomImage,
  compare,
  overlay,
  animation,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const progress = (() => {
    const base = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
      easing: easingMap[animation.easing],
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return directionMap(animation.direction, base);
  })();

  const percentage = progress * 100;

  const clipPath = compare.orientation === "vertical"
    ? `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`
    : `polygon(0 0, 100% 0, 100% ${percentage}%, 0 ${percentage}%)`;

  const dividerStyle = (() => {
    if (!compare.showDivider) {
      return undefined;
    }

    if (compare.orientation === "vertical") {
      return {
        left: `${percentage}%`,
        top: 0,
        bottom: 0,
        width: 4,
      } satisfies React.CSSProperties;
    }

    return {
      top: `${percentage}%`,
      left: 0,
      right: 0,
      height: 4,
    } satisfies React.CSSProperties;
  })();

  const overlayBoxStyle: React.CSSProperties = {
    maxWidth: `${overlay.maxWidthPct}%`,
    fontSize: `${overlay.fontSizePx}px`,
    color: overlay.color,
    backgroundColor: overlay.background ?? "transparent",
    padding: overlay.background ? "32px" : "0",
    borderRadius: overlay.background ? "24px" : "0",
    textAlign: overlay.align,
    marginLeft: overlay.align === "left" ? 0 : overlay.align === "center" ? "auto" : "auto",
    marginRight: overlay.align === "right" ? 0 : overlay.align === "center" ? "auto" : "auto",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      <AbsoluteFill style={{ transform: "scale(1.02)" }}>
        {bottomImage ? (
          <Img src={bottomImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <AbsoluteFill style={{ background: "linear-gradient(135deg,#1f2937,#0f172a)" }} />
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ clipPath, transform: "scale(1.02)" }}>
        {topImage ? (
          <Img src={topImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <AbsoluteFill style={{ background: "linear-gradient(135deg,#312e81,#0f172a)" }} />
        )}
      </AbsoluteFill>

      {dividerStyle ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            ...dividerStyle,
            backgroundColor: "rgba(56,189,248,0.75)",
            transform: compare.orientation === "vertical" ? "translateX(-2px)" : "translateY(-2px)",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: `${Math.round(height * 0.08)}px ${Math.round(width * 0.06)}px`,
          pointerEvents: "none",
        }}
      >
        <div style={overlayBoxStyle}>
          {overlay.markdown.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: (props) => <h1 style={overlayStyle.heading} {...props} />,
                h2: (props) => <h2 style={overlayStyle.heading} {...props} />,
                h3: (props) => <h3 style={overlayStyle.heading} {...props} />,
                h4: (props) => <h4 style={overlayStyle.heading} {...props} />,
                p: (props) => <p style={overlayStyle.paragraph} {...props} />,
                ul: (props) => <ul style={overlayStyle.list} {...props} />,
                ol: (props) => <ol style={overlayStyle.list} {...props} />,
                a: (props) => <a style={overlayStyle.link} {...props} />,
              }}
            >
              {overlay.markdown}
            </ReactMarkdown>
          ) : (
            <p style={{ ...overlayStyle.paragraph, color: "#cbd5f5" }}>
              Add Markdown in the editor to see it here.
            </p>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
