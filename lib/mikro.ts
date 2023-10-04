import { AnimationOptions } from './main';

type AnimatableProperties =
  | 'opacity'
  | 'marginLeft'
  | 'transform'
  | 'backgroundColor';
type AnimationDuration = 'short' | 'regular' | 'long';
type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
type KeyframeValue = string | number;

const durationMapping: Record<AnimationDuration, number> = {
  short: 200,
  regular: 360,
  long: 520,
};

const easingMapping: Record<AnimationEasing, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.5, 0.1, 0.5, 0.8)',
  easeOut: 'cubic-bezier(0.5, 0.2, 0.5, 1.0)',
  easeInOut: 'ease-in-out',
};

function mikro(
  property: AnimatableProperties,
  keyframes: KeyframeValue[],
  duration: AnimationDuration | number = 'regular',
  easing: AnimationEasing = 'linear'
): AnimationOptions {
  const actualDuration =
    typeof duration === 'number' ? duration : durationMapping[duration];

  // Convert the keyframes to the object format that Web Animations API expects
  const keyframesObjectArray = keyframes.map((frame) => ({
    [property]: typeof frame === 'string' ? frame : `${frame}px`,
  }));

  // Return the animation options
  return {
    keyframes: keyframesObjectArray,
    options: {
      duration: actualDuration,
      easing: easingMapping[easing],
      fill: 'both',
    },
  };
}

export { mikro };

export interface AnimationOptions2 {
  keyframes: PropertyIndexedKeyframes;
  options?: number | KeyframeAnimationOptions | undefined;
}

type KF2 = {
  [property in AnimatableProperties]?:
    | string
    | string[]
    | number
    | null
    | (number | null)[]
    | undefined;
} & {
  composite?: CompositeOperationOrAuto | CompositeOperationOrAuto[];
  easing?: AnimationEasing | AnimationEasing[];
  offset?: number | (number | null)[];
};

function mikro2(
  keyframes: KF2,
  duration: AnimationDuration | number = 'regular'
): AnimationOptions2 {
  const actualDuration =
    typeof duration === 'number' ? duration : durationMapping[duration];

  const actualEasing = keyframes.easing
    ? Array.isArray(keyframes.easing)
      ? keyframes.easing.map((e) => easingMapping[e])
      : easingMapping[keyframes.easing]
    : 'linear';

  return {
    keyframes: { ...keyframes, easing: actualEasing },
    options: {
      duration: actualDuration,
      fill: 'both',
    },
  };
}

mikro2({ opacity: [0, 1] });

export { mikro2 };
