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
        console.log('🛒 Cart Data Received:', result.cart);
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

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      console.log('🔄 Loading services from backend...');
      
      const response = await fetch('http://localhost:3000/admin/services');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const servicesData = await response.json();
      console.log('✅ Services data loaded:', servicesData);
      
      setServices(servicesData);
      
    } catch (error) {
      console.error('Failed to load services:', error);
      const defaultServices = [
        { id_service: 1, name: "Breakfast", desc: "Premium buffet breakfast with international cuisine", service_price: "35.00", unit: "per_person" },
        { id_service: 2, name: "Business Center", desc: "Executive business facilities with meeting rooms", service_price: "50.00", unit: "per_booking" },
        { id_service: 3, name: "Rooftop Beach Club", desc: "Exclusive rooftop beach club with pool and bar", service_price: "75.00", unit: "per_person" },
        { id_service: 4, name: "Spa", desc: "Luxury spa treatments and massages", service_price: "89.00", unit: "per_person" },
        { id_service: 5, name: "Butler Service", desc: "Personal butler service for premium guests", service_price: "120.00", unit: "per_booking" }
      ];
      setServices(defaultServices);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    console.log('🔄 Cart Data Updated:', cartData);
    if (cartData && cartData.length > 0) {
      cartData.forEach((item, index) => {
        console.log(`📦 Cart Item ${index}:`, {
          id: item.id,
          cart_item_id: item.cart_item_id,
          services: item.services,
          servicesCount: item.services?.length || 0
        });
        
        if (item.services && item.services.length > 0) {
          item.services.forEach((service, serviceIndex) => {
            console.log(`   🛍️ Service ${serviceIndex}:`, {
              id: service.id,
              cart_item_service_id: service.cart_item_service_id,
              service: service.service
            });
          });
        }
      });
    }
  }, [cartData]);

  const handleRemove = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('❌ Failed to remove item from cart');
    }
  };

  const handleAddService = async (serviceId) => {
  if (!selectedCartItem) return;
  
  try {
    console.log('➕ [FRONTEND] Adding service:', { 
      cartItemId: selectedCartItem.id, 
      serviceId
    });
    
    const response = await fetch(`http://localhost:3000/api/cart/${selectedCartItem.id}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        serviceId: serviceId
      })
    });
    
    console.log('📨 Response status:', response.status);
    const result = await response.json();
    console.log('📨 Response data:', result);
    
    if (!response.ok) {
      const errorMsg = result.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }
    
    if (result.success) {
      await fetchCart();
      
      const selectedService = services.find(service => service.id_service == serviceId);
      const guests = getGuestsData(selectedCartItem);
      const totalGuests = guests.adults + guests.children;
     
      let priceInfo = '';
      if (selectedService.unit === 'per_person') {
        const unitPrice = parseFloat(selectedService.service_price);
        const totalPrice = unitPrice * totalGuests;
        priceInfo = `$${unitPrice.toFixed(2)} per person × ${totalGuests} guest(s) = $${totalPrice.toFixed(2)}`;
      } else {
        priceInfo = `$${selectedService.service_price} per booking (fixed)`;
      }
        
      alert(`✅ "${selectedService.name}" added to your booking!\n\n${priceInfo}`);
      
      setShowServicesModal(false);
    } else {
      throw new Error(result.message || 'Failed to add service');
    }
    
  } catch (error) {
    console.error('❌ Add service error:', error);
    alert(`❌ Failed to add service: ${error.message}`);
  }
};

  const handleRemoveService = async (serviceItemId) => {
    try {
      console.log('🗑️ Removing service:', serviceItemId);
      
      const response = await fetch(`http://localhost:3000/api/cart/services/${serviceItemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove service');
      }
      
      if (result.success) {
        await fetchCart();
        alert('✅ Service removed successfully!');
      }
      
    } catch (error) {
      console.error('Remove service error:', error);
      alert(`❌ Failed to remove service: ${error.message}`);
    }
  };

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

  const totalPrice = Array.isArray(cartData) 
    ? cartData.reduce((sum, item) => sum + (parseFloat(item?.totalPrice) || 0), 0)
    : 0;

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

  const getGuestsData = (cartItem) => {
    if (!cartItem) return { adults: 0, children: 0 };
    return cartItem.guests || {
      adults: cartItem.adults || 0,
      children: cartItem.children || 0
    };
  };

  const calculateServicesTotal = (cartItem) => {
    if (!cartItem.services || !Array.isArray(cartItem.services)) return 0;
    
    return cartItem.services.reduce((sum, service) => {
      return sum + parseFloat(service.totalPrice || 0);
    }, 0);
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('breakfast')) return '🍽️';
    if (name.includes('business')) return '💼';
    if (name.includes('spa')) return '💆';
    if (name.includes('beach') || name.includes('pool')) return '🏖️';
    if (name.includes('butler')) return '👔';
    if (name.includes('laundry')) return '🧺';
    if (name.includes('parking')) return '🅿️';
    if (name.includes('wifi')) return '📶';
    return '⭐';
  };

  const getServiceId = (serviceItem) => {
    return serviceItem.id || 
           serviceItem.cart_item_service_id || 
           serviceItem.service_id ||
           serviceItem.serviceId;
  };

  const getCartItemId = (cartItem) => {
    return cartItem.id || cartItem.cart_item_id;
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

  // RENDER COMPONENT
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
              const itemId = getCartItemId(cartItem);
              
              if (!itemId) {
                console.warn('❌ Cart item missing ID:', cartItem);
                return null;
              }

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
                        <span className="font-medium">Room Type:</span> {room?.name || "Room"}
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

                    {/* SERVICES SECTION */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-[#102E50]">Additional Services:</h4>
                        <button
                          onClick={() => openServicesModal(cartItem)}
                          className="flex items-center gap-1 bg-[#102E50] hover:bg-[#0a1f3a] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <Plus className="w-4 h-4" />
                          Add Service
                        </button>
                      </div>

                      {hasServices ? (
  <div className="space-y-3">
    {cartItem.services.map((serviceItem) => {
      const serviceId = getServiceId(serviceItem);
      const guests = getGuestsData(cartItem);
      const isPerPerson = serviceItem.service?.unit === 'per_person';
      
      return (
        <div key={serviceId} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${
                isPerPerson ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {getServiceIcon(serviceItem.service?.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{serviceItem.service?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isPerPerson 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {isPerPerson ? `For ${guests.adults + guests.children} guest${guests.adults + guests.children !== 1 ? 's' : ''}` : 'Per booking'}
                  </span>
                </div>
                
                {isPerPerson && (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>• Adults: {guests.adults} × ${serviceItem.service?.price} = ${(serviceItem.service?.price * guests.adults).toFixed(2)}</p>
                    <p>• Children: {guests.children} × (${serviceItem.service?.price} × 0.5) = ${((serviceItem.service?.price * 0.5) * guests.children).toFixed(2)}</p>
                    <p className="font-medium mt-1">Total: ${serviceItem.totalPrice}</p>
                  </div>
                )}
                
                {!isPerPerson && (
                  <p className="text-sm text-gray-600 mt-1">
                    Fixed price: ${serviceItem.totalPrice}
                  </p>
                )}
                
                {serviceItem.service?.desc && (
                  <p className="text-xs text-gray-500 mt-1">{serviceItem.service.desc}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-[#c19a6b]">
              ${parseFloat(serviceItem.totalPrice || 0).toFixed(2)}
            </span>
            <button
              onClick={() => handleRemoveService(serviceId)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-300"
              title="Remove service"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <p className="text-gray-500 text-sm">No services added yet</p>
    <p className="text-gray-400 text-xs mt-1">Click "Add Service" to enhance your stay</p>
  </div>
)}
                    </div>
                    
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Room ({cartItem.nights} nights @ ${cartItem.room?.pricePerNight}/night):</span>
                        <span>${parseFloat(cartItem.room?.totalForStay || 0).toFixed(2)}</span>
                      </div>
                      {hasServices && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Services:</span>
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

            {/* SERVICES POPUP */}
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