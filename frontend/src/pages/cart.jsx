import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Loader } from "lucide-react";

function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart data from backend API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/cart', {
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCartData(result.cart);
        } else {
          setError(result.message || 'Failed to load cart');
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Remove item from cart
  const handleRemove = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setCartData(prev => prev.filter(item => item.id !== itemId));
      } else {
        alert(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from cart');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCartData([]);
      } else {
        alert(result.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart');
    }
  };

  // Calculate total price
  const totalPrice = cartData.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );

  // Proceed to checkout
  const handleProceed = () => {
    if (cartData.length === 0) return;
    
    // Save cart data to localStorage for checkout page (optional)
    localStorage.setItem('cartData', JSON.stringify(cartData));
    navigate("/checkout");
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-2xl p-10 text-center"
          >
            <div className="flex justify-center items-center">
              <Loader className="w-8 h-8 animate-spin text-[#c19a6b] mr-3" />
              <span className="text-gray-600 text-lg">Loading your cart...</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-2xl p-10 text-center"
          >
            <p className="text-red-600 text-lg mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty Cart */}
        {!loading && !error && cartData.length === 0 && (
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
        )}

        {/* Cart Items */}
        {!loading && !error && cartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Clear Cart Button */}
            <div className="text-right">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-300"
              >
                Clear Entire Cart
              </button>
            </div>

            {/* LIST ROOM */}
            {cartData.map((cartItem, index) => (
              <div
                key={cartItem.id || index}
                className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-md p-6 gap-6 relative"
              >
                <img
                  src={cartItem.room?.image || '/default-room.jpg'}
                  alt={cartItem.room?.name || 'Room'}
                  className="w-full md:w-48 h-40 object-cover rounded-lg"
                />
                <div className="flex-1 w-full">
                  <h3 className="text-2xl font-semibold text-[#c19a6b] mb-2">
                    {cartItem.room?.name || "Room"}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    Type: {cartItem.room?.type || "-"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    Guests: {cartItem.guests?.adults || 0} Adults,{" "}
                    {cartItem.guests?.children || 0} Children
                  </p>
                  <p className="text-gray-600 mb-1">
                    Check-in: {formatDate(cartItem.checkIn)}
                  </p>
                  <p className="text-gray-600 mb-1">
                    Check-out: {formatDate(cartItem.checkOut)}
                  </p>
                  <p className="text-gray-600 mb-1">
                    Stay: {cartItem.nights || 0} night{cartItem.nights !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[#102E50] font-bold text-lg">
                    ${cartItem.room?.price || 0} / night
                  </p>
                  <p className="text-lg font-semibold text-[#c19a6b] mt-2">
                    Total: ${cartItem.totalPrice?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(cartItem.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-300 absolute top-4 right-4"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {/* SUMMARY */}
            <div className="mt-10 bg-[#102E50] text-white p-8 rounded-xl shadow-xl space-y-4">
              <h3 className="text-2xl font-bold text-center mb-4">Order Summary</h3>
              
              {cartData.length === 1 ? (
                <>
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{formatDate(cartData[0].checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{formatDate(cartData[0].checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Nights:</span>
                    <span>{cartData[0].nights}</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-200">
                    {cartData.length} room{cartData.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              <div className="border-t border-gray-600 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Price:</span>
                  <span className="text-3xl font-extrabold text-yellow-400">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={handleProceed}
                  className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-300 shadow-lg hover:scale-105"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/booking"
                  className="text-gray-300 hover:text-white underline transition-colors duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Cart;