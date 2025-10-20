import React, { useState, useEffect } from 'react';

const MenuOverlay = ({ isOpen, onClose, onNavigate }) => {
  const [user, setUser] = useState({
    name: '',
    initials: '',
    isLoggedIn: false,
    role: 'guest'
  });

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (token && username) {
      setUser({
        name: username,
        initials: username.split(' ').map(n => n[0]).join('').toUpperCase(),
        isLoggedIn: true,
        role: role || 'guest'
      });
    }
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

  // Tambahkan item menu Admin hanya jika user adalah admin
  if (user.isLoggedIn && user.role === 'admin') {
    menuItems.push({
      id: 'admin',
      label: 'Admin Dashboard',
      path: '/admin'
    });
  }

  const handleMenuClick = (item) => {
    if (item.section) {
      onNavigate(item.section);
      onClose();
    } else if (item.path) {
      if (item.path === '/admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = item.path;
      }
    }
  };

  const handleUserAction = () => {
    if (user.isLoggedIn) {
      window.location.href = '/profile';
    } else {
      window.location.href = '/login';
    }
  };

  const handleSignOut = (e) => {
    e.stopPropagation();
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // Reset user state
    setUser({
      name: '',
      initials: '',
      isLoggedIn: false,
      role: 'guest'
    });
    
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed top-0 left-0 w-64 h-full bg-[#0a1e34] text-gray-200 z-50 p-6 pt-20
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={onClose}
          className="close-button-hover fixed top-4 left-4 z-[1100] text-white bg-none border-none cursor-pointer text-2xl"
        >
          ✕
        </button>

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
                className={`overlay-menu-item text-lg font-medium w-full text-left bg-none border-none cursor-pointer py-2 px-1 transition-all duration-300 ${
                  item.id === 'admin' 
                    ? 'text-[#c19a6b] hover:text-[#f0a500] border-l-2 border-[#c19a6b] pl-3' 
                    : 'text-white hover:text-[#f0a500]'
                }`}
              >
                {item.label}
                {item.id === 'admin' && (
                  <span className="ml-2 text-xs bg-[#c19a6b] text-white px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* User Profile / Sign In */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="pt-4 border-t border-gray-600">
            {user.isLoggedIn ? (
              <div className="w-full">
                <button
                  onClick={handleUserAction}
                  className="w-full flex items-center gap-3 text-white hover:text-[#f0a500] transition-all duration-300 bg-none border-none cursor-pointer group mb-2"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform relative ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-br from-[#102E50] to-[#1a3a5f]' 
                      : 'bg-gradient-to-br from-[#c19a6b] to-[#a67c52]'
                  }`}>
                    {user.initials}
                    {user.role === 'admin' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a1e34]"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300">
                      {user.role === 'admin' ? 'Administrator' : 'View Profile'}
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-gray-300 text-xs"></i>
                </button>
                
                <div className="h-px bg-gray-400 mt-3"></div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-sm text-red-500 hover:text-red-400 transition-colors bg-none border-none cursor-pointer text-left py-2 mt-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleUserAction}
                className="w-full flex items-center gap-3 text-white hover:text-[#f0a500] transition-all duration-300 bg-none border-none cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Sign In</p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300">Access your account</p>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-gray-300 text-xs"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuOverlay;