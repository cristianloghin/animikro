export const StatePill = ({ state }: { state: string }) => {
  return (
    <div
      style={{
        display: "inline-block",
        padding: ".25rem .5rem",
        borderRadius: ".25rem",
        background: getBackgroundColor(state),
        color: "white",
        fontSize: ".75rem",
      }}
    >
      {state}
    </div>
  );
};

function getBackgroundColor(state: string) {
  switch (state) {
    case "idle":
      return "gray";
    case "running":
      return "blue";
    case "paused":
      return "orange";
    case "finished":
      return "green";
    default:
      return "gray";
  }
}
