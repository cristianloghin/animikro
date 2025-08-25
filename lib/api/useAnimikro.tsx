/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  CSSProperties,
  createElement,
  useSyncExternalStore,
} from "react";
import manager from "../core/Animikro";
import { AnimationDefinition } from "../types";

type AnimatedElement = React.FC<
  {
    children?: React.ReactNode;
  } & {
    style?: CSSProperties | undefined;
  } & React.HTMLProps<HTMLDivElement>
>;

function useAnimikro(
  animationDef: AnimationDefinition,
  options?: {
    element?: keyof React.ReactHTML;
    autoPlay?: boolean;
    onFinished?: () => void;
    mount?: boolean;
  }
): {
  Animation: AnimatedElement;
  controller: {
    start: () => void;
    pause: () => void;
    reverse: () => void;
  };
  playState: AnimationPlayState;
} {
  const mount = options?.mount ?? true;
  const key = useMemo(
    () => manager.registerAnimationDefinition(animationDef),
    [animationDef]
  );

  const animationState = useSyncExternalStore(
    (cb) => manager.subscribe(key, cb),
    () => manager.getSnapshot(key)
  );

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (mount) {
      setShouldRender(true);
    }
  }, [mount]);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && mount) {
        // Check if animation already exists to prevent duplicates
        if (manager.getAnimation(key)) {
          console.log(`Animation ${key} already exists, skipping creation`);
          return;
        }

        // Animate in
        const anim = node.animate(
          animationDef.in.keyframes,
          animationDef.in.options
        );

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
        if (animationDef.out) {
          // Animate out
          const anim = node.animate(
            animationDef.out.keyframes,
            animationDef.out.options
          );
          anim.onfinish = () => {
            setShouldRender(false);

            manager.removeAnimation(key);

            if (options?.onFinished) {
              options.onFinished();
            }
          };
        } else {
          // Remove component
          setShouldRender(false);
          manager.removeAnimation(key);

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
            options?.element || "div",
            {
              ref: setRef,
              style: { ...props.style, willChange: "auto" },
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

  const controller = useMemo(() => {
    return {
      start: startAnimation,
      pause: pauseAnimation,
      reverse: reverseAnimation,
    };
  }, [startAnimation, pauseAnimation, reverseAnimation]);

  return {
    Animation,
    controller,
    playState: animationState,
  };
}

export { useAnimikro };
