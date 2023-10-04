// export { useAnimikro } from './useAnimikro';
export { useAnimikro } from './useAnimikro';
export { useAnimikroAgent } from './useAnimikroAgent';
export { configurePants } from './configurePants';
export { mikro, mikro2 } from './mikro.ts';

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

export function uniqueLabelGenerator(root: string): string {
  const charset = '01234abcdefghijklmnopqrstuvwxyz56789';
  let result = root + '-';

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
}
