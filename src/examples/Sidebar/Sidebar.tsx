import { CSSProperties, Dispatch, SetStateAction } from 'react';
import { useAnimikro } from '../../../lib/useAnimikro';
import { mikro2 } from '../../../lib/main';

const sidebarStyle: CSSProperties = {
  backgroundColor: 'navy',
  height: '100%',
  width: 200,
  padding: 20,
  boxSizing: 'border-box',
};

type SidebarProps = {
  show?: boolean;
  set?: Dispatch<SetStateAction<boolean>>;
};

function Sidebar({ show }: SidebarProps) {
  const [Wrapper] = useAnimikro(
    'sidebar-wrapper',
    {
      in: mikro2(
        { marginLeft: ['-200px', '0px'], easing: 'easeIn' },
        'regular'
      ),
      out: mikro2(
        { marginLeft: ['0px', '-200px'], easing: 'easeOut' },
        'short'
      ),
    },
    {},
    show
  );

  return (
    <Wrapper style={sidebarStyle}>
      <div>Hey mom, I'm a sidebar yo!</div>
    </Wrapper>
  );
}

export { Sidebar };
