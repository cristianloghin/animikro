import { useAnimikro, mikro2 } from '../lib/main';

const boxAnimation = mikro2(
  {
    opacity: [0, 1],
    transform: ['translateY(-100px)', 'translateY(0)'],
    easing: 'easeIn',
  },
  'long'
);

const contentAnimation = mikro2(
  { opacity: [0, 1], transform: ['translatex(-100px)', 'translateX(0)'] },
  'short'
);

export function Other() {
  const [Box] = useAnimikro(
    'container',
    { in: boxAnimation },
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
