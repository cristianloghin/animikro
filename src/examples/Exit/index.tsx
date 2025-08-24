import { useState } from "react";
import { useAnimikro } from "../../../lib/main";
import { basicAnimation } from "../../animations";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";

export function Exit() {
  const [mount, setMount] = useState(false);
  const { Animation, playState } = useAnimikro(basicAnimation, { mount });

  return (
    <div>
      <Header
        title="Basic animation"
        playState={playState}
        description="Basic animation example using Animikro."
      >
        <div>
          <Button onClick={() => setMount(!mount)}>
            {mount ? "Unmount" : "Mount"}
          </Button>
        </div>
      </Header>
      <Animation>
        <div
          style={{
            background: "#1e6bc9ff",
            padding: ".5rem 1rem",
            borderRadius: ".5rem",
          }}
        >
          <h2>I'm an exit animated element!</h2>
        </div>
      </Animation>
    </div>
  );
}
