import { CSSProperties, Dispatch, SetStateAction } from 'react';
import { Button } from '../../components/Button';

const mainStyle: CSSProperties = {
  padding: 20,
  flex: '1 1 auto',
};

const buttonsStyle: CSSProperties = {
  maxWidth: '400px',
  margin: 'auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
};

type MainProps = {
  sidebar: {
    show: boolean;
    set: Dispatch<SetStateAction<boolean>>;
  };
};

function Main({ sidebar }: MainProps) {
  function handleClick(label: string) {
    console.log('🚀 Clicked', label);
  }

  return (
    <div style={mainStyle}>
      <h3>Main</h3>
      <div style={buttonsStyle}>
        <Button
          label={`${sidebar.show ? 'Hide' : 'Show'} sidebar`}
          onClick={() => sidebar.set(!sidebar.show)}
        />
        <Button label='Expand sidebar' onClick={() => handleClick('expand')} />
        <Button
          label='Collapse sidebar'
          onClick={() => handleClick('collapse')}
        />
      </div>
    </div>
  );
}

export { Main };
