import React, { useState, useMemo } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { motion, AnimatePresence } from "framer-motion";
import "../css/book.css";
import RoomList from "../../../backend/data/roomList.json";
import Cards from "../../../backend/data/dineList.json"; // data untuk katalog bawah
import { useNavigate } from "react-router-dom";

function Book() {
  const navigate = useNavigate();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [openSearchResult, setOpenSearchResult] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);

  // CART state
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("hotel_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

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

  // nights based on date picker (minimum 1)
  const nights = Math.max(
    1,
    differenceInDays(date[0].endDate, date[0].startDate)
  );

  // selected room object
  const selectedRoom = useMemo(
    () => RoomList.find((room) => room.roomId === selectedRoomId),
    [selectedRoomId]
  );

  // Add to cart handler (ke state + localStorage)
  const handleAddToCart = (room) => {
    const pricePerNight = room.pricePerNight ?? 0;
    const totalPrice = pricePerNight * nights;
    const item = {
      roomId: room.roomId,
      roomName: room.roomName,
      pricePerNight,
      nights,
      totalPrice,
      dateRange: {
        start: date[0].startDate.toDateString(),
        end: date[0].endDate.toDateString(),
      },
    };

    setCart((prev) => {
      const next = [...prev, item];
      try {
        localStorage.setItem("hotel_cart", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to persist cart", e);
      }
      return next;
    });

    // feedback sederhana
    alert(`${room.roomName} added to cart — $${totalPrice}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9]">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-10"></div>

      <div className="p-10 pt-20">
        <div className="title p-6 rounded-lg w-full shadow-md">
          <h2 className="text-5xl font-bold text-gray-200 mb-10 text-center">
            Book Your Stay
          </h2>

          {/* GUEST & DATE PICKER */}
          <div className="flex flex-wrap gap-8 justify-center bg-white p-8 rounded-xl shadow-lg">
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
              <label className="mb-2 font-semibold text-gray-700">
                Check-in
              </label>
              <button
                onClick={() => setOpenCalendar(true)}
                className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
              >
                {date[0].startDate.toDateString()}
              </button>
            </div>

            <div className="flex flex-col w-60">
              <label className="mb-2 font-semibold text-gray-700">
                Check-out
              </label>
              <button
                onClick={() => setOpenCalendar(true)}
                className="checkBox px-6 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition text-lg"
              >
                {date[0].endDate.toDateString()}
              </button>
            </div>
          </div>
        </div>

        {/* ==== POPUP GUEST ==== */}
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
                transition={{ duration: 0.5 }}
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
                    <span className="font-medium text-[#333]">
                      Children (0–15)
                    </span>
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

                  {/* Child Ages */}
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

        {/* POPUP CALENDAR */}
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
                transition={{ duration: 0.5 }}
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
                    <button
                      className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors duration-300"
                      onClick={() => {
                        setOpenCalendar(false);
                        setOpenSearchResult(true);
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ==== POPUP SEARCH RESULT ==== */}
        <AnimatePresence>
          {openSearchResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/40"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-6xl max-h-[85vh] overflow-y-auto p-10 border border-gray-100"
              >
                <button
                  onClick={() => {
                    setOpenSearchResult(false);
                    setSelectedRoomId(null);
                  }}
                  className="absolute -top-4 -right-4 bg-[#c19a6b] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-[#a67c52] transition text-xl"
                >
                  ✕
                </button>

                <h3 className="text-4xl font-bold text-center text-[#102E50] mb-10">
                  Available Rooms
                </h3>

                {selectedRoom ? (
                  <div className="p-8 bg-[#102E50] text-white rounded-2xl shadow-xl transition-all duration-300">
                    <img
                      src={selectedRoom.roomImage}
                      alt={selectedRoom.roomName}
                      className="w-full h-72 object-cover rounded-xl mb-6"
                    />
                    <h2 className="text-3xl font-bold mb-3">
                      {selectedRoom.roomName}
                    </h2>
                    <p className="text-gray-300 mb-2">
                      {selectedRoom.roomBed}
                    </p>

                    {/* PRICE PER NIGHT & TOTAL */}
                    <p className="text-gray-300 mb-2">
                      Price per night: ${selectedRoom.roomPrice}
                    </p>
                    <p className="text-gray-300 mb-4">
                      Nights: {nights}
                    </p>
                    <p className="text-lg font-semibold text-[#c19a6b] mb-4">
                      Total: ${ (selectedRoom.pricePerNight ?? 0) * nights }
                    </p>

                    <p className="text-gray-300 mb-4">
                      {selectedRoom.roomDesc}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedRoomId(null)}
                        className="bg-[#6b7280] hover:bg-[#4b5563] text-white px-5 py-2 rounded-lg"
                      >
                        ← Back to list
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {RoomList.map((room) => (
                      <motion.div
                        key={room.roomId}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      >
                        <div
                          className="h-48 bg-cover bg-center"
                          style={{ backgroundImage: `url(${room.roomImage})` }}
                          onClick={() => setSelectedRoomId(room.roomId)}
                        ></div>
                        <div className="p-5">
                          <h4 className="font-bold text-xl text-[#102E50] mb-1">
                            {room.roomName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {room.roomBed}
                          </p>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                            {room.roomDesc}
                          </p>

                          {/* tampilkan price per night juga di card */}
                          <p className="text-[#c19a6b] font-semibold mb-3">
                            ${room.roomPrice ?? 0} / night
                          </p>

                          <button
                            className="bg-[#c19a6b] hover:bg-[#a67c52] text-white text-sm px-4 py-2 rounded-lg w-full font-semibold transition"
                            onClick={() => navigate('/register')}
                          >
                            Book Now
                          </button>
                          
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==== SUITE / KATALOG INFORMASI ==== */}
        <section className="w-full max-w-6xl mx-auto mt-20 flex flex-col gap-16 pb-20">
          {Cards.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              } bg-white rounded-2xl shadow-lg overflow-hidden`}
            >
              {/* IMAGE */}
              <div className="md:w-1/2 w-full">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-80 object-cover"
                />
              </div>

              {/* TEXT INFO */}
              <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-[#c19a6b] mb-3 uppercase">
                  {item.title}
                </h3>
                <p className="text-[#3a2f2a] text-sm mb-4 leading-relaxed">
                  {item.content}
                </p>
                {item.description && (
                  <p className="text-gray-500 text-sm italic">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Book;
