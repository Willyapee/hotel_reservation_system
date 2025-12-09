import React, { useState, useEffect } from 'react';
import {
	Upload,
	Plus,
	Edit,
	Trash2,
	Search,
	X,
	Eye,
	Bed,
	Users,
	DollarSign,
	Key,
} from 'lucide-react';

const RoomManagement = () => {
	const [roomTypes, setRoomTypes] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
	const [showRoomModal, setShowRoomModal] = useState(false);
	const [editingRoomType, setEditingRoomType] = useState(null);
	const [editingRoom, setEditingRoom] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [errors, setErrors] = useState({});
	const [activeTab, setActiveTab] = useState('roomTypes');

	const [roomTypeForm, setRoomTypeForm] = useState({
		name: '',
		capacity: '',
		price_per_night: '',
		description: '',
		room_bed: '',
		max_stay_duration: 30,
		image_url: '',
		image_file: '',
	});

	const [roomForm, setRoomForm] = useState({
		id_room_type: '',
		room_number: '',
	});

	useEffect(() => {
		fetchRoomTypes();
		fetchRooms();
	}, []);

	const fetchRoomTypes = async () => {
		setLoading(true);
		try {
			const response = await fetch('http://localhost:3000/admin/room-types');
			if (!response.ok) throw new Error('Failed to fetch room types');
			const data = await response.json();
			setRoomTypes(data);
		} catch (error) {
			console.error('Error loading room types:', error);
			alert('❌ Failed to load room types');
		} finally {
			setLoading(false);
		}
	};

	const fetchRooms = async () => {
		try {
			const response = await fetch('http://localhost:3000/admin/rooms');
			if (!response.ok) throw new Error('Failed to fetch rooms');
			const data = await response.json();
			setRooms(data);
		} catch (error) {
			console.error('Error loading rooms:', error);
			alert('❌ Failed to load rooms');
		}
	};

	const validateRoomTypeForm = () => {
		const newErrors = {};
		if (!roomTypeForm.name.trim()) newErrors.name = 'Room name is required';
		if (!roomTypeForm.capacity || roomTypeForm.capacity <= 0)
			newErrors.capacity = 'Valid capacity is required';
		if (!roomTypeForm.room_bed.trim()) newErrors.room_bed = 'Room bed info is required';
		if (!roomTypeForm.price_per_night || roomTypeForm.price_per_night <= 0)
			newErrors.price_per_night = 'Valid price is required';
		if (!roomTypeForm.description.trim()) newErrors.description = 'Description is required';
		if (!roomTypeForm.max_stay_duration || roomTypeForm.max_stay_duration <= 0)
			newErrors.max_stay_duration = 'Valid max stay duration is required';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateRoomForm = () => {
		const newErrors = {};
		if (!roomForm.id_room_type) newErrors.id_room_type = 'Room type is required';
		if (!roomForm.room_number.trim()) newErrors.room_number = 'Room number is required';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreateRoomType = async (e) => {
		e.preventDefault();
		if (!validateRoomTypeForm()) return;

		const confirmed = window.confirm(
			`Are you sure you want to create new room type "${roomTypeForm.name}"?\n\n` +
				`• Name: ${roomTypeForm.name}\n` +
				`• Capacity: ${roomTypeForm.capacity} people\n` +
				`• Price: $${roomTypeForm.price_per_night}/night\n` +
				`• Bed: ${roomTypeForm.room_bed}\n\n` +
				`This will create a new room type that can be used for creating rooms.`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('name', roomTypeForm.name);
			formData.append('capacity', roomTypeForm.capacity);
			formData.append('price_per_night', roomTypeForm.price_per_night);
			formData.append('description', roomTypeForm.description);
			formData.append('room_bed', roomTypeForm.room_bed);
			formData.append('max_stay_duration', roomTypeForm.max_stay_duration);

			if (roomTypeForm.image_file) {
				formData.append('image', roomTypeForm.image_file);
			}

			const response = await fetch('http://localhost:3000/admin/room-types', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to create room type');
			}

			alert('✅ ' + (data.message || 'Room type created successfully!'));
			setShowRoomTypeModal(false);
			resetRoomTypeForm();
			fetchRoomTypes();
		} catch (error) {
			console.error('Error creating room type:', error);
			alert('❌ ' + (error.message || 'Failed to create room type'));
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateRoomType = async (e) => {
		e.preventDefault();
		if (!validateRoomTypeForm()) return;

		const confirmed = window.confirm(
			`Are you sure you want to update room type "${editingRoomType.name}"?\n\n` +
				`Changes:\n` +
				`• Name: ${editingRoomType.name} → ${roomTypeForm.name}\n` +
				`• Capacity: ${editingRoomType.capacity} → ${roomTypeForm.capacity} people\n` +
				`• Price: $${editingRoomType.price_per_night} → $${roomTypeForm.price_per_night}/night\n` +
				`• Bed: ${editingRoomType.room_bed} → ${roomTypeForm.room_bed}\n\n` +
				`This will affect all rooms of this type.`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('name', roomTypeForm.name);
			formData.append('capacity', roomTypeForm.capacity);
			formData.append('price_per_night', roomTypeForm.price_per_night);
			formData.append('description', roomTypeForm.description);
			formData.append('room_bed', roomTypeForm.room_bed);
			formData.append('max_stay_duration', roomTypeForm.max_stay_duration);

			if (roomTypeForm.image_file) {
				formData.append('image', roomTypeForm.image_file);
			} else {
				formData.append('image_url', roomTypeForm.image_url || '');
			}

			const response = await fetch(
				`http://localhost:3000/admin/room-types/${editingRoomType.id_room_type}`,
				{
					method: 'PUT',
					body: formData,
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to update room type');
			}

			alert('✅ ' + (data.message || 'Room type updated successfully!'));
			setShowRoomTypeModal(false);
			resetRoomTypeForm();
			fetchRoomTypes();
		} catch (error) {
			console.error('Error updating room type:', error);
			alert('❌ ' + (error.message || 'Failed to update room type'));
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteRoomType = async (roomTypeId, roomTypeName) => {
		const roomCount = rooms.filter((room) => room.id_room_type === roomTypeId).length;

		if (roomCount > 0) {
			const confirmed = window.confirm(
				`🚨 WARNING: This room type has ${roomCount} room(s) associated with it!\n\n` +
					`You cannot delete "${roomTypeName}" because there are ${roomCount} rooms using this type.\n\n` +
					`Please delete all rooms of this type first from the "Rooms" tab, then you can delete the room type.`
			);

			if (confirmed) {
				setActiveTab('rooms');
				setSearchTerm(roomTypeName);
			}
			return;
		}

		const confirmed = window.confirm(
			`Are you sure you want to delete room type "${roomTypeName}"?\n\n` +
				`This action cannot be undone!`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const response = await fetch(`http://localhost:3000/admin/room-types/${roomTypeId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to delete room type');
			}

			alert('✅ ' + (data.message || 'Room type deleted successfully!'));
			fetchRoomTypes();
			fetchRooms();
		} catch (error) {
			console.error('Error deleting room type:', error);
			alert('❌ ' + (error.message || 'Failed to delete room type'));
		} finally {
			setLoading(false);
		}
	};

	const handleEditRoomType = (roomType) => {
		setEditingRoomType(roomType);
		setRoomTypeForm({
			name: roomType.name || '',
			capacity: roomType.capacity || '',
			price_per_night: roomType.price_per_night || '',
			description: roomType.description || '',
			room_bed: roomType.room_bed || '',
			max_stay_duration: roomType.max_stay_duration || 30,
			image_url: roomType.image_url || '',
		});
		setShowRoomTypeModal(true);
	};

	const handleCreateRoom = async (e) => {
		e.preventDefault();
		if (!validateRoomForm()) return;

		const roomType = roomTypes.find((rt) => rt.id_room_type === parseInt(roomForm.id_room_type));
		const roomTypeName = roomType ? roomType.name : 'Unknown';

		const confirmed = window.confirm(
			`Are you sure you want to create new room?\n\n` +
				`• Room Number: ${roomForm.room_number}\n` +
				`• Room Type: ${roomTypeName}\n\n` +
				`This will add a new physical room to the system.`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const response = await fetch('http://localhost:3000/admin/rooms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(roomForm),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to create room');
			}

			alert('✅ ' + (data.message || 'Room created successfully!'));
			setShowRoomModal(false);
			resetRoomForm();
			fetchRooms();
		} catch (error) {
			console.error('Error creating room:', error);
			alert('❌ ' + (error.message || 'Failed to create room'));
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateRoom = async (e) => {
		e.preventDefault();
		if (!validateRoomForm()) return;

		const roomType = roomTypes.find((rt) => rt.id_room_type === parseInt(roomForm.id_room_type));
		const roomTypeName = roomType ? roomType.name : 'Unknown';
		const oldRoomType = roomTypes.find(
			(rt) => rt.id_room_type === parseInt(editingRoom.id_room_type)
		);
		const oldRoomTypeName = oldRoomType ? oldRoomType.name : 'Unknown';

		const changes = [];
		if (editingRoom.room_number !== roomForm.room_number) {
			changes.push(`• Room Number: ${editingRoom.room_number} → ${roomForm.room_number}`);
		}
		if (editingRoom.id_room_type !== parseInt(roomForm.id_room_type)) {
			changes.push(`• Room Type: ${oldRoomTypeName} → ${roomTypeName}`);
		}

		const confirmed = window.confirm(
			`Are you sure you want to update room "${editingRoom.room_number}"?\n\n` +
				`Changes:\n${changes.join('\n')}\n\n` +
				`This will update the room information in the system.`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const response = await fetch(`http://localhost:3000/admin/rooms/${editingRoom.id_room}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(roomForm),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to update room');
			}

			alert('✅ ' + (data.message || 'Room updated successfully!'));
			setShowRoomModal(false);
			resetRoomForm();
			fetchRooms();
		} catch (error) {
			console.error('Error updating room:', error);
			alert('❌ ' + (error.message || 'Failed to update room'));
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteRoom = async (roomId, roomNumber, roomTypeName) => {
		const confirmed = window.confirm(
			`Are you sure you want to delete room "${roomNumber}"?\n\n` +
				`• Room: ${roomNumber}\n` +
				`• Type: ${roomTypeName}\n\n` +
				`This will permanently remove the room from the system.\n\n` +
				`🚨 This action cannot be undone!`
		);

		if (!confirmed) return;

		setLoading(true);
		try {
			const response = await fetch(`http://localhost:3000/admin/rooms/${roomId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to delete room');
			}

			alert('✅ ' + (data.message || 'Room deleted successfully!'));
			fetchRooms();
			fetchRoomTypes();
		} catch (error) {
			console.error('Error deleting room:', error);
			alert('❌ ' + (error.message || 'Failed to delete room'));
		} finally {
			setLoading(false);
		}
	};

	const handleEditRoom = (room) => {
		setEditingRoom(room);
		setRoomForm({
			id_room_type: room.id_room_type || '',
			room_number: room.room_number || '',
		});
		setShowRoomModal(true);
	};

	const resetRoomTypeForm = () => {
		setRoomTypeForm({
			name: '',
			capacity: '',
			price_per_night: '',
			description: '',
			room_bed: '',
			max_stay_duration: 30,
			image_url: '',
			image_file: '',
		});
		setEditingRoomType(null);
		setErrors({});
	};

	const resetRoomForm = () => {
		setRoomForm({
			id_room_type: '',
			room_number: '',
		});
		setEditingRoom(null);
		setErrors({});
	};

	const handleRoomTypeInputChange = (e) => {
		const { name, value } = e.target;
		setRoomTypeForm((prev) => ({
			...prev,
			[name]:
				name === 'price_per_night' || name === 'capacity' || name === 'max_stay_duration'
					? Number(value)
					: value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	const handleRoomInputChange = (e) => {
		const { name, value } = e.target;
		setRoomForm((prev) => ({
			...prev,
			[name]: value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	const filteredRoomTypes = roomTypes.filter(
		(roomType) =>
			roomType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			roomType.room_bed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			roomType.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filteredRooms = rooms.filter(
		(room) =>
			room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			room.room_type?.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const imagePreview = roomTypeForm.image_file
		? URL.createObjectURL(roomTypeForm.image_file)
		: roomTypeForm.image_url;

	return (
		<div className='room-management'>
			{/* Header with Tabs */}
			<div className='mb-6'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-2xl font-bold text-gray-800'>Room Management</h2>
					<div className='flex gap-2'>
						<button
							onClick={() => setShowRoomModal(true)}
							className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'>
							<Key className='w-4 h-4' />
							Add Room
						</button>
						<button
							onClick={() => setShowRoomTypeModal(true)}
							className='bg-[#102E50] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a5f] transition-colors flex items-center gap-2'>
							<Plus className='w-4 h-4' />
							Add Room Type
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className='flex border-b border-gray-200 mb-4'>
					<button
						onClick={() => setActiveTab('roomTypes')}
						className={`px-4 py-2 font-medium ${
							activeTab === 'roomTypes'
								? 'border-b-2 border-[#102E50] text-[#102E50]'
								: 'text-gray-500 hover:text-gray-700'
						}`}>
						Room Types ({roomTypes.length})
					</button>
					<button
						onClick={() => setActiveTab('rooms')}
						className={`px-4 py-2 font-medium ${
							activeTab === 'rooms'
								? 'border-b-2 border-[#102E50] text-[#102E50]'
								: 'text-gray-500 hover:text-gray-700'
						}`}>
						Rooms ({rooms.length})
					</button>
				</div>

				{/* Search Bar */}
				<div className='relative max-w-md'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<input
						type='text'
						placeholder={`Search ${activeTab === 'roomTypes' ? 'room types' : 'rooms'}...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent'
					/>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto'></div>
					<p className='mt-2 text-gray-600'>Loading...</p>
				</div>
			)}

			{/* Room Types Tab */}
			{!loading && activeTab === 'roomTypes' && (
				<>
					{/* Room Types Grid */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredRoomTypes.map((roomType) => (
							<div
								key={roomType.id_room_type}
								className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow'>
								{/* Room Image */}
								<div className='h-48 bg-gradient-to-br from-[#102E50] to-[#1a3a5f] relative'>
									<img
										src={roomType.image_url || '/default-room.jpg'}
										alt={roomType.name}
										className='w-full h-full object-cover'
										onError={(e) => {
											e.target.src =
												'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
										}}
									/>
									<div className='absolute inset-0 bg-black/20'></div>
									<div className='absolute bottom-3 left-3 text-white'>
										<h3 className='text-xl font-bold'>{roomType.name}</h3>
										<p className='text-sm opacity-90'>Capacity: {roomType.capacity} people</p>
									</div>
								</div>

								{/* Room Details */}
								<div className='p-4'>
									<p className='text-gray-600 text-sm mb-4 line-clamp-2'>{roomType.description}</p>

									<div className='space-y-2 text-sm text-gray-600 mb-4'>
										<div className='flex items-center gap-1'>
											<Bed className='w-4 h-4' />
											<span>{roomType.room_bed}</span>
										</div>
										<div className='flex items-center gap-1'>
											<Users className='w-4 h-4' />
											<span>Max {roomType.capacity} people</span>
										</div>
										<div className='flex items-center gap-1'>
											<DollarSign className='w-4 h-4' />
											<span className='font-semibold'>${roomType.price_per_night}/night</span>
										</div>
										<div className='text-xs text-gray-500'>
											Max stay: {roomType.max_stay_duration} days
										</div>
									</div>

									{/* Rooms Count */}
									<div
										className={`text-xs mb-4 ${
											rooms.filter((room) => room.id_room_type === roomType.id_room_type).length > 0
												? 'text-orange-600 font-semibold'
												: 'text-gray-500'
										}`}>
										{rooms.filter((room) => room.id_room_type === roomType.id_room_type).length}{' '}
										rooms of this type
										{rooms.filter((room) => room.id_room_type === roomType.id_room_type).length >
											0 && ' - Delete all rooms first to delete this type'}
									</div>

									{/* Action Buttons */}
									<div className='flex gap-2'>
										<button
											onClick={() => handleEditRoomType(roomType)}
											className='flex-1 bg-[#c19a6b] text-white py-2 px-3 rounded-lg hover:bg-[#a67c52] transition-colors flex items-center justify-center gap-1 text-sm'>
											<Edit className='w-3 h-3' />
											Edit
										</button>
										<button
											onClick={() => handleDeleteRoomType(roomType.id_room_type, roomType.name)}
											className='flex-1 bg-red-700 text-white py-2 px-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-1 text-sm'>
											<Trash2 className='w-3 h-3' />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Empty State for Room Types */}
					{filteredRoomTypes.length === 0 && (
						<div className='text-center py-12'>
							<Bed className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-semibold text-gray-600 mb-2'>No room types found</h3>
							<p className='text-gray-500'>
								{searchTerm
									? 'Try adjusting your search terms'
									: 'Get started by adding your first room type'}
							</p>
						</div>
					)}
				</>
			)}

			{/* Rooms Tab */}
			{!loading && activeTab === 'rooms' && (
				<>
					{/* Rooms List */}
					<div className='bg-white rounded-lg shadow border border-gray-200'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Room Number
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Room Type
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Capacity
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Price/Night
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{filteredRooms.map((room) => (
										<tr key={room.id_room} className='hover:bg-gray-50'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm font-medium text-gray-900'>{room.room_number}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>{room.room_type?.name}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>
													{room.room_type?.capacity} people
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>
													${room.room_type?.price_per_night}
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
												<div className='flex gap-2'>
													<button
														onClick={() => handleEditRoom(room)}
														className='text-[#c19a6b] hover:text-[#a67c52] px-3 py-1 border border-[#c19a6b] rounded hover:bg-[#c19a6b] hover:text-white transition-colors'>
														Edit
													</button>
													<button
														onClick={() =>
															handleDeleteRoom(room.id_room, room.room_number, room.room_type?.name)
														}
														className='text-red-600 hover:text-white px-3 py-1 border border-red-600 rounded hover:bg-red-600 transition-colors'>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Empty State for Rooms */}
					{filteredRooms.length === 0 && (
						<div className='text-center py-12'>
							<Key className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-semibold text-gray-600 mb-2'>No rooms found</h3>
							<p className='text-gray-500'>
								{searchTerm
									? 'Try adjusting your search terms'
									: 'Create room types first, then add rooms'}
							</p>
						</div>
					)}
				</>
			)}

			{/* Room Type Modal */}
			{showRoomTypeModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<div className='bg-white rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]'>
						<div className='flex items-center justify-between p-6 border-b border-gray-200'>
							<h3 className='text-xl font-semibold text-gray-800'>
								{editingRoomType
									? `Edit Room Type — ID: ${editingRoomType.id_room_type}`
									: 'Add New Room Type'}
							</h3>
							<button
								onClick={() => {
									setShowRoomTypeModal(false);
									resetRoomTypeForm();
								}}
								className='p-2 rounded hover:bg-gray-100'>
								<X className='w-5 h-5 text-gray-600' />
							</button>
						</div>

						<form
							onSubmit={editingRoomType ? handleUpdateRoomType : handleCreateRoomType}
							className='p-6 space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700'>Room Name *</label>
								<input
									name='name'
									value={roomTypeForm.name}
									onChange={handleRoomTypeInputChange}
									className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
										errors.name ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder='e.g., Stellar Suite'
								/>
								{errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700'>Capacity *</label>
									<input
										name='capacity'
										type='number'
										min='1'
										value={roomTypeForm.capacity}
										onChange={handleRoomTypeInputChange}
										className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
											errors.capacity ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder='2'
									/>
									{errors.capacity && (
										<p className='text-red-500 text-sm mt-1'>{errors.capacity}</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700'>Bed Info *</label>
									<input
										name='room_bed'
										value={roomTypeForm.room_bed}
										onChange={handleRoomTypeInputChange}
										className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
											errors.room_bed ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder='King Bed • 40m²'
									/>
									{errors.room_bed && (
										<p className='text-red-500 text-sm mt-1'>{errors.room_bed}</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700'>
										Price per Night ($) *
									</label>
									<input
										name='price_per_night'
										type='number'
										min='0'
										step='0.01'
										value={roomTypeForm.price_per_night}
										onChange={handleRoomTypeInputChange}
										className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
											errors.price_per_night ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder='200'
									/>
									{errors.price_per_night && (
										<p className='text-red-500 text-sm mt-1'>{errors.price_per_night}</p>
									)}
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700'>
									Max Stay Duration (days) *
								</label>
								<input
									name='max_stay_duration'
									type='number'
									min='1'
									value={roomTypeForm.max_stay_duration}
									onChange={handleRoomTypeInputChange}
									className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
										errors.max_stay_duration ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder='30'
								/>
								{errors.max_stay_duration && (
									<p className='text-red-500 text-sm mt-1'>{errors.max_stay_duration}</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700'>Description *</label>
								<textarea
									name='description'
									value={roomTypeForm.description}
									onChange={handleRoomTypeInputChange}
									rows='3'
									className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
										errors.description ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder='Describe the room features...'
								/>
								{errors.description && (
									<p className='text-red-500 text-sm mt-1'>{errors.description}</p>
								)}
							</div>

							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Room Image</label>

								<div className='flex items-center justify-center w-full'>
									<label
										htmlFor='dropzone-file'
										className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group'>
										{imagePreview ? (
											<>
												<img
													src={imagePreview}
													alt='Room Preview'
													className='w-full h-full object-cover'
												/>
												<div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
													<Upload className='w-10 h-10 text-white mb-2' />
													<p className='text-sm text-white font-semibold'>Click to Change Image</p>
												</div>
											</>
										) : (
											<div className='flex flex-col items-center justify-center pt-5 pb-6'>
												<Upload className='w-10 h-10 text-gray-400 mb-3' />
												<p className='mb-2 text-sm text-gray-500'>
													<span className='font-semibold'>Click to upload</span> or drag and drop
												</p>
												<p className='text-xs text-gray-500'>SVG, PNG, JPG or GIF</p>
											</div>
										)}

										<input
											id='dropzone-file'
											type='file'
											className='hidden'
											accept='image/*'
											onChange={(e) => {
												if (e.target.files && e.target.files[0]) {
													setRoomTypeForm({
														...roomTypeForm,
														image_file: e.target.files[0], 
													});
												}
											}}
										/>
									</label>
								</div>

								{imagePreview && (
									<button
										type='button'
										onClick={() =>
											setRoomTypeForm({ ...roomTypeForm, image_file: null, image_url: '' })
										}
										className='mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1'>
										<X className='w-4 h-4' /> Remove Image
									</button>
								)}
							</div>

							<div className='flex gap-3 justify-end'>
								<button
									type='button'
									onClick={() => {
										setShowRoomTypeModal(false);
										resetRoomTypeForm();
									}}
									className='bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300'>
									Cancel
								</button>
								<button
									type='submit'
									disabled={loading}
									className='bg-[#102E50] text-white py-2 px-4 rounded-lg hover:bg-[#0e2944] disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading
										? 'Processing...'
										: editingRoomType
										? 'Update Room Type'
										: 'Create Room Type'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Room Modal */}
			{showRoomModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<div className='bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]'>
						<div className='flex items-center justify-between p-6 border-b border-gray-200'>
							<h3 className='text-xl font-semibold text-gray-800'>
								{editingRoom ? `Edit Room — ${editingRoom.room_number}` : 'Add New Room'}
							</h3>
							<button
								onClick={() => {
									setShowRoomModal(false);
									resetRoomForm();
								}}
								className='p-2 rounded hover:bg-gray-100'>
								<X className='w-5 h-5 text-gray-600' />
							</button>
						</div>

						<form
							onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
							className='p-6 space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700'>Room Type *</label>
								<select
									name='id_room_type'
									value={roomForm.id_room_type}
									onChange={handleRoomInputChange}
									className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
										errors.id_room_type ? 'border-red-500' : 'border-gray-300'
									}`}>
									<option value=''>Select Room Type</option>
									{roomTypes.map((roomType) => (
										<option key={roomType.id_room_type} value={roomType.id_room_type}>
											{roomType.name}
										</option>
									))}
								</select>
								{errors.id_room_type && (
									<p className='text-red-500 text-sm mt-1'>{errors.id_room_type}</p>
								)}
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700'>Room Number *</label>
								<input
									name='room_number'
									value={roomForm.room_number}
									onChange={handleRoomInputChange}
									className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c19a6b] ${
										errors.room_number ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder='e.g., 101, 201A'
								/>
								{errors.room_number && (
									<p className='text-red-500 text-sm mt-1'>{errors.room_number}</p>
								)}
							</div>

							<div className='flex gap-3 justify-end'>
								<button
									type='button'
									onClick={() => {
										setShowRoomModal(false);
										resetRoomForm();
									}}
									className='bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300'>
									Cancel
								</button>
								<button
									type='submit'
									disabled={loading}
									className='bg-[#102E50] text-white py-2 px-4 rounded-lg hover:bg-[#0e2944] disabled:opacity-50 disabled:cursor-not-allowed'>
									{loading ? 'Processing...' : editingRoom ? 'Update Room' : 'Create Room'}
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
