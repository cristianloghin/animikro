// import { useFoo } from '../';
import { configurePants } from '../lib/main';
import { Animal } from './Animal';
import './App.css';

configurePants({ color: 'pink' });

function App() {
  return (
    <>
      <Animal />
    </>
  );
}

export default App;
