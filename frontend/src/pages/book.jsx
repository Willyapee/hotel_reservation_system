import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../css/book.css";

function Book() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);

  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const handleAddChild = () => {
    if (children < 9) {
      setChildren(children + 1);
      setChildAges([...childAges, 0]);
    }
  };

  const handleRemoveChild = () => {
    if (children > 0) {
      setChildren(children - 1);
      setChildAges(childAges.slice(0, -1));
    }
  };

  const handleChildAgeChange = (index, value) => {
    const updated = [...childAges];
    updated[index] = parseInt(value);
    setChildAges(updated);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9]">
      <div className="w-full h-17 fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-10">
      </div>

      <div className="p-10 pt-20">
        <div className="title p-6 rounded-lg w-full shadow-md">
          <h2 className="text-5xl font-bold text-gray-200 mb-10 text-center">
            Book Your Stay
          </h2>

          {/* Section Atas: Guest + Date Picker */}
          <div className="flex flex-wrap gap-8 justify-center bg-white p-8 rounded-xl shadow-lg">
            {/* Guest Button */}
            <div className="flex flex-col w-60">
              <label className="mb-2 font-semibold text-gray-700">Guests</label>
              <button
                onClick={() => setOpenGuest(true)}
                className="checkBox px-6 py-3 border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg bg-white"
              >
                {adults} Adults, {children} Children
              </button>
            </div>

            <div className="flex flex-col w-60">
              <label className="mb-2 font-semibold text-gray-700">Check-in</label>
              <button
                onClick={() => setOpenCalendar(!openCalendar)}
                className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
              >
                {date[0].startDate.toDateString()}
              </button>
            </div>

            <div className="flex flex-col w-60">
              <label className="mb-2 font-semibold text-gray-700">Check-out</label>
              <button
                onClick={() => setOpenCalendar(!openCalendar)}
                className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
              >
                {date[0].endDate.toDateString()}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openGuest && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 bg-black backdrop-blur-sm z-40"
                onClick={() => setOpenGuest(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed inset-0 flex items-center justify-center z-50"
              >
                <div className="relative p-8 bg-white rounded-2xl shadow-2xl w-[380px]">
                  <button
                    onClick={() => setOpenGuest(false)}
                    className="absolute -top-4 -right-4 bg-[#c19a6b] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-[#a67c52] transition text-xl"
                  >
                    ✕
                  </button>

                  <h3 className="text-xl font-bold mb-6 text-[#3a2f2a] text-center">
                    Select Guests
                  </h3>

                  {/* Adults */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="font-medium text-[#333]">Adults (16+)</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold text-[#c19a6b] hover:bg-gray-100 disabled:opacity-30"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                      >
                        –
                      </button>
                      <span className="min-w-[20px] text-center text-lg font-semibold">
                        {adults}
                      </span>
                      <button
                        className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold text-[#c19a6b] hover:bg-gray-100 disabled:opacity-30"
                        onClick={() => {
                          if (adults + children < 9) setAdults(adults + 1);
                        }}
                        disabled={adults + children >= 9}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="font-medium text-[#333]">Children (0–15)</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold text-[#c19a6b] hover:bg-gray-100 disabled:opacity-30"
                        onClick={handleRemoveChild}
                        disabled={children <= 0}
                      >
                        –
                      </button>
                      <span className="min-w-[20px] text-center text-lg font-semibold">
                        {children}
                      </span>
                      <button
                        className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold text-[#c19a6b] hover:bg-gray-100 disabled:opacity-30"
                        onClick={() => {
                          if (adults + children < 9) handleAddChild();
                        }}
                        disabled={adults + children >= 9}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Dropdown usia anak */}
                  {childAges.map((age, index) => (
                    <div key={index} className="mb-3">
                      <label className="block text-sm font-medium text-gray-600">
                        Child {index + 1} Age
                      </label>
                      <select
                        value={age}
                        onChange={(e) => handleChildAgeChange(index, e.target.value)}
                        className="w-full border rounded px-3 py-2 mt-1"
                      >
                        {[...Array(16).keys()].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <button
                    onClick={() => setOpenGuest(false)}
                    className="mt-5 w-full bg-[#c19a6b] text-white py-2 rounded-lg hover:bg-[#a67c52]"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openCalendar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 bg-black backdrop-blur-sm z-40"
                onClick={() => setOpenCalendar(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed inset-0 flex items-center justify-center z-50"
              >
                <div className="relative p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105">
                  <button
                    onClick={() => setOpenCalendar(false)}
                    className="absolute -top-4 -right-4 bg-[#c19a6b] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-[#a67c52] transition text-xl"
                  >
                    ✕
                  </button>

                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setDate([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={date}
                    minDate={new Date()}
                    months={2}
                    direction="horizontal"
                    rangeColors={["#c19a6b"]}
                  />

                  <div className="mt-6 text-center">
                    <Link
                      to="/reservation"
                      className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors duration-300"
                      onClick={() => setOpenCalendar(false)}
                    >
                      Reserve Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-14">
          {/* Deluxe Room */}
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

          {/* Suite Room */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="h-52 bg-cover bg-center"
              style={{ backgroundImage: "url(/room/room2.jpg)" }}
            ></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#333] mb-2">Suite Room</h3>
              <p className="text-[#666] mb-2">1 King Bed • 60m²</p>
              <p className="text-[#555] mb-4">
                Spacious living area, luxury bath, and premium city view.
              </p>
              <Link
                to="/reservation"
                className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-5 py-3 rounded-md transition-colors duration-300 text-lg"
              >
                Reserve Now
              </Link>
            </div>
          </div>

          {/* Family Room */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="h-52 bg-cover bg-center"
              style={{ backgroundImage: "url(/room/room3.jpg)" }}
            ></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#333] mb-2">Family Room</h3>
              <p className="text-[#666] mb-2">2 Queen Beds • 70m²</p>
              <p className="text-[#555] mb-4">
                Perfect for family stays, large space with kids-friendly facilities.
              </p>
              <Link
                to="/reservation"
                className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-5 py-3 rounded-md transition-colors duration-300 text-lg"
              >
                Reserve Now
              </Link>
            </div>
          </div>

          {/* Superior Room */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="h-52 bg-cover bg-center"
              style={{ backgroundImage: "url(/room/room4.jpg)" }}
            ></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#333] mb-2">Superior Room</h3>
              <p className="text-[#666] mb-2">1 Queen Bed • 35m²</p>
              <p className="text-[#555] mb-4">
                Cozy room with modern interior and comfortable workspace.
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
    </div>
  );
}

export default Book;
