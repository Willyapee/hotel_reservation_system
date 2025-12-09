import '../css/navigationBar.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavigationBar({ openMenu, handleOpenMenu }) {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ 
    name: '', 
    initials: '', 
    isLoggedIn: false, 
    role: 'guest' 
  });

  useEffect(() => {
    console.log('🔧 NavigationBar mounted');
    loadUserData();
    window.addEventListener('userUpdated', loadUserData);
    return () => {
        window.removeEventListener('userUpdated', loadUserData);
    };
  }, []);

  const loadUserData = () => {
    const stored = localStorage.getItem('user');
    console.log('🔍 Loading from localStorage:', stored);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('✅ Parsed user data:', parsed);
        
        const userData = {
          name: parsed.name || parsed.username || '',
          initials: parsed.initials || (parsed.username || '').split(' ').map(n => n[0]).join('').toUpperCase(),
          isLoggedIn: parsed.isLoggedIn === undefined ? true : parsed.isLoggedIn, 
          role: parsed.role || 'guest'
        };
        
        console.log('✅ Setting user state:', userData);
        setUser(userData);
      } catch (e) {
        console.error('❌ Error parsing localStorage:', e);
      }
    }
  };

  const handleUserAction = () => {
    console.log('🖱️ ========== PROFILE BUTTON CLICKED ==========');
    console.log('🖱️ Current user state:', user);
    console.log('🖱️ localStorage:', localStorage.getItem('user'));
    
    const stored = localStorage.getItem('user');
    
    if (stored) {
      console.log('📍 localStorage ADA, navigating to /profile');
      navigate('/profile');
    } else {
      console.log('📍 localStorage KOSONG, navigating to /login');
      navigate('/login');
    }
  };

  console.log('🔄 RENDERING NavigationBar, user:', user);

  return (
    <div className='w-full h-fit fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-40'>
      <div className='flex items-center gap-x-8'>
        <img src='../picture/logo/logo.png' className='w-13 h-fit' alt="Logo" />
        <button onClick={handleOpenMenu} className="menuButton gap-x-2 flex items-center">
          <span>{openMenu ? '✕' : '☰'}</span>
          <p className='text-sm'>Menu</p>
        </button>
      </div>

      <div className="flex-grow flex justify-end items-center gap-x-6">
        {localStorage.getItem('user') ? (
          <button 
            onClick={handleUserAction} 
            className="flex items-center gap-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c19a6b] to-[#a67c52] flex items-center justify-center text-white font-bold text-sm">
              {user.initials || 'U'}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user.name || 'User'}</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-x-3">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm hover:scale-105"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}