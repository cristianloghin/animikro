import { StatePill } from "./StatePill";

export const Header = ({
  children,
  title,
  playState,
  description,
}: {
  children?: React.ReactNode;
  title: string;
  playState?: string;
  description: string;
}) => {
  return (
    <div
      style={{
        backgroundColor: "#1c1c1cff",
        padding: ".75rem 1rem",
        borderRadius: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ padding: 0, margin: 0 }}>{title}</h2>
        {playState && <StatePill state={playState} />}
      </div>
      <p style={{ padding: 0, margin: 0, textAlign: "left" }}>{description}</p>
      {children && <div>{children}</div>}
    </div>
  );
};
