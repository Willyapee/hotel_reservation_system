import React, { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { motion, AnimatePresence } from "framer-motion";
import "../css/book.css";

import RoomList from "../../../backend/data/roomList.json";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import { ShoppingCart, X, Loader, ArrowLeft} from "lucide-react";

function Book() {
  const navigate = useNavigate();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [openSearchResult, setOpenSearchResult] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState({});
  const [cartRoomNumbers, setCartRoomNumbers] = useState([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [rooms, setRooms] = useState([
    {
      id: 1,
      adults: 1,
      children: 0,
      childAges: []
    }
  ]);

  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔐 Checking authentication...');
        const response = await fetch('http://localhost:3000/auth/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('🔐 Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ User authenticated:', data.user);
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          setIsAuthenticated(true);
        } else {
          console.log('❌ Not authenticated, redirecting to login');
          navigate('/login', {
            state: {
              redirectTo: '/booking',
              message: 'Please login to book rooms'
            }
          });
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        navigate('/login', {
          state: {
            redirectTo: '/booking',
            message: 'Authentication error. Please login again.'
          }
        });
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const fetchCartRoomNumbers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/room-numbers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('🛒 Room numbers in cart:', result.roomNumbers);
          setCartRoomNumbers(result.roomNumbers.map(id => parseInt(id)));
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart room numbers:', error);
    }
  };

  const handleRoomNumberSelect = (roomTypeId, roomId) => {
    setSelectedRoomNumbers(prev => ({
      ...prev,
      [roomTypeId]: roomId
    }));
  };

  const handleAddRoom = () => {
    if (rooms.length < 5) {
      setRooms([
        ...rooms,
        {
          id: rooms.length + 1,
          adults: 1,
          children: 0,
          childAges: []
        }
      ]);
    }
  };

  const handleRemoveRoom = (roomId) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };

  const MAX_TOTAL = 9;

  const updateRoomAdults = (roomId, value) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        let newAdults = Math.max(0, Math.min(9, value));
        let newChildren = room.children;

        if (newAdults + newChildren > MAX_TOTAL) {
          const excess = newAdults + newChildren - MAX_TOTAL;
          newChildren = Math.max(0, newChildren - excess);
        }

        const newChildAges =
          newChildren > room.childAges.length
            ? [...room.childAges, ...Array(newChildren - room.childAges.length).fill(0)]
            : room.childAges.slice(0, newChildren);

        return { ...room, adults: newAdults, children: newChildren, childAges: newChildAges };
      }
      return room;
    }));
  };

  const updateRoomChildren = (roomId, value) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          let newChildren = Math.max(0, Math.min(9, value));
          let newAdults = room.adults;

          if (newAdults + newChildren > MAX_TOTAL) {
            const excess = newAdults + newChildren - MAX_TOTAL;
            newAdults = Math.max(0, newAdults - excess);
          }

          let newChildAges = [...room.childAges];
          while (newChildAges.length < newChildren) {
            newChildAges.push("");
          }
          while (newChildAges.length > newChildren) {
            newChildAges.pop();
          }

          return {
            ...room,
            adults: newAdults,
            children: newChildren,
            childAges: newChildAges,
          };
        }
        return room;
      })
    );
  };

  const updateChildAge = (roomId, childIndex, age) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newChildAges = [...room.childAges];
        newChildAges[childIndex] = parseInt(age);
        return { ...room, childAges: newChildAges };
      }
      return room;
    }));
  };

  const getTotalGuests = () => {
    const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
    return { totalAdults, totalChildren };
  };

  const { totalAdults, totalChildren } = getTotalGuests();

  const searchRooms = async () => {
    if (!date[0].startDate || !date[0].endDate) return;
    
    if (!isAuthenticated) {
      alert('Please login to search for rooms');
      navigate('/login', {
        state: {
          redirectTo: '/booking',
          message: 'Please login to book rooms'
        }
      });
      return;
    }
    
    setLoading(true);
    try {
      const checkIn = format(date[0].startDate, 'yyyy-MM-dd');
      const checkOut = format(date[0].endDate, 'yyyy-MM-dd');
      
      const queryParams = new URLSearchParams({
        check_in: checkIn,
        check_out: checkOut,
        adults: totalAdults.toString()
      });

      const response = await fetch(`http://localhost:3000/rooms/search?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setAvailableRooms(data.availableRooms);
        setSearchParams(data.searchParams);
        setOpenSearchResult(true);
        setSelectedRoomNumbers({});
        await fetchCartRoomNumbers();
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

  const addToCart = async (roomData) => {
    try {
      if (!isAuthenticated) {
        alert('Please login to add rooms to cart');
        navigate('/login', {
          state: {
            redirectTo: '/booking',
            message: 'Please login to book rooms'
          }
        });
        return;
      }

      const selectedRoomId = selectedRoomNumbers[roomData.roomTypeId];
      
      if (!selectedRoomId) {
        alert('Please select a room number first!');
        return;
      }

      if (cartRoomNumbers.includes(parseInt(selectedRoomId))) {
        alert('This room is already in your cart!');
        return;
      }

      const selectedRoom = roomData.availableRoomNumbers?.find(
        room => room.roomId === parseInt(selectedRoomId)
      );

      if (!selectedRoom) {
        alert('Selected room not found!');
        return;
      }

      console.log('Adding room to cart:', {
        roomId: selectedRoomId,
        roomNumber: selectedRoom.roomNumber,
        roomTypeName: roomData.roomName
      });
      
      const cartData = {
        roomId: selectedRoomId.toString(),
        checkIn: format(date[0].startDate, 'yyyy-MM-dd'),
        checkOut: format(date[0].endDate, 'yyyy-MM-dd'),
        guests: {
          adults: totalAdults,
          children: totalChildren
        },
        roomNumber: selectedRoom.roomNumber
      };

      console.log('📤 Cart data to send:', cartData);

      const response = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cartData)
      });

      console.log('📨 Response status:', response.status);
      
      const result = await response.json();
      console.log('📨 Response data:', result);

      if (result.success) {
        alert(`✅ Room ${selectedRoom.roomNumber} (${roomData.roomName}) added to cart successfully!`);
        await fetchCartRoomNumbers();
        setSelectedRoomNumbers(prev => ({
          ...prev,
          [roomData.roomTypeId]: null
        }));
      } else {
        alert(`❌ ${result.message || 'Failed to add to cart'}`);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add room to cart. Please check console for details.');
    }
  };

  const handleSearch = () => {
    setOpenCalendar(false);
    searchRooms();
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

  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const DetailCard = ({ room }) => (
    <div className="bg-[#102e50] text-white w-full h-full p-8 md:p-10 rounded-xl flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-white">{room.roomName}</h2>
        <p className="text-sm text-gray-400 mb-2">{room.roomBed}</p>
        <p className="text-sm text-gray-400 mb-4">
          Available: {room.availableRooms} room{room.availableRooms > 1 ? 's' : ''}
        </p>
        
        {/* Dropdown untuk memilih Room Number */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Select Room Number:
          </label>
          <select
            className="w-full bg-[#1a3a5f] border border-[#34495e] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c19a6b]"
            value={selectedRoomNumbers[room.roomTypeId] || ''}
            onChange={(e) => handleRoomNumberSelect(room.roomTypeId, e.target.value)}
          >
            <option value="">-- Select a room --</option>
            {room.availableRoomNumbers?.map((roomItem) => (
              <option 
                key={roomItem.roomId} 
                value={roomItem.roomId}
                disabled={cartRoomNumbers.includes(roomItem.roomId)}
              >
                {roomItem.roomNumber} {cartRoomNumbers.includes(roomItem.roomId) ? '(In Cart)' : ''}
              </option>
            ))}
          </select>
          
          {selectedRoomNumbers[room.roomTypeId] && 
           cartRoomNumbers.includes(parseInt(selectedRoomNumbers[room.roomTypeId])) && (
            <p className="text-red-400 text-xs mt-1">
              This room is already in your cart
            </p>
          )}
        </div>
        
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
        
        <button
          onClick={() => {
            if (selectedRoomNumbers[room.roomTypeId]) {
              addToCart(room);
            } else {
              alert('Please select a room number first!');
            }
          }}
          disabled={!selectedRoomNumbers[room.roomTypeId] || 
                    cartRoomNumbers.includes(parseInt(selectedRoomNumbers[room.roomTypeId]))}
          className={`px-6 py-3 rounded-lg font-semibold ${
            !selectedRoomNumbers[room.roomTypeId] || 
            cartRoomNumbers.includes(parseInt(selectedRoomNumbers[room.roomTypeId]))
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#c19a6b] hover:bg-[#a67c52] text-white"
          }`}
        >
          {!selectedRoomNumbers[room.roomTypeId] 
            ? "Select Room First" 
            : cartRoomNumbers.includes(parseInt(selectedRoomNumbers[room.roomTypeId]))
              ? "Room in Cart"
              : "Add to Cart"}
        </button>
      </div>
    </div>
  );
  return (
    <div className="w-full min-h-screen bg-[#fbfaf9]">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-10">
        <button
              onClick={() => navigate('/')}
              className="absolute left-6 z-20 flex items-center gap-2 text-white bg-[#102E50] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
          >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-3sm font-medium">Back to Home</span>
          </button>
      </div>

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
                {rooms.length} Room{rooms.length > 1 ? 's' : ''} · {totalAdults} Adult{totalAdults > 1 ? 's' : ''} · {totalChildren} Child{totalChildren !== 1 ? 'ren' : ''}
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
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 bg-overlay z-40"
                onClick={() => setOpenGuest(false)}
              />

              {/* Popup utama */}
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 flex items-center justify-center z-50"
              >
                <div className="relative p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 w-full max-w-2xl">
                  <button
                    onClick={() => setOpenGuest(false)}
                    className="absolute -top-4 -right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-xl btn-close"
                  >
                    ✕
                  </button>

                  <h3 className="text-2xl font-bold mb-6 text-secondary text-center">
                    Select Guests
                  </h3>

                  {/* Room Cards */}
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                    {rooms.map((room, index) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-2 border-gray-200 rounded-xl p-6 bg-light"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-bold text-primary">
                            Room {index + 1}
                          </h4>
                          {rooms.length > 1 && (
                            <button
                              onClick={() => handleRemoveRoom(room.id)}
                              className="text-sm font-semibold btn-remove"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Adults */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-dark">Adults (16+)</span>
                          <div className="flex items-center gap-3">
                            <button
                              className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold btn-round"
                              onClick={() => updateRoomAdults(room.id, room.adults - 1)}
                              disabled={room.adults <= 0}
                            >
                              –
                            </button>
                            <span className="min-w-[20px] text-center text-lg font-semibold">
                              {room.adults}
                            </span>
                            <button
                              className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold btn-round"
                              onClick={() => updateRoomAdults(room.id, room.adults + 1)}
                              disabled={room.adults >= 9}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-dark">Children (0–15)</span>
                          <div className="flex items-center gap-3">
                            <button
                              className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold btn-round"
                              onClick={() =>
                                updateRoomChildren(room.id, room.children - 1)
                              }
                              disabled={room.children <= 0}
                            >
                              –
                            </button>
                            <span className="min-w-[20px] text-center text-lg font-semibold">
                              {room.children}
                            </span>
                            <button
                              className="w-9 h-9 flex items-center justify-center border rounded-full text-lg font-bold btn-round"
                              onClick={() =>
                                updateRoomChildren(room.id, room.children + 1)
                              }
                              disabled={room.children >= 9}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Child Ages */}
                        {room.childAges.map((age, childIndex) => (
                          <div key={childIndex} className="mb-3 ml-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Child {childIndex + 1} Age
                            </label>
                            <select
                              value={age}
                              onChange={(e) =>
                                updateChildAge(room.id, childIndex, e.target.value)
                              }
                              className="w-full border rounded px-3 py-2 select-box"
                            >
                              <option value="">Select age</option>
                              {[...Array(16).keys()].map((num) => (
                                <option key={num} value={num}>
                                  {num} years old
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </div>

                  {/* Done Button */}
                  <div className="mt-6 text-center">
                    {(() => {
                      const isAllAgesSelected = rooms.every((room) =>
                        room.childAges.every(
                          (age) =>
                            age !== "" &&
                            age !== null &&
                            age !== undefined &&
                            !isNaN(age)
                        )
                      );

                      return (
                        <button
                          onClick={() => {
                            if (isAllAgesSelected) {
                              setOpenGuest(false);
                            } else {
                              alert(
                                "Please select all children's ages before continuing!"
                              );
                            }
                          }}
                          className={`inline-block px-6 py-3 rounded-lg text-lg shadow-md btn-done ${
                            !isAllAgesSelected ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={!isAllAgesSelected}
                        >
                          Done
                        </button>
                      );
                    })()}
                  </div>
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

        {/* ROOM CATALOG SECTION */}
        {!openSearchResult ? (
          <section className="w-full max-w-6xl mx-auto mt-20 flex flex-col gap-16 pb-20">
            {RoomList.map((room, index) => (
              <div
                key={room.roomId}
                className={`flex flex-col md:flex-row ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                } bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="md:w-1/2 w-full">
                  <img
                    src={room.roomImage}
                    alt={room.roomName}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-semibold text-[#c19a6b] mb-3 uppercase">
                    {room.roomName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 font-medium">
                    {room.roomBed}
                  </p>
                  <p className="text-[#3a2f2a] text-sm mb-4 leading-relaxed">
                    {room.roomDesc}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-[#102E50]">
                      ${room.roomPrice}/night
                    </span>
                    
                  </div>
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
            
            {/* TAMPILKAN ROOM TYPES DENGAN DROPDOWN */}
            {!loading && availableRooms.map((roomType) => (
              <div key={roomType.roomTypeId} className="relative bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-start gap-6">
                <img
                  src={roomType.roomImage}
                  alt={roomType.roomName}
                  className="w-full md:w-64 h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedRoomId((prev) => prev === roomType.roomTypeId ? null : roomType.roomTypeId)}
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-[#c19a6b] mb-1">{roomType.roomName}</h3>
                  <p className="text-gray-500 mb-1">{roomType.roomBed}</p>
                  <p className="text-gray-700 mb-2">{roomType.roomDesc || "No description available."}</p>
                  
                  {/* Room Information */}
                  <div className="mb-4">
                    <p className="text-[#102E50] font-semibold text-lg">${roomType.roomPrice} / night</p>
                    <p className="text-sm text-gray-600">
                      Available: {roomType.availableRooms} room{roomType.availableRooms > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">Capacity: {roomType.capacity} adults</p>
                    <p className="text-sm text-gray-600">Duration: {roomType.duration} night{roomType.duration > 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Dropdown untuk memilih Room Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Room Number:
                    </label>
                    <select
                      className="w-full md:w-64 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c19a6b]"
                      value={selectedRoomNumbers[roomType.roomTypeId] || ''}
                      onChange={(e) => handleRoomNumberSelect(roomType.roomTypeId, e.target.value)}
                    >
                      <option value="">-- Select a room --</option>
                      {roomType.availableRoomNumbers?.map((room) => (
                        <option 
                          key={room.roomId} 
                          value={room.roomId}
                          disabled={cartRoomNumbers.includes(room.roomId)}
                        >
                          {room.roomNumber} {cartRoomNumbers.includes(room.roomId) ? '(In Cart)' : ''}
                        </option>
                      ))}
                    </select>
                    
                    {/* Error message jika room sudah di cart */}
                    {selectedRoomNumbers[roomType.roomTypeId] && 
                     cartRoomNumbers.includes(parseInt(selectedRoomNumbers[roomType.roomTypeId])) && (
                      <p className="text-red-500 text-sm mt-1">
                        This room is already in your cart
                      </p>
                    )}
                  </div>
                </div>

                {/* Button Add to Cart */}
                <button
                  onClick={() => addToCart(roomType)}
                  disabled={!selectedRoomNumbers[roomType.roomTypeId] || 
                            cartRoomNumbers.includes(parseInt(selectedRoomNumbers[roomType.roomTypeId]))}
                  className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg transition-colors duration-300 ${
                    !selectedRoomNumbers[roomType.roomTypeId] || 
                    cartRoomNumbers.includes(parseInt(selectedRoomNumbers[roomType.roomTypeId]))
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#c19a6b] hover:bg-[#a67c52] text-white"
                  }`}
                >
                  {!selectedRoomNumbers[roomType.roomTypeId] 
                    ? "Select Room First" 
                    : cartRoomNumbers.includes(parseInt(selectedRoomNumbers[roomType.roomTypeId]))
                      ? "Room in Cart"
                      : "Add to Cart"}
                </button>

                {/* POPUP DETAIL */}
                <AnimatePresence>
                  {selectedRoomId === roomType.roomTypeId && (
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
                          <DetailCard room={roomType} />
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