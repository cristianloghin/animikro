import { useState } from 'react';
import { useAnimikro, mikro2 } from '../lib/main';
import { useAnimikroAgent } from '../lib/useAnimikroAgent';

const pullInAnimation = mikro2(
  {
    opacity: [0, 1],
    transform: ['translateX(200px)', 'translateX(0)'],
  },
  'long'
);

const pullOutAnimation = mikro2(
  {
    opacity: [1, 0],
    transform: ['translateX(0)', 'translateX(200px)'],
  },
  'regular'
);

function Test() {
  const [putOn, setPutOn] = useState(false);
  const [pullOut, setPullOut] = useState(false);

  const client = useAnimikroAgent();

  const [PullTest] = useAnimikro(
    'pull-test',
    {
      in: pullInAnimation,
      out: pullOutAnimation,
    },
    {},
    pullOut
  );
  const [TestAnim, controller, playState] = useAnimikro(
    'put-test',
    {
      in: mikro2(
        {
          opacity: [0, 1],
          transform: ['translate3D(200px, 0, 0)', 'translate3D(0, 0, 0)'],
          easing: 'easeIn',
        },
        3000
      ),
    },
    {},
    putOn
  );

  return (
    <>
      <div>
        <button onClick={() => client.play('sidebar-animation')}>
          Show sidebar
        </button>
        <button onClick={() => setPutOn(!putOn)}>
          Toggle pants {playState}
        </button>
      </div>
      <TestAnim
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: 'magenta',
        }}
      >
        Bing, Bing
      </TestAnim>
      <div>
        <button onClick={() => setPullOut(!pullOut)}>Pull out</button>
      </div>
      <PullTest
        style={{ marginTop: 20, padding: 10, backgroundColor: 'purple' }}
      >
        Bang, bang
      </PullTest>
    </>
  );
}

export { Test };
