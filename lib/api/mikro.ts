import { Duration, Easing, MikroAnimation } from "../types";

const durationMapping: Record<Duration, number> = {
  short: 240,
  regular: 360,
  long: 520,
};

const easingMapping: Record<Easing, string> = {
  linear: "linear",
  "ease-in": "cubic-bezier(0.5, 0.1, 0.5, 0.8)",
  "ease-out": "cubic-bezier(0.5, 0.2, 0.5, 1.0)",
  "ease-in-out": "cubic-bezier(0.6, 0.1, 0.2, 0.9)",
};

export type MikroKeyframes = {
  fade?: number[];
  move?: [number | string, number | string][];
  slide?: [number | string, number | string][];
  background?: `#${string}`[];
};

function fade(values: number[]) {
  return {
    opacity: values,
  };
}

function move(values: [number | string, number | string][]) {
  return {
    margin: values.map(
      (value) =>
        `${typeof value[1] === "number" ? value[1] + "px" : value[1]} 0 0 ${
          typeof value[0] === "number" ? value[0] + "px" : value[0]
        }`
    ),
  };
}

function slide(values: [number | string, number | string][]) {
  return {
    transform: values.map(
      (value) =>
        `translate3D(${
          typeof value[0] === "number" ? value[0] + "px" : value[0]
        }, ${typeof value[1] === "number" ? value[1] + "px" : value[1]}, 0)`
    ),
  };
}

function background(values: `#${string}`[]) {
  return {
    backgroundColor: values,
  };
}

export function mikro(
  keyframes: MikroKeyframes,
  duration?: Duration | number,
  easing?: Easing
): MikroAnimation {
  let normalizedKeyframes = {};

  if (keyframes.fade) {
    normalizedKeyframes = { ...normalizedKeyframes, ...fade(keyframes.fade) };
  }

  if (keyframes.move) {
    normalizedKeyframes = { ...normalizedKeyframes, ...move(keyframes.move) };
  }

  if (keyframes.slide) {
    normalizedKeyframes = { ...normalizedKeyframes, ...slide(keyframes.slide) };
  }

  if (keyframes.background) {
    normalizedKeyframes = {
      ...normalizedKeyframes,
      ...background(keyframes.background),
    };
  }

  return {
    keyframes: normalizedKeyframes,
    options: {
      duration: duration
        ? typeof duration === "number"
          ? duration
          : durationMapping[duration]
        : durationMapping["regular"],
      easing: easing ? easingMapping[easing] : easingMapping["linear"],
      fill: "both",
    },
  };
}
