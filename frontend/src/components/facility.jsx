import React from "react";
import FacilityList from "../../../backend/data/facility.json";

export default function Facility() {
  return (
    <section className="w-full bg-[#fbfaf9] py-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-24">
        {FacilityList.map((facility, idx) => (
          <div
            key={idx}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div
              className={`${idx % 2 !== 0 ? "md:order-2" : "md:order-1"}`}
            >
              <img
                src={facility.img}
                alt={facility.name}
                className="w-[30rem] h-[42rem] object-cover"
              />
            </div>

            <div className={`text-center md:text-left 
                ${idx % 2 !== 0 ? "md:order-1" : "md:order-2"}`}
            >

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {facility.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {facility.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
