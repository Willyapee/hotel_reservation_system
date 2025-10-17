import React, { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { motion, AnimatePresence } from "framer-motion";
import "../css/book.css";

import RoomList from "../../../backend/data/roomList.json";
import { useNavigate } from "react-router-dom";

import Cards from "../../../backend/data/dineList.json";
import { Link } from "react-router-dom";
import { ShoppingCart, X, Loader } from "lucide-react";


function Book() {
  const navigate = useNavigate();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [openSearchResult, setOpenSearchResult] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchParams, setSearchParams] = useState(null);

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

  // Fungsi untuk mencari kamar tersedia
  const searchRooms = async () => {
    if (!date[0].startDate || !date[0].endDate) return;
    
    setLoading(true);
    try {
      const checkIn = format(date[0].startDate, 'yyyy-MM-dd');
      const checkOut = format(date[0].endDate, 'yyyy-MM-dd');
      
      const queryParams = new URLSearchParams({
        check_in: checkIn,
        check_out: checkOut,
        adults: adults.toString()
      });

      const response = await fetch(`http://localhost:3000/rooms/search?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setAvailableRooms(data.availableRooms);
        setSearchParams(data.searchParams);
        setOpenSearchResult(true);
      } else {
        alert(data.message || 'Gagal mencari kamar');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Terjadi kesalahan saat mencari kamar');
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setOpenCalendar(false);
    searchRooms();
  };

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

  const nights = Math.max(
    1,
    differenceInDays(date[0].endDate, date[0].startDate)
  );

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room.roomId === selectedRoomId),
    [selectedRoomId, availableRooms]
  );

  const [showFloating, setShowFloating] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        setShowFloating(footerTop > windowHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // DETAIL CARD PERSIS BOXDISPLAY
  const DetailCard = ({ room }) => (
    <div className="bg-[#102e50] text-white w-full h-full p-8 md:p-10 rounded-xl flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-white">{room.roomName}</h2>
        <p className="text-sm text-gray-400 mb-2">{room.roomBed}</p>
        <p className="text-sm text-gray-400 mb-4">
          Available: {room.availableRooms} room{room.availableRooms > 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-400 mb-6">
          {room.roomDesc || "No description available."}
        </p>
        <div className="text-sm text-gray-400">
          <p>Capacity: {room.capacity} adults</p>
          <p>Max Stay: {room.maxStayDuration} days</p>
          <p>Duration: {room.duration} night{room.duration > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="pt-5 border-t border-[#34495e] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Total for {room.duration} night{room.duration > 1 ? 's' : ''}</span>
          <span className="text-4xl font-extrabold text-yellow-500">
            ${room.totalPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400">
            (${room.roomPrice.toFixed(2)} / night)
          </span>
        </div>
      </div>
    </div>
  );

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

        {/* POPUP GUEST */}
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
                  {childAges.map((age, index) => (
                    <div key={index} className="mb-3">
                      <label className="block text-sm font-medium text-gray-600">
                        Child {index + 1} Age
                      </label>
                      <select
                        value={age}
                        onChange={(e) =>
                          handleChildAgeChange(index, e.target.value)
                        }
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
                      onClick={handleSearch}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* SUITE / KATALOG */}
        {!openSearchResult ? (
          <section className="w-full max-w-6xl mx-auto mt-20 flex flex-col gap-16 pb-20">
            {Cards.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                } bg-white rounded-2xl shadow-lg overflow-hidden`}
              >
                <div className="md:w-1/2 w-full">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-80 object-cover"
                  />
                </div>
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
        ) : (
          <section className="w-full max-w-5xl mx-auto mt-20 pb-20 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-[#102E50] mb-10 text-center">
              Available Rooms
            </h2>
            
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader className="w-8 h-8 animate-spin text-[#c19a6b]" />
                <span className="ml-2 text-gray-600">Loading available rooms...</span>
              </div>
            )}
            
            {!loading && availableRooms.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No rooms available for your selected criteria.</p>
                <button 
                  onClick={() => setOpenCalendar(true)}
                  className="mt-4 text-[#c19a6b] hover:text-[#a67c52] underline"
                >
                  Modify your search
                </button>
              </div>
            )}
            
            {!loading && availableRooms.map((room) => (
              <div key={room.roomId} className="relative bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-start gap-6">
                <img
                  src={room.roomImage}
                  alt={room.roomName}
                  className="w-full md:w-64 h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedRoomId((prev) => prev === room.roomId ? null : room.roomId)}
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-[#c19a6b] mb-1">{room.roomName}</h3>
                  <p className="text-gray-500 mb-1">{room.roomBed}</p>
                  <p className="text-gray-700 mb-2">{room.roomDesc || "No description available."}</p>
                  <p className="text-[#102E50] font-semibold text-lg">${room.roomPrice} / night</p>
                </div>

                {/* Book Now di pojok kanan bawah */}
                <Link
                  to="/cart"
                  className="absolute bottom-4 right-4 bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg"
                >
                  Book Now
                </Link>

                {/* POPUP DETAIL */}
                <AnimatePresence>
                  {selectedRoomId === room.roomId && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 bg-black backdrop-blur-sm z-40"
                        onClick={() => setSelectedRoomId(null)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                      >
                        <div className="relative w-full max-w-md">
                          <button
                            onClick={() => setSelectedRoomId(null)}
                            className="absolute -top-4 -right-4 bg-[#c19a6b] text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-[#a67c52] transition text-xl"
                          >
                            <X />
                          </button>
                          <DetailCard room={room} />
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* FLOATING CART BUTTON */}
      {showFloating && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">Cart</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Book;
