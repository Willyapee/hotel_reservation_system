import React from "react";
import "../css/infiniteScrollText.css";

export default function InfiniteScrollText() {
  const textItems = [
  "Nyx Hotel",
  "“Where nights turn into memories.”",
  "Nyx Hotel",
  "“Elegance woven into every stay.”",
  "Nyx Hotel",
  "“Experience the quiet luxury of space.”",
];

  return (
    <div className="marquee-container bg-[#102E50] py-4">
      <div className="marquee-track">
        <div className="flex">
          {textItems.map((item, i) => (
            <span key={i} className="mx-8 text-xl font-semibold text-gray-100">{item}</span>
          ))}
        </div>

        <div className="flex">
          {textItems.map((item, i) => (
            <span key={`copy-${i}`} className="mx-8 text-xl font-semibold text-gray-100">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}