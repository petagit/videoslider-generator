import type { FC } from "react";

declare module "remotion" {
  export const AbsoluteFill: FC<Record<string, unknown>>;
  export const Audio: FC<Record<string, unknown>>;
  export const Img: FC<Record<string, unknown>>;
  export const Easing: any;
  export function interpolate(...args: any[]): number;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): {
    durationInFrames: number;
    width: number;
    height: number;
  };
  export const Composition: FC<Record<string, unknown>>;
  export function registerRoot(comp: FC<any>): void;
}
