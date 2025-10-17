import React from 'react';

const MenuOverlay = ({ isOpen, onClose, onNavigate }) => {
  const user = {
    name: 'John Doe',
    initials: 'JD',
    isLoggedIn: false
  };

  const menuItems = [
    {
      id: 'facilities',
      label: 'Our Facilities',
      section: 'facilities'
    },
    {
      id: 'rooms',
      label: 'Check Our Rooms',
      section: 'rooms'
    },
    {
      id: 'dine',
      label: 'Dine With Us',
      section: 'dine'
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.section) {
      onNavigate(item.section);
      onClose();
    } else if (item.path) {
      window.location.href = item.path;
    }
  };

  const handleUserAction = () => {
    if (user.isLoggedIn) {
      // Navigate to user profile or perform user action
      console.log('Navigate to user profile');
    } else {
      // Navigate to sign in
      window.location.href = '/register';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 w-64 h-full bg-[#0a1e34] text-gray-200 z-50 p-6 pt-20
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="close-button-hover fixed top-4 left-4 z-[1100] text-white bg-none border-none cursor-pointer text-2xl"
        >
          ✕
        </button>

        {/* Nyx Hotel with fade line */}
        <div className="mb-5">
          <h2 className="font-playfair text-2xl font-bold text-white uppercase">
            Nyx Hotel
          </h2>
          <div className="h-px bg-gray-400 mt-3"></div>
        </div>
        
        <ul className="list-none">
          {menuItems.map((item) => (
            <li key={item.id} className="my-6">
              <button
                onClick={() => handleMenuClick(item)}
                className="overlay-menu-item text-lg font-medium text-white w-full text-left bg-none border-none cursor-pointer py-2 px-1"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* User Profile / Sign In at the bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={handleUserAction}
              className="w-full flex items-center gap-3 text-white hover:text-[#f0a500] transition-all duration-300 bg-none border-none cursor-pointer group"
            >
              {user.isLoggedIn ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c19a6b] to-[#a67c52] flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                    {user.initials}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300">View Profile</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Sign In</p>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuOverlay;