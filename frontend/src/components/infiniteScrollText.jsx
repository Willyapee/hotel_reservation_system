import React from "react";
import "../css/infiniteScrollText.css";

export default function InfiniteScrollText() {
  const textItems = [
    "🌟 Indulge in Golden Moments",
    "🌅 Wake Up to Golden Sunrises",
    "💎 Golden Points Await You",
    "🥂 Where Elegance Meets Comfort",
    "🛎️ Your Stay, Our Pleasure",
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