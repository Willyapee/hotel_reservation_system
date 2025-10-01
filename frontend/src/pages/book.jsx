import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Link } from "react-router-dom";
import RoomDisplay from "../components/roomDisplay.jsx";
import "../css/book.css"; // cuma warna dasar

function Book() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] p-10">
      <div className="title p-2 rounded-lg w-full">
      <h2 className="text-5xl font-bold text-gray-200 mb-8 text-center mt-7">
        Book Your Stay
      </h2>

      {/* Date Pickers */}
      <div className="flex gap-6 justify-center mb-10">
        {/* Check-in */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-200">Check-in</label>
          <button
            onClick={() => setOpenCalendar(!openCalendar)}
            className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
          >
            {date[0].startDate.toDateString()}
          </button>
        </div>

        {/* Check-out */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-200">Check-out</label>
          <button
            onClick={() => setOpenCalendar(!openCalendar)}
            className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
          >
            {date[0].endDate.toDateString()}
          </button>
        </div>
      </div>
    </div>
      {/* Calendar */}
      {openCalendar && (
        <div className="flex justify-center mb-10">
          <div className="p-6 bg-white rounded-2xl shadow-xl scale-120">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDate([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={date}
              minDate={new Date()}
            />
          </div>
        </div>
      )}

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-9">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="h-52 bg-cover bg-center"
            style={{ backgroundImage: "url(/room/room7.jpg)" }}
          ></div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-[#333] mb-2">Deluxe Room</h3>
            <p className="text-[#666] mb-2">1 King Bed • 45m²</p>
            <p className="text-[#555] mb-4">
              Large open bay windows, separate dressing room, complimentary minibar.
            </p>
            <Link
              to="/reservation"
              className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-5 py-3 rounded-md transition-colors duration-300 text-lg"
            >
              Reserve Now
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Book;
