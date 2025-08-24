import { Basic } from "./examples/Basic";
// import { Test } from "./Test";
import "./App.css";
import { Controlled } from "./examples/Controlled";
import { ClientDemo } from "./examples/Client";
// import { Layout } from "./examples/Sidebar/Layout";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <Basic />
      <Controlled />
      <ClientDemo />
      {/* <Test />
      <h2>Sidebar</h2>
      <Layout /> */}
    </div>
  );
}

export default App;
