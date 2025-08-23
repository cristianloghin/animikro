import { useState } from 'react';
import { useAnimikro, mikro, mikro2 } from '../lib/main';
import { useAnimikroAgent } from '../lib/useAnimikroAgent';

const pullInAnimation = mikro2(
  {
    fade: [0, 1],
    slide: [
      [200, 0],
      [0, 0],
    ],
  },
  'long',
  'ease-in'
);

const pullOutAnimation = mikro2(
  {
    fade: [1, 0],
    slide: [
      ['0px', '0px'],
      ['200px', '0px'],
    ],
  },
  'short',
  'ease-out'
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
      in: mikro(
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
