import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Eye, Bed, Users, DollarSign } from 'lucide-react';
import RoomList from '../../../backend/data/roomList.json';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  // Form state - adjusted to match JSON structure
  const [formData, setFormData] = useState({
    roomId: '',
    roomName: '',
    roomBed: '',
    roomImage: '',
    roomPrice: '',
    roomDesc: '',
    status: 'available'
  });

  // Load rooms from JSON on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    try {
      // Add status to each room since it's not in the JSON
      const roomsWithStatus = RoomList.map(room => ({
        ...room,
        status: 'available' // Default status
      }));
      setRooms(roomsWithStatus);
    } catch (error) {
      console.error('Error loading rooms:', error);
      alert('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomName.trim()) {
      newErrors.roomName = 'Room name is required';
    } else if (rooms.some(room => 
      room.roomName === formData.roomName && 
      room.roomId !== editingRoom?.roomId
    )) {
      newErrors.roomName = 'Room name already exists';
    }

    if (!formData.roomBed.trim()) {
      newErrors.roomBed = 'Room bed info is required';
    }

    if (!formData.roomPrice || formData.roomPrice <= 0) {
      newErrors.roomPrice = 'Valid price is required';
    }

    if (!formData.roomDesc.trim()) {
      newErrors.roomDesc = 'Description is required';
    }

    if (!formData.roomImage.trim()) {
      newErrors.roomImage = 'Room image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roomPrice' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Create new room
  const handleCreate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const newRoom = {
        roomId: String(rooms.length + 1), // Generate new ID
        roomName: formData.roomName,
        roomBed: formData.roomBed,
        roomImage: formData.roomImage,
        roomPrice: formData.roomPrice,
        roomDesc: formData.roomDesc,
        status: formData.status
      };

      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      alert('Room created successfully!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  // Update room
  const handleUpdate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const updatedRooms = rooms.map(room => 
        room.roomId === editingRoom.roomId 
          ? {
              ...room,
              roomName: formData.roomName,
              roomBed: formData.roomBed,
              roomImage: formData.roomImage,
              roomPrice: formData.roomPrice,
              roomDesc: formData.roomDesc,
              status: formData.status
            }
          : room
      );

      setRooms(updatedRooms);
      alert('Room updated successfully!');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room');
    }
  };

  // Delete room with confirmation
  const handleDelete = (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      const updatedRooms = rooms.filter(room => room.roomId !== roomId);
      setRooms(updatedRooms);
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    }
  };

  // Edit room - populate form with existing data
  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomId: room.roomId,
      roomName: room.roomName,
      roomBed: room.roomBed,
      roomImage: room.roomImage,
      roomPrice: room.roomPrice,
      roomDesc: room.roomDesc,
      status: room.status || 'available'
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      roomId: '',
      roomName: '',
      roomBed: '',
      roomImage: '',
      roomPrice: '',
      roomDesc: '',
      status: 'available'
    });
    setEditingRoom(null);
    setErrors({});
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomBed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="room-management">
      {/* Header with Actions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#102E50] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a5f] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search rooms by name, bed type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rooms...</p>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div key={room.roomId} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Room Image */}
              <div className="h-48 bg-gradient-to-br from-[#102E50] to-[#1a3a5f] relative">
                <img 
                  src={room.roomImage} 
                  alt={room.roomName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    room.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : room.status === 'occupied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-xl font-bold">{room.roomName}</h3>
                  <p className="text-sm opacity-90">{room.roomBed.split(' • ')[0]}</p>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {room.roomDesc}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{room.roomBed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">${room.roomPrice}/night</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 bg-[#c19a6b] text-white py-2 px-3 rounded-lg hover:bg-[#a67c52] transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.roomId)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No rooms found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first room'}
          </p>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingRoom ? handleUpdate : handleCreate} className="p-6">
              <div className="space-y-4">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent ${
                      errors.roomName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Stellar Suite, Orion Suite"
                  />
                  {errors.roomName && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>
                  )}
                </div>

                {/* Room Bed Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Bed Info *
                  </label>
                  <input
                    type="text"
                    name="roomBed"
                    value={formData.roomBed}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent ${
                      errors.roomBed ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., King Bed • 40m², King Bed • Living Area • 50m²"
                  />
                  {errors.roomBed && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomBed}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night ($) *
                  </label>
                  <input
                    type="number"
                    name="roomPrice"
                    value={formData.roomPrice}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent ${
                      errors.roomPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="200"
                    min="0"
                  />
                  {errors.roomPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomPrice}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="roomDesc"
                    value={formData.roomDesc}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent ${
                      errors.roomDesc ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the room features and view..."
                  />
                  {errors.roomDesc && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomDesc}</p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Image URL *
                  </label>
                  <input
                    type="text"
                    name="roomImage"
                    value={formData.roomImage}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent ${
                      errors.roomImage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., ../public/room/room1.jpg"
                  />
                  {errors.roomImage && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomImage}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#102E50] text-white py-3 px-4 rounded-lg hover:bg-[#1a3a5f] transition-colors"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;