// import { useFoo } from '../';
import { useFoo } from '../lib/main';
import './App.css';

function App() {
  const { name, set } = useFoo('Bob');

  return (
    <>
      <h1>{name}</h1>
      <button onClick={() => (name === 'Bob' ? set('Pete') : set('Bob'))}>
        {name === 'Bob' ? 'Pete' : 'Bob'}
      </button>
    </>
  );
}

export default App;
