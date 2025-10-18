import '../css/navigationBar.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import PlaceHolder from '../../public/picture/placeHolder.png';

export default function NavigationBar({ openMenu, handleOpenMenu }) {
  const user = {
    name: 'John Doe',
    initials: 'JD',
    isLoggedIn: true
  };

  return (
    <div className='w-full h-fit fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-40'>
      <div className='flex items-center gap-x-8'>
        <img src='../picture/logo/logo.png' className='w-13 h-fit' />
        <button onClick={handleOpenMenu} 
          className="menuButton gap-x-2 flex items-center">
          <span>{openMenu ? '✕' : '☰'}</span>
          <p className='text-sm'>Menu</p>
        </button>
      </div>

      <div className="flex-grow flex justify-end items-center gap-x-6">
        {user.isLoggedIn ? (
          <button className="flex items-center gap-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c19a6b] to-[#a67c52] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity duration-300">
              {user.initials}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user.name}</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-x-3 right-0">
            <button className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out text-sm hover:scale-105 z-10">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}