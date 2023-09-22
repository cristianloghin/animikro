export { useAnimikro } from './useAnimikro';
export { configurePants } from './configurePants';

export type AnimationOptions = {
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null;
  options?: number | KeyframeAnimationOptions | undefined;
};
