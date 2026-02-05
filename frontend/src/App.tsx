import DealMemo from "./pages/DealMemo";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Deal Memo Generator</h1>
      </header>
      <main className="app-main">
        <DealMemo />
      </main>
    </div>
  );
}

export default App;
