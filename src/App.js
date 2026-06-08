import React, { useState } from "react";
import PeriodicTable from "./Components/PeriodicTable";
import Trends from "./Components/Trends/Trends";
import CompareElements from "./Components/compareElements";
import ThemeToggle from "./Components/ThemeToggle/ThemeToggle";
import Assistant from "./Components/Assistant/Assistant";
import QuizMode from "./Components/QuizMode";
import ElementDetailsPanel from "./Components/ElementDetailsPanel";

function App() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [temperature, setTemperature] = useState(300);

  return (
    <div className="app">
      <header
        className="app-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "2.8rem",
              letterSpacing: "1px",
            }}
          >
            Periodic Table Explorer
          </h1>

          <p style={{ marginTop: "8px", opacity: 0.7 }}>
            Interactive chemistry experience built with React
          </p>
        </div>

        <div
          className="btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setQuizOpen(true)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(167, 139, 250, 0.35)",
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(167, 139, 250, 0.22))",
              color: "#ddd6fe",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s ease",
            }}
            title="Open Quiz Mode"
          >
            ⚗️ Quiz Mode
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Temperature Simulation */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 20px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "16px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3>Temperature Simulation</h3>

          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            {temperature} K
          </p>

          <input
            type="range"
            min="0"
            max="6000"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <PeriodicTable temperature={temperature} />

      <Trends />
      <CompareElements />
      <Assistant />
      <ElementDetailsPanel />

      {quizOpen && (
        <QuizMode onClose={() => setQuizOpen(false)} />
      )}
    </div>
  );
}

export default App;