import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, DollarSign, Package } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  const [serviceForm, setServiceForm] = useState({
    name: '',
    desc: '',
    service_price: '',
    unit: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // const response = await fetch('http://localhost:3000/admin/services');
      const response = await fetch('http://148.230.99.149/admin/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('❌ Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const validateServiceForm = () => {
    const newErrors = {};
    if (!serviceForm.name.trim()) newErrors.name = 'Service name is required';
    if (!serviceForm.desc.trim()) newErrors.desc = 'Description is required';
    if (serviceForm.service_price === '' || isNaN(serviceForm.service_price) || serviceForm.service_price < 0)
      newErrors.service_price = 'Valid price is required';
    if (!serviceForm.unit) newErrors.unit = 'Unit is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!validateServiceForm()) return;

    const confirmed = window.confirm(
      `Are you sure you want to create new service "${serviceForm.name}"?\n\n` +
      `• Name: ${serviceForm.name}\n` +
      `• Description: ${serviceForm.desc}\n` +
      `• Price: $${serviceForm.service_price}\n` +
      `• Unit: ${serviceForm.unit === 'per_person' ? 'Per Person' : 'Per Booking'}\n\n` +
      `This will add a new service to the system.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // const response = await fetch('http://localhost:3000/admin/services', {
      const response = await fetch('http://148.230.99.149/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create service');
      }

      alert('✅ Service created successfully');
      setShowServiceModal(false);
      resetServiceForm();
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      alert(`❌ Failed to create service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!validateServiceForm()) return;

    const confirmed = window.confirm(
      `Are you sure you want to update service "${editingService.name}"?\n\n` +
      `Changes:\n` +
      `• Name: ${editingService.name} → ${serviceForm.name}\n` +
      `• Description: ${editingService.desc} → ${serviceForm.desc}\n` +
      `• Price: $${editingService.service_price} → $${serviceForm.service_price}\n` +
      `• Unit: ${editingService.unit === 'per_person' ? 'Per Person' : 'Per Booking'} → ${serviceForm.unit === 'per_person' ? 'Per Person' : 'Per Booking'}\n\n` +
      `This will update the service information.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`http://148.230.99.149/admin/services/${editingService.id_service}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update service');
      }

      alert('✅ Service updated successfully');
      setShowServiceModal(false);
      resetServiceForm();
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      alert(`❌ Failed to update service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete service "${serviceName}"?\n\n` +
      `This will permanently remove the service from the system.\n\n` +
      `🚨 This action cannot be undone!`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`http://148.230.99.149/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete service');
      }

      alert('✅ Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(`❌ Failed to delete service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name || '',
      desc: service.desc || '',
      service_price: service.service_price || '',
      unit: service.unit || '',
    });
    setShowServiceModal(true);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      desc: '',
      service_price: '',
      unit: '',
    });
    setEditingService(null);
    setErrors({});
  };

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: name === 'service_price' ? (value === '' ? '' : parseFloat(value)) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.desc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnitDisplay = (unit) => {
    return unit === 'per_person' ? 'Per Person' : 'Per Booking';
  };

  return (
    <div className="services-management">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Services Management</h2>
          <button
            onClick={() => setShowServiceModal(true)}
            className="bg-[#102E50] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a5f] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search services..."
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
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Services Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div key={service.id_service} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
              {/* Service Header */}
              <div className="bg-gradient-to-br from-[#102E50] to-[#1a3a5f] p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{service.name}</h3>
                    <p className="text-sm opacity-90 mt-1">{getUnitDisplay(service.unit)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${service.service_price}</div>
                    <div className="text-xs opacity-90">
                      {service.unit === 'per_person' ? '/person' : '/booking'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.desc}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${service.service_price}</span>
                      <span className="text-xs text-gray-500">
                        {service.unit === 'per_person' ? 'per person' : 'per booking'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="capitalize">{service.unit.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Selalu di bagian bawah */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 bg-[#c19a6b] text-white py-2 px-3 rounded-lg hover:bg-[#a67c52] transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id_service, service.name)}
                      className="flex-1 bg-red-700 text-white py-2 px-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No services found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first service'}
          </p>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingService ? `Edit Service — ${editingService.name}` : "Add New Service"}
              </h3>
              <button
                onClick={() => { 
                  setShowServiceModal(false); 
                  resetServiceForm();
                }}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={editingService ? handleUpdateService : handleCreateService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name *</label>
                <input
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g., Spa Treatment"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="desc"
                  value={serviceForm.desc}
                  onChange={handleServiceInputChange}
                  rows="3"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.desc ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Describe the service features and benefits..."
                />
                {errors.desc && <p className="text-red-500 text-sm mt-1">{errors.desc}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
                  <input
                    name="service_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.service_price}
                    onChange={handleServiceInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.service_price ? "border-red-500" : "border-gray-300"}`}
                    placeholder="0.00"
                  />
                  {errors.service_price && <p className="text-red-500 text-sm mt-1">{errors.service_price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit *</label>
                  <select
                    name="unit"
                    value={serviceForm.unit}
                    onChange={handleServiceInputChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${errors.unit ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select Unit</option>
                    <option value="per_person">Per Person</option>
                    <option value="per_booking">Per Booking</option>
                  </select>
                  {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { 
                    setShowServiceModal(false); 
                    resetServiceForm();
                  }}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#102E50] text-white py-2 px-4 rounded-lg hover:bg-[#0e2944] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (editingService ? "Update Service" : "Create Service")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;