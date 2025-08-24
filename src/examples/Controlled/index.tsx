import { useAnimikro } from "../../../lib/main";
import { basicAnimation } from "../../animations";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";

export function Controlled() {
  const { Animation, controller, playState } = useAnimikro(basicAnimation, {
    autoPlay: false,
  });

  return (
    <div>
      <Header
        title="Controlled animation"
        playState={playState}
        description="Controlled animation example using Animikro."
      >
        <div
          style={{
            display: "flex",
            marginTop: "1rem",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <Button onClick={() => controller.start()}>Start</Button>
          <Button onClick={() => controller.pause()}>Pause</Button>
          <Button onClick={() => controller.reverse()}>Reverse</Button>
        </div>
      </Header>
      <Animation>
        <div
          style={{
            background: "#0bb6c0ff",
            padding: ".5rem 1rem",
            borderRadius: ".5rem",
          }}
        >
          <h2>I'm a controlled animated element!</h2>
        </div>
      </Animation>
    </div>
  );
}
