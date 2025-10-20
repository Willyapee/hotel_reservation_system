import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/admin.css';
import Log from '../components/log';
import RoomManagement from '../components/roomManagement';

export default function Admin() {
  const [visibleTab, setVisibleTab] = useState(null);

  const currentTab = () => {
    switch (visibleTab) {
      case 'log':
        return <Log />;
      case 'room':
        return <RoomManagement />;
      default:
        return (
          <div className="admin-placeholder">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#102E50] rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="../picture/logo/logoNoBG.png" alt="Logo" className="w-22 h-22" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Select a section from the sidebar to manage your hotel operations.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      {/* ===== FIXED TOP NAVBAR ===== */}
      <div className="w-full h-17 fixed flex items-center justify-between px-8 py-2 bg-[#102E50] text-white z-10 shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">Admin Dashboard</h1>
        <Link to="/login">
          <button className="logout-btn">Log Out</button>
        </Link>
      </div>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="admin-main pt-20">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <button
            onClick={() => setVisibleTab('room')}
            className={`sidebar-btn ${visibleTab === 'room' ? 'active' : ''}`}
          >
            Room Management
          </button>
          <button
            onClick={() => setVisibleTab('log')}
            className={`sidebar-btn ${visibleTab === 'log' ? 'active' : ''}`}
          >
            Activity Log
          </button>
        </aside>

        {/* Content */}
        <main className="admin-content">
          <div className="content-card">{currentTab()}</div>
        </main>
      </div>

    </div>
  );
}