import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from 'react';
import animationAgent, {
  AgentObserver,
  AnimationAgent,
} from './AnimationAgent';
import { AnimationOptions } from './main';

interface AnimatedElement extends React.FC<PropsWithChildren> {}

function useAnimikro(
  key: string,
  animationOptions: AnimationOptions
): [
  AnimatedElement,
  { start: () => void; pause: () => void },
  AnimationPlayState
] {
  const { keyframes, options } = animationOptions;
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [playState, setPlayState] = useState<AnimationPlayState>('paused');

  const observer = useMemo<AgentObserver>(
    () => ({
      update: (agent) => {
        if (agent instanceof AnimationAgent) {
          const anim = agent.getAnimation(key);
          if (anim) {
            setPlayState(anim.playState);
          }
        }
      },
    }),
    [key]
  );

  useEffect(() => {
    if (!elementRef.current) return;

    // Create animation
    const animation = elementRef.current.animate(keyframes, options);

    animation.onfinish = () => {
      animationAgent.notifyObservers();
    };

    // Pause animation initially
    animation.pause();

    // Store the animation in the Agent
    animationAgent.setAnimation(key, animation);
    animationAgent.addObserver(observer);

    return () => {
      animationAgent.removeAnimation(key);
      animationAgent.removeObserver(observer);
    };
  }, [key, keyframes, options, observer]);

  const startAnimation = useCallback(() => animationAgent.start(key), [key]);
  const pauseAnimation = useCallback(() => animationAgent.pause(key), [key]);

  const Animated = useMemo<AnimatedElement>(() => {
    return ({ children }) => <div ref={elementRef}>{children}</div>;
  }, []);

  return [
    Animated,
    {
      start: startAnimation,
      pause: pauseAnimation,
    },
    playState,
  ];
}

export { useAnimikro };
