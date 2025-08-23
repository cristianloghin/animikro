type AnimatableProperties =
  | 'opacity'
  | 'marginLeft'
  | 'transform'
  | 'backgroundColor';
type AnimationDuration = 'short' | 'regular' | 'long';
type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

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

function mikro(
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

mikro({ opacity: [0, 1] });

export { mikro };
