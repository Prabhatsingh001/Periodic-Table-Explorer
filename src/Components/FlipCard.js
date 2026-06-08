import React, { useState } from "react";
import "./FlipCard.css";
// Import the centralized element data from your Data folder
import elementApplications from "../Data/elementApplications.json";

function FlipCard({ symbol, title }) {
  const [flipped, setFlipped] = useState(false);

  // 1. Dynamically look up the element use string using its atomic symbol (e.g., "H", "Fe")
  const applicationData = elementApplications[symbol];

  // 2. Graceful fallback logic for synthetic or missing elements
  const displayUse = applicationData
    ? applicationData.use
    : "This is a highly unstable synthetic element primarily used in scientific research.";

  return (
    <div
      className={`flip-card ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flip-card-inner">
        {/* Front of the Card */}
        <div className="flip-card-front">
          <h3>{title || symbol}</h3>
          <p>Click to view daily uses</p>
        </div>

        {/* Back of the Card */}
        <div className="flip-card-back">
          <h3>Daily Uses</h3>
          {/* Replaced the old <ul> mapping with a clean text paragraph */}
          <p className="element-use-desc">{displayUse}</p>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;