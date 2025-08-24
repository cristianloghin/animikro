import { CSSProperties, Dispatch, SetStateAction } from "react";
import { useAnimikro } from "../../../lib/main";
import { sidebarAnimation } from "../../animations";

const sidebarStyle: CSSProperties = {
  backgroundColor: "navy",
  height: "100%",
  width: 200,
  padding: 20,
  boxSizing: "border-box",
};

type SidebarProps = {
  show?: boolean;
  set?: Dispatch<SetStateAction<boolean>>;
};

function Sidebar({ show }: SidebarProps) {
  const [Wrapper] = useAnimikro(sidebarAnimation, { mount: show });

  return (
    <Wrapper style={sidebarStyle}>
      <div>Hey mom, I'm a sidebar yo!</div>
    </Wrapper>
  );
}

export { Sidebar };
