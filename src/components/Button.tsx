import { CSSProperties } from "react";
import { useAnimikro } from "../../lib/main";
import { buttonAnimation } from "../animations";

const buttonStyle: CSSProperties = {
  color: "white",
  padding: ".5rem 1rem",
  fontSize: "1rem",
  border: "none",
  borderRadius: ".25rem",
  cursor: "pointer",
};

function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { Animation, controller } = useAnimikro(buttonAnimation, {
    element: "button",
    autoPlay: false,
  });

  return (
    <Animation
      style={buttonStyle}
      onMouseOver={() => controller.start()}
      onMouseOut={() => controller.reverse()}
      onClick={onClick}
    >
      {children}
    </Animation>
  );
}

export { Button };
