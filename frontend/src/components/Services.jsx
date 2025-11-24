import React, { useEffect, useState } from 'react';

export default function Services() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showService, setShowService] = useState(false);
	const [editingService, setEditingService] = useState(null);
	const [error, setError] = useState({});
	const [searchTerm, setSearchTerm] = useState('');

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
			const response = await fetch('http://localhost:3000/admin/services');
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
		if (!serviceForm.name) newErrors.name = 'Name is required';
		if (!serviceForm.desc) newErrors.desc = 'Description is required';
		if (serviceForm.service_price === '' || isNaN(serviceForm.service_price))
			newErrors.service_price = 'Valid price is required';
		if (!serviceForm.unit) newErrors.unit = 'Unit is required';
		setError(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreateService = async (e) => {
		e.preventDefault();
		if (!validateServiceForm()) return;

		const confirmed = window.confirm(
			`Are you sure you want to create this service "${serviceForm.name}"?\n\n` +
				`• Name: ${serviceForm.name}\n` +
				`• Description: ${serviceForm.desc}\n` +
				`• Price: ${serviceForm.service_price}\n` +
				`• Unit: ${serviceForm.unit}`
		);
		if (!confirmed) return;

		setLoading(true);

		try {
			const response = await fetch('http://localhost:3000/admin/services', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(serviceForm),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to create service');
			}

			alert('✅ Service created successfully');
			setServiceForm({ name: '', desc: '', service_price: '', unit: '' });
			fetchServices();
		} catch (error) {
			console.error('Error creating service:', error);
			alert('❌ Failed to create service');
		} finally {
			setLoading(false);
		}
	};

	const startEditService = (service) => {
		setEditingService(service);
		setServiceForm({
			name: service.name ?? '',
			desc: service.desc ?? '',
			service_price: service.service_price ?? '',
			unit: service.unit ?? '',
		});
		setShowService(true);
	};

	const handleEditService = async (e) => {
		e.preventDefault();
		if (!validateServiceForm()) return;
		const confirmed = window.confirm(
			`Are you sure you want to update this service "${serviceForm.name}"?\n\n` +
				`• Name: ${serviceForm.name}\n` +
				`• Description: ${serviceForm.desc}\n` +
				`• Price: ${serviceForm.service_price}\n` +
				`• Unit: ${serviceForm.unit}`
		);
		if (!confirmed) return;
		setLoading(true);

		try {
			const response = await fetch(`http://localhost:3000/admin/services/${editingService.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(serviceForm),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || 'Failed to update service');
			}
			alert('✅ Service updated successfully');
			setServiceForm({ name: '', desc: '', service_price: '', unit: '' });
			setEditingService(null);
			fetchServices();
		} catch (error) {
			console.error('Error updating service:', error);
			alert('❌ Failed to update service');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteService = async (servicesId) => {
		const confirmed = window.confirm('Are you sure you want to delete this service?');
		if (!confirmed) return;

		setLoading(true);

		try {
			const response = await fetch(`http://localhost:3000/admin/services/${servicesId}`, {
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
			alert('❌ Failed to delete service');
		} finally {
			setLoading(false);
		}
	};

	const resetServiceForm = () => {
		setServiceForm({ name: '', desc: '', service_price: '', unit: '' });
		setEditingService(null);
		setError({});
	};

	const handleServiceInputChange = (e) => {
		const { name, value } = e.target;
		setServiceForm((prevForm) => ({
			...prevForm,
			[name]: name === 'service_price' ? parseFloat(value) : value,
		}));

		if (error[name]) {
			setError((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	const filteredService = services.filter(
		(service) =>
			service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.desc?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div>
			{services.map((service) => (
				<div key={service.id}>
					{service.name}, {service.desc}, {service.service_price}, {service.unit}
					<div>
						<button onClick={() => startEditService(service)}>
							<p className='text-black'>Edit</p>
						</button>
					</div>
					<div>
						<button onClick={() => handleDeleteService(service.id)}>
							<p className='text-black'>Delete</p>
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
