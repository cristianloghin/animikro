import { CSSProperties, useMemo } from 'react';
import { useAnimikro } from '../../lib/useAnimikro';
import { uniqueLabelGenerator, mikro2 } from '../../lib/main';

const buttonStyle: CSSProperties = {
  color: 'white',
  padding: '.5rem 1rem',
  backgroundColor: 'darkorchid',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '.25rem',
  cursor: 'pointer',
};

function Button({ label, onClick }: { label: string; onClick?: () => void }) {
  const animationLabel = useMemo(() => uniqueLabelGenerator('button'), []);

  const [AnimatedButton, controller] = useAnimikro(
    animationLabel,
    {
      in: mikro2({ backgroundColor: ['navy'] }, 'short'),
    },
    { element: 'button', autoPlay: false }
  );

  return (
    <AnimatedButton
      style={buttonStyle}
      onMouseOver={() => controller.start()}
      onMouseOut={() => controller.reverse()}
      onClick={onClick}
    >
      {label}
    </AnimatedButton>
  );
}

export { Button };
