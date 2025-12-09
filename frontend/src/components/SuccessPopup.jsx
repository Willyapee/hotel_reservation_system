import React, { useEffect } from 'react';
import { CheckCircle, X, Info, AlertCircle, Sparkles } from 'lucide-react';

const SuccessPopup = ({ 
  message, 
  onClose, 
  duration = 3000,
  type = 'success',
  position = 'center', 
  showCloseButton = true,
  autoClose = true,
  showIcon = true,
  buttonText = 'Continue'
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration, autoClose]);

  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      buttonColor: 'bg-[#102e50] hover:bg-[#1a3a5f]',
      title: 'Success!'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      title: 'Error!'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      title: 'Information'
    },
    luxury: {
      icon: Sparkles,
      iconColor: 'text-[#c19a6b]',
      bgColor: 'bg-[#102e50]',
      buttonColor: 'bg-[#c19a6b] hover:bg-[#a67c52]',
      title: 'Welcome!',
      isLuxury: true
    }
  };

  const { icon: Icon, iconColor, bgColor, buttonColor, title, isLuxury } = config[type];

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20'
  };

  return (
    <div className={`fixed inset-0 flex ${positionClasses[position]} z-50 bg-black/50 backdrop-blur-sm`}>
      <div className={`${isLuxury ? 'bg-gradient-to-br from-[#102e50] to-[#1a3a5f] border border-[#c19a6b]' : 'bg-white'} rounded-2xl p-6 max-w-sm mx-4 shadow-2xl transform animate-scale-in`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className={`${isLuxury ? 'bg-[#c19a6b]' : bgColor} p-2 rounded-full`}>
                <Icon className={`w-6 h-6 ${isLuxury ? 'text-white' : iconColor}`} />
              </div>
            )}
            <h3 className={`text-lg font-semibold ${isLuxury ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`transition-colors ${isLuxury ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className={`mb-4 ${isLuxury ? 'text-gray-200' : 'text-gray-600'}`}>{message}</p>
        <button
          onClick={onClose}
          className={`w-full ${buttonColor} text-white py-2 px-4 rounded-lg transition-colors font-medium`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;