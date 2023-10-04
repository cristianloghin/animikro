import { CSSProperties, PropsWithChildren, useCallback } from 'react';
import manager from './Manager';
import { AnimationConfig, AnimationOptions } from './main';

type AnimatedCompontentProps = PropsWithChildren<{
  id: string;
  animationOptions: AnimationOptions;
  style?: CSSProperties;
  config?: Partial<AnimationConfig>;
}>;

function AnimatedComponent({
  children,
  style,
  animationOptions,
  id,
  config,
}: AnimatedCompontentProps) {
  const { keyframes, options } = animationOptions;

  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const animation = node.animate(keyframes, options);

      // On finish callback
      animation.onfinish = () => {
        manager.notifyObservers();
        if (config?.onFinished) {
          config.onFinished();
        }
      };

      // Pause animation initially
      if (config?.autoPlay === false) {
        animation.pause();
      }

      // Store the animation in the Manager
      manager.setAnimation(id, animation);
    }
  }, []);

  return (
    <div
      style={style ? { ...style, willChange: 'auto' } : { willChange: 'auto' }}
      ref={setRef}
    >
      {children}
    </div>
  );
}

export { AnimatedComponent };
