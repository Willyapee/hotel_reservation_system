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
    name: '',
    capacity: '',
    price_per_night: '',
    description: '',
    room_bed: '',
    max_stay_duration: 30,
    image_url: ''
  });

  // Load rooms from API on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/room-types');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const roomTypes = await response.json();
      setRooms(roomTypes);
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

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }

    if (!formData.room_bed.trim()) {
      newErrors.room_bed = 'Room bed info is required';
    }

    if (!formData.price_per_night || formData.price_per_night <= 0) {
      newErrors.price_per_night = 'Valid price is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.max_stay_duration || formData.max_stay_duration <= 0) {
      newErrors.max_stay_duration = 'Valid max stay duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_night' || name === 'capacity' || name === 'max_stay_duration' 
        ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Create new room type
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:3000/admin/room-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room type');
      }
      
      alert('Room type created successfully!');
      setShowModal(false);
      resetForm();
      fetchRooms(); // Refresh the list
    } catch (error) {
      console.error('Error creating room type:', error);
      alert(error.message || 'Failed to create room type');
    }
  };

  // Update room type
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch(`http://localhost:3000/admin/room-types/${editingRoom.id_room_type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room type');
      }
      
      alert('Room type updated successfully!');
      setShowModal(false);
      resetForm();
      fetchRooms(); // Refresh the list
    } catch (error) {
      console.error('Error updating room type:', error);
      alert(error.message || 'Failed to update room type');
    }
  };

  // Delete room type with confirmation
  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room type? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/admin/room-types/${roomId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete room type');
      }
      
      alert('Room type deleted successfully!');
      fetchRooms(); // Refresh the list
    } catch (error) {
      console.error('Error deleting room type:', error);
      alert(error.message || 'Failed to delete room type');
    }
  };

  // Edit room type - populate form with existing data
  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      capacity: room.capacity || '',
      price_per_night: room.price_per_night || '',
      description: room.description || '',
      room_bed: room.room_bed || '',
      max_stay_duration: room.max_stay_duration || 30,
      image_url: room.image_url || ''
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      price_per_night: '',
      description: '',
      room_bed: '',
      max_stay_duration: 30,
      image_url: ''
    });
    setEditingRoom(null);
    setErrors({});
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_bed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    className="flex-1 bg-red-700 text-white py-2 px-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-1 text-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingRoom ? `Edit Room — ID: ${editingRoom.roomId}` : "Add New Room"}
              </h3>
              <button
                onClick={() => { 
                  setShowModal(false); 
                  setEditingRoom(null); 
                  setErrors({}); 
                  resetForm();
                }}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={editingRoom ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Name *</label>
                <input
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.roomName ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g., Stellar Suite"
                />
                {errors.roomName && <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>}
              </div>

              {/* Bed Info and Price (side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bed Info *</label>
                  <input
                    name="roomBed"
                    value={formData.roomBed}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.roomBed ? "border-red-500" : "border-gray-300"}`}
                    placeholder="King Bed • 40m²"
                  />
                  {errors.roomBed && <p className="text-red-500 text-sm mt-1">{errors.roomBed}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Night ($) *</label>
                  <input
                    name="roomPrice"
                    type="number"
                    min="0"
                    value={formData.roomPrice}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.roomPrice ? "border-red-500" : "border-gray-300"}`}
                    placeholder="200"
                  />
                  {errors.roomPrice && <p className="text-red-500 text-sm mt-1">{errors.roomPrice}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="roomDesc"
                  value={formData.roomDesc}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.roomDesc ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Describe the room features..."
                />
                {errors.roomDesc && <p className="text-red-500 text-sm mt-1">{errors.roomDesc}</p>}
              </div>

              {/* Image URL + preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Image URL *</label>
                  <input
                    name="roomImage"
                    value={formData.roomImage}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.roomImage ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g., https://example.com/room1.jpg"
                  />
                  {errors.roomImage && <p className="text-red-500 text-sm mt-1">{errors.roomImage}</p>}
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden">
                    {formData.roomImage ? (
                      <img 
                        src={formData.roomImage} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmFpbGVkIHRvIGxvYWQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        Preview
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b]"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingRoom(null); 
                    setErrors({}); 
                    resetForm();
                  }}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-[#102E50] text-white py-2 px-4 rounded-lg hover:bg-[#0e2944]"
                >
                  {editingRoom ? "Update Room" : "Create Room"}
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
