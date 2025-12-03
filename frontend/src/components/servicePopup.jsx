import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, Users } from 'lucide-react';

const ServicesPopup = ({ 
  isOpen, 
  onClose, 
  onBackToCart, 
  services, 
  loading, 
  selectedRoom,
  onAddService 
}) => {
  
  if (!isOpen) return null;

  const handleAddServiceClick = (service) => {
    onAddService(service.id_service);
  };

  const totalGuests = selectedRoom?.guests 
    ? (selectedRoom.guests.adults || 0) + (selectedRoom.guests.children || 0)
    : 1;
  const adults = selectedRoom?.guests?.adults || 0;
  const children = selectedRoom?.guests?.children || 0;

  return (
    <>
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
      />

      {/* MAIN POPUP */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <button 
              onClick={onBackToCart}
              className="flex items-center bg-[#102E50] hover:bg-[#0a1f3a] text-white font-semibold px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </button>
            
            {selectedRoom?.guests && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {adults} Adult{adults !== 1 ? 's' : ''}
                  {children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                </span>
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Total: {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* TITLE */}
          <div className="text-center p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-[#102E50] mb-2">
              Add Services
            </h3>
            <p className="text-gray-600">
              Select services for your stay. Children get 50% discount on per-person services.
            </p>
          </div>

          {/* SERVICE LIST */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-10 h-10 animate-spin text-[#c19a6b] mx-auto mb-3" />
                <p className="text-gray-500 text-lg">Loading services...</p>
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => {
                  const isPerPerson = service.unit === 'per_person';
                  const servicePrice = parseFloat(service.service_price);
                  
                  let totalPrice = 0;
                  
                  if (isPerPerson && adults > 0) {
                    const adultTotal = servicePrice * adults;
                    const childTotal = children > 0 ? (servicePrice * 0.5) * children : 0;
                    totalPrice = adultTotal + childTotal;
                  } else {
                    totalPrice = servicePrice;
                  }
                  
                  return (
                    <div
                      key={service.id_service}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg"
                    >
                      <div className="h-40 bg-gray-100 overflow-hidden">
                        {service.image ? (
                          <img 
                            src={service.image.replace('/public/', '/')} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-room.jpg';
                            }}
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isPerPerson ? 'bg-blue-50' : 'bg-green-50'
                          }`}>
                            <div className="text-center">
                              <span className="font-semibold text-gray-700">
                                {service.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-xl font-bold text-[#102E50] mb-2">
                          {service.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {service.desc}
                        </p>
                        
                        {/* PRICE CALCULATION BREAKDOWN */}
                        {isPerPerson ? (
                          <div className="mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-blue-700">Price Calculation:</span>
                                <span className="text-sm font-semibold text-blue-800">
                                  {totalGuests} guest{totalGuests !== 1 ? 's' : ''} total
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                {adults > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Adults ({adults} × ${servicePrice.toFixed(2)}):
                                    </span>
                                    <span className="font-medium">
                                      ${(servicePrice * adults).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                
                                {children > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Children ({children} × ${servicePrice.toFixed(2)} × 0.5):
                                    </span>
                                    <span className="font-medium">
                                      ${((servicePrice * 0.5) * children).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                                  <span className="text-gray-800">Total:</span>
                                  <span className="text-blue-700">${totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 text-center">
                              💡 Children get 50% discount on per-person services
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-700">
                                Fixed price per booking
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Can be added only once per booking
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* PRICE DISPLAY & ADD BUTTON */}
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-[#c19a6b] font-bold text-xl">
                              ${servicePrice.toFixed(2)}
                              <span className="text-sm font-normal text-gray-600 ml-2">
                                {isPerPerson ? 'per adult' : 'per booking'}
                              </span>
                            </p>
                            
                            {isPerPerson && children > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Children: ${(servicePrice * 0.5).toFixed(2)} each
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddServiceClick(service)}
                            className="bg-[#102E50] hover:bg-[#0a1f3a] text-white px-5 py-3 rounded-lg font-semibold"
                          >
                            Add Service
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No services available</p>
                <p className="text-gray-400 text-sm mt-1">Please check back later</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p className="font-medium">✨ Service Pricing Information</p>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Per Person: Adults full price, Children 50% discount</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Per Booking: Fixed price, one per booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ServicesPopup;