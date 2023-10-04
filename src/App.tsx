// import { useFoo } from '../';
import { configurePants } from '../lib/main';
import { Animal } from './Animal';
import { Test } from './Test';
import './App.css';
import { Layout } from './examples/Sidebar/Layout';

configurePants({ color: 'pink' });

function App() {
  return (
    <>
      <Animal />
      <Test />
      <h2>Sidebar</h2>
      <Layout />
    </>
  );
}

export default App;
