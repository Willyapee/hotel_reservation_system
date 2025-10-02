import React from "react";

export default function BookingStreak() {
  const badges = [
    {
      name: "Golden Explorer",
      desc: "Stayed in 3 different room types",
      img: "/images/badge-explorer.png",
    },
    {
      name: "Weekend Lover",
      desc: "Booked 5 weekend stays",
      img: "/images/badge-weekend.png",
    },
    {
      name: "Early Bird",
      desc: "Always books in advance",
      img: "/images/badge-earlybird.png",
    },
    {
      name: "Luxury Collector",
      desc: "Enjoyed spa, fine dining, and sky bar",
      img: "/images/badge-luxury.png",
    },
  ];

  return (
    <section className="w-full bg-white py-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-yellow-700 mb-12">
          Achievement Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-[#fbfaf9] shadow-lg rounded-xl p-6 transform hover:scale-105 transition"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 animate-pulse"></div>
                <img
                  src={badge.img}
                  alt={badge.name}
                  className="w-24 h-24 relative z-10"
                />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-800">
                {badge.name}
              </h3>
              <p className="text-gray-600 text-sm mt-2">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}