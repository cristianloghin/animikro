import { Header } from "../../components/Header";

export const ClientDemo = () => {
  return (
    <div>
      <Header
        title="Client Demo"
        description="Demonstration of client components"
      />
      <div style={{ display: "flex", gap: "1rem" }}>
        <ChildA />
        <ChildB />
      </div>
    </div>
  );
};

const ChildA = () => {
  return <div>Child A</div>;
};

const ChildB = () => {
  return <div>Child B</div>;
};
