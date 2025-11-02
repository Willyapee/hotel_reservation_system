import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Edit2, Save, X, Camera, Bell, Shield,
  CreditCard, Heart, History, LogOut,
  ArrowLeft
} from "lucide-react";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatar: "../picture/logo/logoNoBG.png"
  });

  const [formData, setFormData] = useState({ ...user });

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Redirect to login if no token
        navigate('/login');
        return;
      }

      try {
        // Fetch user data from backend
        const response = await axios.get('http://localhost:3000/auth/me', {
          withCredentials: true
        });

        const userData = response.data;
        setUser({
          name: userData.username,
          email: userData.email,
          joinDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          avatar: "../picture/logo/logoNoBG.png"
        });
        
        setFormData({
          name: userData.username,
          email: userData.email,
          joinDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          avatar: "../picture/logo/logoNoBG.png"
        });

        // Store username in localStorage for other components
        localStorage.setItem('username', userData.username);

      } catch (error) {
        console.error('Error fetching user data:', error);
        // If token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchUser();
  }, [navigate]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUser(formData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setFormData({ ...user });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // Redirect to home
    navigate('/');
    window.location.reload();
  };

  // Mock booking history
  const bookingHistory = [
    {
      id: 1,
      room: "Deluxe Suite",
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      total: "$1,200",
      status: "Completed"
    },
    {
      id: 2,
      room: "Executive Room",
      checkIn: "2024-02-10",
      checkOut: "2024-02-12",
      total: "$600",
      status: "Completed"
    }
  ];

  const ProfileInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block">
          <img
            src={user.avatar}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
          />
          <button className="absolute bottom-2 right-2 bg-[#c19a6b] text-white p-2 rounded-full hover:bg-[#a67c52] transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.name}</h2>
        <p className="text-gray-600 text-sm">Member since {user.joinDate}</p>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Personal Information - ONGOING DEVELOPMENT</h3>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 transition-colors"
          >
            {isEditing ? <Save className="w-5 h-5 text-[#8f632d] " /> : <Edit2 className="w-5 h-5 text-[#8f632d] " />}
            <span className="text-[#8f632d] ">
              {isEditing ? "Save" : "Edit"}
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleEditToggle}
              className="flex-1 bg-[#c19a6b] text-white py-2 rounded-lg hover:bg-[#a67c52] transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );

  const BookingHistory = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Booking History</h3>
      {bookingHistory.map(booking => (
        <div key={booking.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-800">{booking.room}</h4>
              <p className="text-gray-600 text-sm">
                {booking.checkIn} - {booking.checkOut}
              </p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                {booking.status}
              </span>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{booking.total}</p>
              <button className="text-[#c19a6b] hover:text-[#a67c52] text-sm mt-2">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "bookings", label: "Bookings", icon: History }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      {/* Header - Updated to match navigationBar.jsx exactly */}
      <div className='w-full h-fit fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-40'>
        <div className='flex items-center gap-x-8'>
          <img src='../picture/logo/logo.png' className='w-13 h-fit' alt="Nyx Hotel" />
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className='text-sm'>Back to Home</span>
          </button>
        </div>

        <div className="flex-grow flex justify-end items-center gap-x-6">
          {user.name ? (
            <button className="flex items-center gap-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c19a6b] to-[#a67c52] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity duration-300">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">{user.name}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-x-3 right-0">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out text-sm hover:scale-105 z-10"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add padding to account for fixed header */}
      <div className="pt-16">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <nav className="space-y-2">
                  {tabItems.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-[#c19a6b]"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-600"}`} />
                        <span className={activeTab === tab.id ? "text-white" : "text-gray-600"}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                {activeTab === "profile" && <ProfileInfo />}
                {activeTab === "bookings" && <BookingHistory />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;