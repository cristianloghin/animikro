/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  CSSProperties,
  createElement,
} from 'react';
import manager, { Observer, Manager } from './Manager';
import { AnimationOptions } from './main';

type AnimatedElement = React.FC<
  {
    children?: React.ReactNode;
  } & {
    style?: CSSProperties | undefined;
  } & React.HTMLProps<HTMLDivElement>
>;

function useAnimikro(
  key: string,
  animation: {
    in: AnimationOptions;
    out?: AnimationOptions;
    hover?: AnimationOptions;
  },
  options?: {
    element?: keyof React.ReactHTML;
    autoPlay?: boolean;
    onFinished?: () => void;
  },
  mount = true
): [
  AnimatedElement,
  { start: () => void; pause: () => void; reverse: () => void },
  AnimationPlayState
] {
  const [playState, setPlayState] = useState<AnimationPlayState>('idle');
  const [shouldRender, setShouldRender] = useState(mount);

  const observer = useMemo<Observer>(
    () => ({
      update: (manager) => {
        if (manager instanceof Manager) {
          const anim = manager.getAnimation(key);
          if (anim) {
            setPlayState(anim.playState);
          }
        }
      },
    }),
    []
  );

  useEffect(() => {
    if (mount) {
      manager.addObserver(key, observer);
      setShouldRender(true);
    }
  }, [mount]);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && mount) {
        // Animate in
        const anim = node.animate(animation.in.keyframes, animation.in.options);

        // On finish callback
        anim.onfinish = () => {
          if (options?.onFinished) {
            options.onFinished();
          }
          manager.notifyObservers(key);
        };

        // Store the animation in the Manager
        manager.setAnimation(key, anim);

        // Pause on start
        if (options?.autoPlay === false) {
          manager.pause(key);
        }
      } else if (node && !mount) {
        if (animation.out) {
          // Animate out
          const anim = node.animate(
            animation.out.keyframes,
            animation.out.options
          );
          anim.onfinish = () => {
            setShouldRender(false);

            manager.removeAnimation(key);
            manager.removeObserver(key);

            if (options?.onFinished) {
              options.onFinished();
            }
          };
        } else {
          // Remove component
          setShouldRender(false);
          manager.removeAnimation(key);
          manager.removeObserver(key);

          if (options?.onFinished) {
            options.onFinished();
          }
        }
      }
    },
    [mount]
  );

  const Animation = useMemo<AnimatedElement>(() => {
    return (props) =>
      shouldRender
        ? createElement(
            options?.element || 'div',
            {
              ref: setRef,
              style: { ...props.style, willChange: 'auto' },
              onMouseEnter: props.onMouseEnter,
              onMouseOver: props.onMouseOver,
              onMouseLeave: props.onMouseLeave,
              onMouseOut: props.onMouseOut,
              onClick: props.onClick,
            },
            props.children
          )
        : null;
  }, [setRef, shouldRender]);

  const startAnimation = useCallback(() => manager.start(key), [key]);
  const pauseAnimation = useCallback(() => manager.pause(key), [key]);
  const reverseAnimation = useCallback(() => manager.reverse(key), [key]);

  return [
    Animation,
    {
      start: startAnimation,
      pause: pauseAnimation,
      reverse: reverseAnimation,
    },
    playState,
  ];
}

// export { useAnimikro, useAnimikro };
export { useAnimikro };
