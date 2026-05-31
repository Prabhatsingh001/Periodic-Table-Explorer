import React, { useState } from "react";
import "./FlipCard.css";

function FlipCard({ title, uses }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h3>{title}</h3>
          <p>Click to view daily uses</p>
        </div>

        <div className="flip-card-back">
          <h3>Daily Uses</h3>
          <ul>
            {uses.map((use, index) => (
              <li key={index}>{use}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;