import React, { useState } from 'react';
import SuccessPopup from './SuccessPopup';
import { Eye, EyeOff, Settings } from 'lucide-react';

const PopupDesignPlayground = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    message: "Registration successful! Welcome to Nyx Hotel.",
    duration: 3000,
    type: 'success',
    position: 'center',
    showCloseButton: true,
    autoClose: true,
    showIcon: true,
    buttonText: 'Continue'
  });

  const handleConfigChange = (key, value) => {
    setPopupConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const popupTypes = [
    { value: 'success', label: 'Success', color: 'bg-green-500' },
    { value: 'error', label: 'Error', color: 'bg-red-500' },
    { value: 'info', label: 'Info', color: 'bg-blue-500' },
    { value: 'luxury', label: 'Luxury', color: 'bg-[#102e50]' }
  ];

  const positions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' }
  ];

  const presetMessages = {
    register: "Registration successful! Welcome to Nyx Hotel.",
    login: "Login successful! Welcome back to Nyx Hotel.",
    booking: "Your booking has been confirmed!",
    error: "Something went wrong. Please try again."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-[#102e50]" />
            <h1 className="text-3xl font-bold text-gray-800">Popup Design Playground</h1>
          </div>
          <p className="text-gray-600">Customize and preview your popup designs in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>

            <div className="space-y-6">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popup Message
                </label>
                <textarea
                  value={popupConfig.message}
                  onChange={(e) => handleConfigChange('message', e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent resize-none"
                  placeholder="Enter your message..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(presetMessages).map(([key, message]) => (
                    <button
                      key={key}
                      onClick={() => handleConfigChange('message', message)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Popup Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {popupTypes.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => handleConfigChange('type', value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        popupConfig.type === value 
                          ? 'border-[#c19a6b] bg-[#c19a6b]/10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Position
                </label>
                <div className="flex gap-3">
                  {positions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleConfigChange('position', value)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        popupConfig.position === value 
                          ? 'border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b]' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (ms)
                  </label>
                  <input
                    type="number"
                    value={popupConfig.duration}
                    onChange={(e) => handleConfigChange('duration', Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={popupConfig.buttonText}
                    onChange={(e) => handleConfigChange('buttonText', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={popupConfig.autoClose}
                    onChange={(e) => handleConfigChange('autoClose', e.target.checked)}
                    className="rounded border-gray-300 text-[#c19a6b] focus:ring-[#c19a6b]"
                  />
                  <span className="text-sm text-gray-700">Auto Close</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={popupConfig.showCloseButton}
                    onChange={(e) => handleConfigChange('showCloseButton', e.target.checked)}
                    className="rounded border-gray-300 text-[#c19a6b] focus:ring-[#c19a6b]"
                  />
                  <span className="text-sm text-gray-700">Close Button</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={popupConfig.showIcon}
                    onChange={(e) => handleConfigChange('showIcon', e.target.checked)}
                    className="rounded border-gray-300 text-[#c19a6b] focus:ring-[#c19a6b]"
                  />
                  <span className="text-sm text-gray-700">Show Icon</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </h2>

            <div className="space-y-6">
              {/* Preview Area */}
              <div className="bg-gray-900 rounded-xl p-8 min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#102e50] to-[#1a3a5f] opacity-20"></div>
                
                {/* Simulated background content */}
                <div className="relative z-10 text-center text-white">
                  <div className="inline-block bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold mb-2">Your App Background</h3>
                    <p className="text-gray-300 text-sm">This simulates your actual app background</p>
                  </div>
                </div>

                {/* The actual popup for preview */}
                {showPopup && (
                  <SuccessPopup 
                    message={popupConfig.message}
                    onClose={() => setShowPopup(false)}
                    duration={popupConfig.duration}
                    type={popupConfig.type}
                    position={popupConfig.position}
                    showCloseButton={popupConfig.showCloseButton}
                    autoClose={popupConfig.autoClose}
                    showIcon={popupConfig.showIcon}
                    buttonText={popupConfig.buttonText}
                  />
                )}
              </div>

              {/* Test Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPopup(true)}
                  className="flex-1 bg-[#102e50] text-white px-6 py-3 rounded-lg hover:bg-[#1a3a5f] transition-colors font-semibold"
                >
                  Show Popup
                </button>
                
                <button
                  onClick={() => {
                    handleConfigChange('message', presetMessages.register);
                    handleConfigChange('type', 'success');
                    setShowPopup(true);
                  }}
                  className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Test Register
                </button>

                <button
                  onClick={() => {
                    handleConfigChange('message', presetMessages.login);
                    handleConfigChange('type', 'luxury');
                    setShowPopup(true);
                  }}
                  className="px-4 py-3 bg-[#c19a6b] text-white rounded-lg hover:bg-[#a67c52] transition-colors"
                >
                  Test Login
                </button>
              </div>

              {/* Current Configuration Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration:</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(popupConfig, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupDesignPlayground;