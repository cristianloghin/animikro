import { useState } from "react";
import { useAnimikro } from "../lib/main";
import { useAnimikroAgent } from "../lib/main";
import { pullTest, putTest } from "./animations";

function Test() {
  const [putOn, setPutOn] = useState(false);
  const [pullOut, setPullOut] = useState(false);

  const agent = useAnimikroAgent();

  const [PullTest] = useAnimikro(pullTest, { mount: pullOut });
  const [TestAnim, , playState] = useAnimikro(putTest, { mount: putOn });

  const handleAgentDemo = () => {
    // Control animations remotely using the agent
    agent.restart(putTest);

    // Check if animations are registered
    console.log(
      "Sidebar registered:",
      agent.isAnimationRegistered("sidebar-animation")
    );
    console.log("Pull test registered:", agent.isAnimationRegistered(pullTest));
  };

  const handleSequenceDemo = async () => {
    // Play animations in sequence
    await agent.playSequence([putTest, pullTest], 500);
    console.log("Sequence completed!");
  };

  const handleControlDemo = () => {
    // Demonstrate various controls
    setTimeout(() => agent.pause(putTest), 1000);
    setTimeout(() => agent.play(putTest), 2000);
    setTimeout(() => agent.reverse(putTest), 3000);
  };

  return (
    <>
      <div>
        <button onClick={() => agent.play("sidebar-animation")}>
          Control Sidebar (Agent)
        </button>
        <button onClick={() => setPutOn(!putOn)}>
          Toggle pants {playState}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={handleAgentDemo}>Agent Demo (restart + check)</button>
        <button onClick={handleSequenceDemo}>Play Sequence</button>
        <button onClick={handleControlDemo}>
          Control Demo (pause/play/reverse)
        </button>
      </div>

      <TestAnim
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "magenta",
        }}
      >
        Bing, Bing
      </TestAnim>
      <div>
        <button onClick={() => setPullOut(!pullOut)}>Pull out</button>
      </div>
      <PullTest
        style={{ marginTop: 20, padding: 10, backgroundColor: "purple" }}
      >
        Bang, bang
      </PullTest>
    </>
  );
}

export { Test };
