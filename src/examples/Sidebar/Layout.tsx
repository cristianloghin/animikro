import { Sidebar } from './Sidebar';
import { Main } from './Main';
import { CSSProperties, useState } from 'react';

const layoutStyle: CSSProperties = {
  width: '80vw',
  height: 600,
  backgroundColor: 'black',
  display: 'flex',
  overflow: 'hidden',
};

function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div style={layoutStyle}>
      <Sidebar show={showSidebar} set={setShowSidebar} />
      <Main sidebar={{ show: showSidebar, set: setShowSidebar }} />
    </div>
  );
}

export { Layout };
