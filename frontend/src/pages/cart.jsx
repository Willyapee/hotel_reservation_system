import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Loader, Plus, Minus } from "lucide-react";
import ServicesPopup from '../components/servicePopup.jsx';

function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  // ✅ FETCH CART DATA
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/cart', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.cart)) {
        setCartData(result.cart);
      } else {
        setCartData([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setError(`Failed to load cart: ${error.message}`);
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HARDCODE FACILITIES DATA - PASTI BERHASIL
  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      console.log('🔄 Loading facilities data...');
      
      // Langsung gunakan data facilities yang Anda berikan
      const facilitiesData = [
        {
          "name": "The Grand Atrium",
          "desc": "Step into a world bathed in golden light, where marble floors meet soaring ceilings. The Grand Atrium is more than a lobby — it is the beginning of an unforgettable journey, where elegance greets you at every corner.",
          "img": "/public/lobby/lobby2.jpg",
          "facPrice": 0
        },
        {
          "name": "The Summit Lounge",
          "desc": "Perched above the city, this exclusive lounge welcomes you with refined elegance, curated spirits, and discreet luxury.",
          "img": "/public/fac/fac2.jpg",
          "facPrice": 25
        },
        {
          "name": "The Serenity Spa",
          "desc": "A sanctuary of tranquility, where every detail is designed to soothe the senses and rejuvenate the spirit. The Serenity Spa offers a haven of peace amidst the bustle of city life.",
          "img": "/public/fac/fac3.jpg",
          "facPrice": 80
        },
        {
          "name": "The Infinity Pool",
          "desc": "Dive into a world where the sky meets the water. The Infinity Pool offers a breathtaking view of the city skyline, creating a seamless blend of luxury and nature.",
          "img": "/public/fac/fac4.jpg", 
          "facPrice": 15
        }
      ];
      
      console.log('✅ Facilities data loaded:', facilitiesData);
      
      // Transform ke format yang diharapkan
      const transformedFacilities = facilitiesData.map((facility, index) => ({
        id_service: index + 1,
        name: facility.name,
        desc: facility.desc,
        service_price: facility.facPrice,
        unit: "per_booking",
        image: facility.img
      }));
      
      console.log('✅ Transformed facilities:', transformedFacilities);
      setServices(transformedFacilities);
      
    } catch (error) {
      console.error('Failed to load facilities:', error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ REMOVE ITEM FROM CART
  const handleRemove = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCartData(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // ✅ SIMULASI: ADD FACILITY TO CART (FRONTEND ONLY)
  const handleAddService = async (serviceId) => {
    if (!selectedCartItem) return;
    
    try {
      console.log('➕ Adding facility to cart item:', { 
        cartItemId: selectedCartItem.id, 
        serviceId: serviceId 
      });
      
      // Cari facility yang dipilih
      const selectedFacility = services.find(service => service.id_service === serviceId);
      
      if (selectedFacility) {
        console.log('✅ Selected facility:', selectedFacility);
        
        // ✅ SIMULASI: Update cart data di frontend
        const updatedCartData = cartData.map(item => {
          if (item.id === selectedCartItem.id) {
            // Buat service item baru
            const newService = {
              id: Date.now(), // ID sementara
              service: {
                name: selectedFacility.name,
                unit: selectedFacility.unit,
                price: selectedFacility.service_price
              },
              quantity: 1,
              totalPrice: selectedFacility.service_price
            };
            
            // Tambahkan ke services array
            const existingServices = item.services || [];
            return {
              ...item,
              services: [...existingServices, newService],
              totalPrice: (parseFloat(item.totalPrice) + parseFloat(selectedFacility.service_price)).toFixed(2)
            };
          }
          return item;
        });
        
        setCartData(updatedCartData);
        
        // Tampilkan alert konfirmasi
        alert(`✅ "${selectedFacility.name}" added to your booking!\n\nPrice: $${selectedFacility.service_price === 0 ? 'FREE' : selectedFacility.service_price}`);
        
        // Tutup modal
        setShowServicesModal(false);
        
      } else {
        console.error('❌ Facility not found with id:', serviceId);
        alert('❌ Failed to add facility. Please try again.');
      }
      
    } catch (error) {
      console.error('Add facility error:', error);
      alert('❌ Failed to add facility. Please try again.');
    }
  };

  // ✅ REMOVE FACILITY FROM CART ITEM
  const handleRemoveService = async (serviceItemId) => {
    try {
      console.log('🗑️ Removing facility:', serviceItemId);
      
      // Simulasi remove dari frontend
      const updatedCartData = cartData.map(item => {
        // Cari item yang memiliki service ini
        const updatedServices = item.services?.filter(service => service.id !== serviceItemId) || [];
        
        // Hitung ulang total price
        const servicesTotal = updatedServices.reduce((sum, service) => sum + parseFloat(service.totalPrice || 0), 0);
        const roomPrice = parseFloat(getRoomData(item).price || 0) * item.nights;
        const newTotalPrice = roomPrice + servicesTotal;
        
        return {
          ...item,
          services: updatedServices,
          totalPrice: newTotalPrice.toFixed(2)
        };
      });
      
      setCartData(updatedCartData);
      
      // Tampilkan konfirmasi
      alert('✅ Facility removed successfully!');
      
    } catch (error) {
      console.error('Remove facility error:', error);
      alert('❌ Failed to remove facility. Please try again.');
    }
  };

  // ✅ OPEN FACILITIES MODAL
  const openServicesModal = async (cartItem) => {
    setSelectedCartItem(cartItem);
    setShowServicesModal(true);
    await fetchServices();
  };

  const closeServicesModal = () => {
    setShowServicesModal(false);
    setSelectedCartItem(null);
  };

  const handleBackToCart = () => {
    setShowServicesModal(false);
    setSelectedCartItem(null);
  };

  // ✅ CALCULATE TOTAL PRICE
  const totalPrice = Array.isArray(cartData) 
    ? cartData.reduce((sum, item) => sum + (parseFloat(item?.totalPrice) || 0), 0)
    : 0;

  // ✅ FORMAT DATE
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
      return 'Invalid date';
    }
  };

  // ✅ GET ROOM DATA
  const getRoomData = (cartItem) => {
    if (!cartItem) return { name: "Room", price: 0, image: '/default-room.jpg' };
    
    if (cartItem.room && typeof cartItem.room === 'object') {
      return cartItem.room;
    }
    
    if (cartItem.room_data) {
      try {
        return typeof cartItem.room_data === 'string' 
          ? JSON.parse(cartItem.room_data) 
          : cartItem.room_data;
      } catch (error) {
        console.error('Failed to parse room_data:', error);
      }
    }
    
    return {
      name: "Room",
      price: 0,
      image: '/default-room.jpg',
      description: "Room description",
      bed_type: "No bed information",
      room_number: "-"
    };
  };

  // ✅ GET GUESTS DATA
  const getGuestsData = (cartItem) => {
    if (!cartItem) return { adults: 0, children: 0 };
    return cartItem.guests || {
      adults: cartItem.adults || 0,
      children: cartItem.children || 0
    };
  };

  // ✅ CALCULATE SERVICES TOTAL
  const calculateServicesTotal = (cartItem) => {
    if (!cartItem.services || !Array.isArray(cartItem.services)) return 0;
    
    return cartItem.services.reduce((sum, service) => {
      return sum + parseFloat(service.totalPrice || 0);
    }, 0);
  };

  // Error State
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ RENDER COMPONENT
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
        {!loading && !error && (!Array.isArray(cartData) || cartData.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-2xl p-10 text-center"
          >
            <p className="text-gray-600 text-lg mb-6">Your cart is currently empty.</p>
            <Link
              to="/booking"
              className="inline-block bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors duration-300"
            >
              Continue Booking
            </Link>
          </motion.div>
        )}

        {/* Cart Items */}
        {!loading && !error && Array.isArray(cartData) && cartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {cartData.map((cartItem) => {
              const room = getRoomData(cartItem);
              const guests = getGuestsData(cartItem);
              const itemId = cartItem?.id;
              
              if (!itemId) return null;

              const roomImage = room?.image ? room.image.replace('/public/', '/') : '/default-room.jpg';
              const hasServices = Array.isArray(cartItem.services) && cartItem.services.length > 0;
              const servicesTotal = calculateServicesTotal(cartItem);

              return (
                <div
                  key={itemId}
                  className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-lg p-6 gap-6 relative border border-gray-200"
                >
                  {/* ROOM IMAGE */}
                  <div className="w-full md:w-80 flex-shrink-0">
                    <img
                      src={roomImage}
                      alt={room?.name || "Room"}
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = '/default-room.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 w-full min-w-0">
                    <h3 className="text-2xl font-bold text-[#c19a6b] mb-2">
                      {room?.name || "Room"}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-1">
                      {room?.bed_type || "No bed information"}
                    </p>
                    
                    {room?.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {room.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-gray-600">
                      <p>
                        <span className="font-medium">Room Number:</span> {room?.room_number || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Guests:</span> {guests.adults} Adults, {guests.children} Children
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

                    {/* FACILITIES SECTION */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-[#102E50]">Additional Facilities:</h4>
                        <button
                          onClick={() => openServicesModal(cartItem)}
                          className="flex items-center gap-1 bg-[#102E50] hover:bg-[#0a1f3a] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <Plus className="w-4 h-4" />
                          Add Facility
                        </button>
                      </div>

                      {hasServices ? (
                        <div className="space-y-3">
                          {cartItem.services.map((serviceItem) => (
                            <div key={serviceItem.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#102E50] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {serviceItem.service?.name?.charAt(0) || 'F'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{serviceItem.service?.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {serviceItem.service?.unit === 'per_person' 
                                        ? `Per person × ${guests.adults + guests.children} guests`
                                        : 'Per booking'
                                      } • Qty: {serviceItem.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-[#c19a6b]">
                                  ${parseFloat(serviceItem.totalPrice || 0).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleRemoveService(serviceItem.id)}
                                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-300"
                                  title="Remove facility"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 text-sm">No facilities added yet</p>
                          <p className="text-gray-400 text-xs mt-1">Click "Add Facility" to enhance your stay</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Room ({cartItem.nights} nights):</span>
                        <span>${(parseFloat(room?.price || 0) * cartItem.nights).toFixed(2)}</span>
                      </div>
                      {hasServices && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Facilities:</span>
                          <span>+${servicesTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <p className="text-2xl font-bold text-[#c19a6b] pt-2 border-t">
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

            {/* FACILITIES POPUP */}
            <ServicesPopup
              isOpen={showServicesModal}
              onClose={closeServicesModal}
              onBackToCart={handleBackToCart}
              services={services}
              loading={servicesLoading}
              selectedRoom={selectedCartItem ? getRoomData(selectedCartItem) : null}
              onAddService={handleAddService}
            />

            {/* ORDER SUMMARY */}
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