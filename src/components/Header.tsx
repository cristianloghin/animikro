import { StatePill } from "./StatePill";

export const Header = ({
  title,
  playState,
  description,
}: {
  title: string;
  playState: string;
  description: string;
}) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>{title}</h2>
        <StatePill state={playState} />
      </div>
      <p>{description}</p>
    </div>
  );
};
