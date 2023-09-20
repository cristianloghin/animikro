import { useState } from 'react';

type Bar = {
  name: string;
  set: (name: string) => void;
};

function useFoo(name: string): Bar {
  const [id, setId] = useState(name);

  return {
    name: id,
    set: setId,
  };
}

export { useFoo };
