import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/admin.css';
import Log from '../components/log';

export default function Admin() {
  const [visibleTab, setVisibleTab] = useState(null);

  const currentTab = () => {
    switch (visibleTab) {
      case 'log':
        return <Log />;
      default:
        return (
          <div className="admin-placeholder">
            Select a section from the sidebar to view details.
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

      {/* ===== MAIN CONTENT WRAPPER (add padding-top to avoid overlap) ===== */}
      <div className="admin-main pt-20">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <button
            onClick={() => setVisibleTab('log')}
            className={`sidebar-btn ${visibleTab === 'log' ? 'active' : ''}`}
          >
            Log
          </button>
          <button
            onClick={() => setVisibleTab('room')}
            className={`sidebar-btn ${visibleTab === 'room' ? 'active' : ''}`}
          >
            Room
          </button>
        </aside>

        {/* Content */}
        <main className="admin-content">
          <div className="content-card">{currentTab()}</div>
        </main>
      </div>

      <footer className="admin-footer">
        © 2025 Nyx Hotel Admin Panel — All Rights Reserved.
      </footer>
    </div>
  );
}
