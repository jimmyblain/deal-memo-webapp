import { useRef } from "react";
import DealMemo from "./pages/DealMemo";
import "./App.css";

function App() {
  const resetRef = useRef<() => void>(() => {});

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => resetRef.current()} style={{ cursor: "pointer" }}>
          Operations Deal Memo Generator
        </h1>
      </header>
      <main className="app-main">
        <DealMemo onResetRef={(fn) => { resetRef.current = fn; }} />
      </main>
    </div>
  );
}

export default App;
