import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";

function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("cartData");
    if (stored) {
      setCartData(JSON.parse(stored));
    }
  }, []);

  const handleRemove = () => {
    localStorage.removeItem("cartData");
    setCartData(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] font-[Times_New_Roman]">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-10">
        <button
          onClick={() => navigate("/booking")}
          className="absolute left-6 z-20 flex items-center gap-2 text-white bg-[#102E50] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-3sm font-medium">Back to Booking</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-10 pt-24 max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-[#102E50] mb-12 text-center">
          Your Cart
        </h2>

        {/* Jika Cart Kosong */}
        {!cartData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-2xl p-10 text-center"
          >
            <p className="text-gray-600 text-lg mb-6">
              Your cart is currently empty.
            </p>
            <Link
              to="/booking"
              className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors duration-300"
            >
              Continue Booking
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Room Detail */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-md p-6 gap-6">
              <img
                src={cartData.room.image}
                alt={cartData.room.name}
                className="w-full md:w-48 h-40 object-cover rounded-lg"
              />
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-semibold text-[#c19a6b] mb-2">
                  {cartData.room.name}
                </h3>
                <p className="text-gray-600 mb-1">Type: {cartData.room.type}</p>
                <p className="text-gray-600 mb-1">
                  Guests: {cartData.guests.adults} Adults,{" "}
                  {cartData.guests.children} Children
                </p>
                <p className="text-gray-600 mb-1">
                  Stay: {cartData.nights} nights
                </p>
                <p className="text-[#102E50] font-bold text-lg">
                  ${cartData.room.price} / night
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 />
              </button>
            </div>

            {/* Booking Summary */}
            <div className="mt-10 bg-[#102E50] text-white p-8 rounded-xl shadow-xl space-y-2">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span>{cartData.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span>{cartData.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Nights:</span>
                <span>{cartData.nights}</span>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-lg font-medium">Total Price:</span>
                <span className="text-3xl font-extrabold text-yellow-400">
                  ${cartData.room.total}
                </span>
              </div>

              <div className="text-center mt-8">
                <button className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-300">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Cart;
