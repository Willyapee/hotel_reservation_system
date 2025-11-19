import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader } from 'lucide-react';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Popup utama */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <button 
                  onClick={onBackToCart}
                  className="flex items-center bg-[#102E50] hover:bg-[#0a1f3a] text-white font-semibold transition-colors px-4 py-2 rounded-lg hover:scale-105 shadow-md"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Cart
                </button>
              </div>

              {/* Title */}
              <div className="text-center p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-2xl font-bold text-[#102E50] mb-2">
                  Add Facilities
                </h3>
                <p className="text-gray-600">
                  Enhance your stay with our premium facilities
                </p>
              </div>

              {/* Facilities List - SCROLLABLE AREA */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader className="w-10 h-10 animate-spin text-[#c19a6b] mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">Loading facilities...</p>
                  </div>
                ) : services && services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((facility, index) => (
                      <motion.div
                        key={facility.id_service || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 hover:border-[#c19a6b]"
                      >
                        {/* Facility Image */}
                        <div className="h-40 bg-gray-100 overflow-hidden">
                          {facility.image ? (
                            <img 
                              src={facility.image.replace('/public/', '/')} 
                              alt={facility.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = '/default-room.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#c19a6b] to-[#a67c52] flex items-center justify-center">
                              <span className="text-white font-semibold text-center px-2">
                                {facility.name}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Facility Info */}
                        <div className="p-4">
                          <h4 className="text-xl font-bold text-[#102E50] mb-2 line-clamp-1">
                            {facility.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                            {facility.desc}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[#c19a6b] font-bold text-xl">
                                {facility.service_price === 0 ? 'FREE' : `$${facility.service_price}`}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {facility.unit === 'per_person' ? 'per person' : 'per booking'}
                              </p>
                            </div>
                            <button
                              onClick={() => onAddService(facility.id_service)}
                              className="bg-[#102E50] hover:bg-[#0a1f3a] text-white px-5 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md"
                            >
                              {facility.service_price === 0 ? 'Add Free' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">No Facilities Available</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      We're currently updating our facilities. Please check back later or contact our concierge for available options.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex-shrink-0">
                <p className="text-center text-gray-500 text-sm">
                  Need assistance? Contact our concierge at{" "}
                  <span className="text-[#102E50] font-semibold">concierge@hotel.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ServicesPopup;