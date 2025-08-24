/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  CSSProperties,
  createElement,
} from "react";
import manager from "../core/Animikro";
import { AnimationDefinition, Observer } from "../types";

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
  const [playState, setPlayState] = useState<AnimationPlayState>("idle");
  const [shouldRender, setShouldRender] = useState(false);
  const key = useMemo(
    () => manager.registerAnimationDefinition(animationDef),
    [animationDef]
  );

  const observer = useCallback<Observer>(
    (system) => {
      const anim = system.getAnimation(key);
      if (anim) {
        setPlayState((current) =>
          current === anim.playState ? current : anim.playState
        );
      }
    },
    [key]
  );

  useEffect(() => {
    manager.addObserver(key, observer);

    return () => {
      manager.removeObserver(key);
    };
  }, [key, observer]);

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
    [
      mount,
      key,
      animationDef.in.keyframes,
      animationDef.in.options,
      options?.autoPlay,
      options?.onFinished,
    ] // More specific dependencies
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
  }, [setRef, shouldRender, options]);

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
    playState,
  };
}

export { useAnimikro };
