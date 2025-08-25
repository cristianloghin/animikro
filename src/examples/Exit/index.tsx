import { useState } from "react";
import { useAnimikro } from "../../../lib/main";
import { basicAnimation } from "../../animations";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";

export function Exit() {
  const [mount, setMount] = useState(false);
  const { Animation: MainAnimation, playState } = useAnimikro(basicAnimation, {
    mount,
  });

  const handleMount = () => {
    setMount(!mount);
  };

  return (
    <div>
      <Header
        title="Enter/Exit animation"
        playState={playState}
        description="Animate component mount/unmount example."
      >
        <div style={{ marginTop: ".75rem" }}>
          <Button onClick={handleMount}>
            {mount ? "Animate out and unmount" : "Mount and animate in"}
          </Button>
        </div>
      </Header>
      <MainAnimation>
        <div
          style={{
            background: "#1e6bc9ff",
            padding: ".5rem 1rem",
            borderRadius: ".5rem",
          }}
        >
          <h2>I'm an exit animated element!</h2>
        </div>
      </MainAnimation>
    </div>
  );
}
