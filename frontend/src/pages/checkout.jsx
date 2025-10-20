import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import "../css/checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cartData");
    if (stored) {
      setCartData(JSON.parse(stored));
    }
  }, []);

  const handleConfirmBooking = () => {
    alert("Booking confirmed!");
    localStorage.removeItem("cartData");
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] font-times">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center px-4 py-2 bg-primary z-10">
        <button
          onClick={() => navigate("/cart")}
          className="absolute left-6 z-20 flex items-center gap-2 text-white bg-primary px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-3sm font-medium">Back to Cart</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-10 pt-24 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {/* LEFT: FORM SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-8">
            Guest Information
          </h2>

          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+62 812-3456-7890"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Special Request (optional)
              </label>
              <textarea
                rows="4"
                placeholder="Add your special requests here..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
              ></textarea>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-primary mb-4">
                Policies & Acknowledgement
              </h3>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Check-in starts at 2:00 PM and check-out is until 12:00 PM.</li>
                <li>Cancellations made within 24 hours of booking are fully refundable.</li>
                <li>Smoking is not allowed inside rooms.</li>
                <li>Pets are allowed upon request.</li>
              </ul>

              <label className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={() => setAcknowledged(!acknowledged)}
                  className="w-5 h-5 accent-[#c19a6b]"
                />
                <span className="text-gray-700">
                  I have read and agree to the policies above.
                </span>
              </label>
            </div>

            <div className="text-center mt-10">
              <button
                type="button"
                disabled={!acknowledged}
                onClick={handleConfirmBooking}
                className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-300 ${
                  acknowledged
                    ? "bg-accent hover:bg-accent-dark text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </motion.div>

        {/* RIGHT: PRICE DETAILS */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 h-fit"
        >
          <h2 className="text-2xl font-bold text-primary mb-6">
            Price Details
          </h2>

          {cartData ? (
            <>
              <div className="space-y-4 border-b border-gray-200 pb-4">
                <p className="text-lg font-medium text-gray-700">
                  {cartData.name}
                </p>
                <p className="text-gray-600">{cartData.desc}</p>
                <p className="text-xl font-bold text-accent">
                  ${cartData.price} / night
                </p>
              </div>

              <div className="mt-6 flex justify-between text-gray-700 text-lg">
                <span>Subtotal</span>
                <span>${cartData.price}</span>
              </div>

              <div className="flex justify-between text-gray-700 text-lg">
                <span>Service Fee</span>
                <span>$10</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-primary mt-4">
                <span>Total</span>
                <span>${parseFloat(cartData.price) + 10}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-600">No item in cart.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;
