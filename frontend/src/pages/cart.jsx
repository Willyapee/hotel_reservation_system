import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Loader } from "lucide-react";

function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🛒 Fetching cart data...');
        
        const response = await fetch('http://localhost:3000/api/cart', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🔍 FULL CART RESPONSE:', result);
        
        if (result.success && Array.isArray(result.cart)) {
          console.log('📦 CART ITEMS ANALYSIS:');
          result.cart.forEach((item, index) => {
            console.log(`--- Item ${index} ---`);
            console.log('ID:', item.id);
            console.log('Room property:', item.room);
            console.log('Room type:', typeof item.room);
            console.log('Room_data property:', item.room_data);
            console.log('CheckIn:', item.checkIn);
            console.log('CheckOut:', item.checkOut);
            console.log('Guests:', item.guests);
            console.log('TotalPrice:', item.totalPrice);
            console.log('All properties:', Object.keys(item));
          });
        }
        
        if (result.success) {
          setCartData(Array.isArray(result.cart) ? result.cart : []);
        } else {
          setError(result.message || 'Failed to load cart');
        }
      } catch (error) {
        console.error('❌ Failed to fetch cart:', error);
        setError(`Failed to load cart: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Remove item from cart
  const handleRemove = async (itemId) => {
    try {
      console.log('🗑️ Removing item:', itemId);
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.success) {
        setCartData(prev => prev.filter(item => item.id !== itemId));
      } else {
        alert(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from cart');
    }
  };

  // Calculate total price
  const totalPrice = cartData.reduce(
    (sum, item) => sum + (parseFloat(item.totalPrice) || 0),
    0
  );

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Invalid date';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getRoomData = (cartItem) => {
    console.log('🔄 Processing cart item:', cartItem);
    
    if (cartItem.room && typeof cartItem.room === 'object') {
      console.log('✅ Found room object:', cartItem.room);
      return cartItem.room;
    }
    
    if (cartItem.room_data) {
      console.log('📦 Found room_data:', cartItem.room_data);
      try {
        const roomData = typeof cartItem.room_data === 'string' 
          ? JSON.parse(cartItem.room_data) 
          : cartItem.room_data;
        console.log('✅ Parsed room_data:', roomData);
        return roomData;
      } catch (error) {
        console.error('❌ Failed to parse room_data:', error);
      }
    }
    
    if (cartItem.room && typeof cartItem.room === 'string') {
      try {
        console.log('📦 Found room string, parsing...');
        const roomData = JSON.parse(cartItem.room);
        console.log('✅ Parsed room string:', roomData);
        return roomData;
      } catch (error) {
        console.error('❌ Failed to parse room string:', error);
      }
    }
    
    // Fallback: Data default
    console.log('⚠️ Using fallback room data');
    return {
      name: "Room",
      price: 0,
      image: '/default-room.jpg',
      description: "Room description",
      bed_type: "No bed information",
      room_number: "-"
    };
  };

  // Get guests data
  const getGuestsData = (cartItem) => {
    return cartItem.guests || {
      adults: cartItem.adults || 0,
      children: cartItem.children || 0
    };
  };

  // Error Boundary Component
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/booking")}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Back to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {/* LIST ROOM */}
            {cartData.map((cartItem, index) => {
              const room = getRoomData(cartItem);
              const guests = getGuestsData(cartItem);
              const itemId = cartItem.id;
              
              console.log(`🎯 Final display data for item ${index}:`, {
                room,
                guests,
                itemId,
                totalPrice: cartItem.totalPrice
              });

              const roomImage = room.image ? 
                room.image.replace('/public/', '/') : 
                '/default-room.jpg';

              return (
                <div
                  key={itemId}
                  className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 gap-6 relative border border-gray-200"
                >
                  {/* ROOM IMAGE */}
                  <div className="w-full md:w-80 flex-shrink-0">
                    <img
                      src={roomImage}
                      alt={room.name}
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        console.log('❌ Image failed to load, using fallback');
                        e.target.src = '/default-room.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 w-full min-w-0">
                    <h3 className="text-2xl font-bold text-[#c19a6b] mb-2">
                      {room.name || "Room"}
                    </h3>
                    
                    {/* BED TYPE */}
                    <p className="text-gray-500 text-sm mb-1">
                      {room.bed_type || "No bed information"}
                    </p>
                    
                    {/* DESCRIPTION */}
                    {room.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {room.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-gray-600">
                      <p>
                        <span className="font-medium">Room Number:</span> {room.room_number || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Guests:</span> {guests.adults} Adults,{" "}
                        {guests.children} Children
                      </p>
                      <p>
                        <span className="font-medium">Check-in:</span> {formatDate(cartItem.checkIn)}
                      </p>
                      <p>
                        <span className="font-medium">Check-out:</span> {formatDate(cartItem.checkOut)}
                      </p>
                      <p>
                        <span className="font-medium">Stay:</span> {cartItem.nights || 0} night{cartItem.nights !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-[#102E50] font-bold text-xl">
                        ${parseFloat(room.price || 0).toFixed(2)} / night
                      </p>
                      <p className="text-2xl font-bold text-[#c19a6b]">
                        Total: ${parseFloat(cartItem.totalPrice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemove(itemId)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-300 absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              );
            })}

            {/* SUMMARY */}
            <div className="mt-10 bg-[#102E50] text-white p-8 rounded-xl shadow-xl space-y-4">
              <h3 className="text-2xl font-bold text-center mb-4">Order Summary</h3>
              
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
                  onClick={() => navigate("/checkout")}
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