import React from "react";
import "../css/infiniteScrollText.css";

export default function InfiniteScrollText() {
  const textItems = [
  "NYX HOTEL",
  "NYX HOTEL",
  "NYX HOTEL",
  "NYX HOTEL",
  "NYX HOTEL",
  "NYX HOTEL",
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