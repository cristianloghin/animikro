import { useAnimikro, AnimationOptions } from '../lib/main';
import { Other } from './Other';

const animationOptions: AnimationOptions = {
  keyframes: [
    { opacity: 0, transform: 'translateX(-100px)' },
    { opacity: 1, transform: 'translateX(0)', color: 'pink' },
  ],
  options: {
    duration: 3000,
    fill: 'forwards',
    easing: 'cubic-bezier(0.42, 0.0, 1.0, 1.0)',
  },
};

export function Animal() {
  const [Element, controller, state] = useAnimikro('heading', animationOptions);

  return (
    <div>
      <Other />
      <h2>{state}</h2>
      <Element>
        <h2>I'm a controlled animated element!</h2>
      </Element>
      <button onClick={controller.start}>Start</button>
      <button onClick={controller.pause}>Pause</button>
    </div>
  );
}
