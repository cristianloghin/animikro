export interface AnimationOptions {
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  options?: number | KeyframeAnimationOptions | undefined;
}

export type AnimationConfig = {
  autoPlay: boolean;
  mount: boolean;
  onFinished: () => void;
  onUnmount: () => void;
};

export interface AnimationDefinition {
  name: string;
  in: AnimationOptions;
  out?: AnimationOptions;
  hover?: AnimationOptions;
}

export type Duration = "short" | "regular" | "long";
export type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export type MikroAnimation = {
  keyframes: PropertyIndexedKeyframes;
  options?: KeyframeAnimationOptions;
};

export interface AnimikroInterface {
  getAnimation(key: string): Animation | undefined;
}
