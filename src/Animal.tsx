import { useAnimikro, mikro2 } from '../lib/main';
import { Other } from './Other';

export function Animal() {
  const [Element, controller, state] = useAnimikro(
    'heading',
    {
      in: mikro2(
        {
          fade: [0, 1],
          slide: [
            ['-100%', 0],
            [0, 0],
          ],
        },
        'long',
        'ease-in'
      ),
    },
    { autoPlay: false }
  );

  return (
    <div>
      <Other />
      <h2>{state}</h2>
      <Element>
        <h2>I'm a controlled animated element!</h2>
      </Element>
      <button onClick={() => controller.start()}>Start</button>
      <button onClick={controller.pause}>Pause</button>
    </div>
  );
}
