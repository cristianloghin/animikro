import { useAnimikro } from "../../../lib/main";
import { basicAnimation } from "../../animations";
import { Header } from "../../components/Header";

export function Basic() {
  const { Animation, playState } = useAnimikro(basicAnimation);

  return (
    <div>
      <Header
        title="Basic animation"
        playState={playState}
        description="Basic animation example using Animikro."
      />
      <Animation>
        <div
          style={{
            background: "#1e6bc9ff",
            padding: ".5rem 1rem",
            borderRadius: ".5rem",
          }}
        >
          <h2>I'm a simple animated element!</h2>
        </div>
      </Animation>
    </div>
  );
}
