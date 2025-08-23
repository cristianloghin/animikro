import { useAnimikro, mikro } from '../lib/main';

const boxAnimation = mikro(
  {
    opacity: [0, 1],
    transform: ['translateY(-100px)', 'translateY(0)'],
    easing: 'easeIn',
  },
  'long'
);

const translateY = (keyframes: Array<`${string}%` | number>) => ({
  transform: keyframes.map(
    (frame) => `translateY(${typeof frame === 'number' ? frame + 'px' : frame})`
  ),
});

const opacity = (keyframes: number[]) => ({ opacity: keyframes });

type Entrance = 'in' | 'out';
type Direction = 'top';
type Value = '0' | '50' | '100';

interface Animations {
  fade(enter: Entrance): { opacity: number[] };
  slide(
    enter: Entrance,
    direction: Direction,
    value: Value
  ): { transform: string[] };
}

class Animikro implements Animations {
  fade(enter: Entrance) {
    return enter === 'in' ? opacity([0, 1]) : opacity([1, 0]);
  }

  slide(enter: Entrance, direction: Direction, value: Value) {
    return enter === 'in' ? translateY(['-100%', 0]) : translateY([0, '-100%']);
  }
}

type Fade = `fade-${Entrance}`;
type Slide = `slide-${Entrance}-${Direction}-${Value}`;

const animikro = (
  animations: Array<Fade | Slide>,
  duration: number,
  easing: string
) => {
  const animikro = new Animikro();

  return {
    keyframes: Object.fromEntries(
      animations.map((animation) => {
        const method = animation.split('-')[0] as keyof Animations;
        const args = animation.split('-').slice(1);

        return Object.entries(animikro[method](args))[0];
      })
    ),
    options: { duration, easing },
  };
};

const boxAnimation2 = animikro(['fade-in', 'slide-in-top-100'], 360, 'ease-in');

console.log('🚀', boxAnimation2);

const contentAnimation = mikro(
  { opacity: [0, 1], transform: ['translatex(-100px)', 'translateX(0)'] },
  'short'
);

export function Other() {
  const [Box] = useAnimikro(
    'container',
    { in: boxAnimation2 },
    {
      onFinished: () => contentController.start(),
    }
  );
  const [Content, contentController] = useAnimikro(
    'content',
    { in: contentAnimation },
    {
      autoPlay: false,
    }
  );

  return (
    <>
      <h1>Animikro</h1>
      <Box style={{ padding: 30, backgroundColor: 'navy' }}>
        <Content>Some content in box</Content>
      </Box>
    </>
  );
}
