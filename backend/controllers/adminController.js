import MsRoomType from '../models/msRoomTypes.js';
import MsServices from '../models/msServices.js';
import Rooms from '../models/Rooms.js';
import { Op } from 'sequelize';

//ROOM TYPE CONTROLLERS
export const createRoomType = async (req, res) => {
	try {
		const { name, capacity, price_per_night, description, room_bed, max_stay_duration, image_url } =
			req.body;

		if (!name || !name.trim()) {
			return res.status(400).json({ message: 'Room type name is required' });
		}
		if (!capacity || capacity <= 0) {
			return res.status(400).json({ message: 'Valid capacity is required' });
		}
		if (!price_per_night || price_per_night <= 0) {
			return res.status(400).json({ message: 'Valid price per night is required' });
		}
		if (!description || !description.trim()) {
			return res.status(400).json({ message: 'Description is required' });
		}
		if (!room_bed || !room_bed.trim()) {
			return res.status(400).json({ message: 'Room bed information is required' });
		}
		if (!max_stay_duration || max_stay_duration <= 0) {
			return res.status(400).json({ message: 'Valid max stay duration is required' });
		}

		const existingRoomType = await MsRoomType.findOne({
			where: { name: name.trim() },
		});
		if (existingRoomType) {
			return res.status(400).json({ message: 'Room type name already exists' });
		}

		const newRoomType = await MsRoomType.create({
			name: name.trim(),
			capacity,
			price_per_night,
			description: description.trim(),
			room_bed: room_bed.trim(),
			max_stay_duration,
			image_url: image_url || null,
		});

		res.status(201).json({
			message: 'Room type created successfully',
			roomType: newRoomType,
		});
	} catch (error) {
		console.error('Error creating room type:', error);
		res.status(500).json({
			message: 'Error creating room type',
			error: error.message,
		});
	}
};

export const readRoomTypes = async (req, res) => {
	try {
		const roomTypes = await MsRoomType.findAll({
			order: [['name', 'ASC']],
		});
		res.status(200).json(roomTypes);
	} catch (error) {
		console.error('Error reading room types:', error);
		res.status(500).json({
			message: 'Error reading room types',
			error: error.message,
		});
	}
};

export const updateRoomType = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, capacity, price_per_night, description, room_bed, max_stay_duration, image_url } =
			req.body;

		// Check if room type exists
		const existingRoomType = await MsRoomType.findByPk(id);
		if (!existingRoomType) {
			return res.status(404).json({ message: 'Room type not found' });
		}

		if (!name || !name.trim()) {
			return res.status(400).json({ message: 'Room type name is required' });
		}
		if (!capacity || capacity <= 0) {
			return res.status(400).json({ message: 'Valid capacity is required' });
		}
		if (!price_per_night || price_per_night <= 0) {
			return res.status(400).json({ message: 'Valid price per night is required' });
		}
		if (!description || !description.trim()) {
			return res.status(400).json({ message: 'Description is required' });
		}
		if (!room_bed || !room_bed.trim()) {
			return res.status(400).json({ message: 'Room bed information is required' });
		}
		if (!max_stay_duration || max_stay_duration <= 0) {
			return res.status(400).json({ message: 'Valid max stay duration is required' });
		}

		const duplicateRoomType = await MsRoomType.findOne({
			where: {
				name: name.trim(),
				id_room_type: { [Op.ne]: id },
			},
		});
		if (duplicateRoomType) {
			return res.status(400).json({ message: 'Room type name already exists' });
		}

		const [updated] = await MsRoomType.update(
			{
				name: name.trim(),
				capacity,
				price_per_night,
				description: description.trim(),
				room_bed: room_bed.trim(),
				max_stay_duration,
				image_url: image_url || null,
			},
			{
				where: { id_room_type: id },
			}
		);

		if (updated) {
			const updatedRoomType = await MsRoomType.findByPk(id);
			res.status(200).json({
				message: 'Room type updated successfully',
				roomType: updatedRoomType,
			});
		} else {
			res.status(404).json({ message: 'Room type not found' });
		}
	} catch (error) {
		console.error('Error updating room type:', error);
		res.status(500).json({
			message: 'Error updating room type',
			error: error.message,
		});
	}
};

export const deleteRoomType = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if room type exists
		const roomType = await MsRoomType.findByPk(id);
		if (!roomType) {
			return res.status(404).json({ message: 'Room type not found' });
		}

		// Check if there are rooms associated with this room type
		const associatedRooms = await Rooms.count({
			where: { id_room_type: id },
		});

		if (associatedRooms > 0) {
			return res.status(400).json({
				message: `Cannot delete room type. There are ${associatedRooms} room(s) associated with this room type. Please delete or reassign the rooms first.`,
			});
		}

		const deleted = await MsRoomType.destroy({
			where: { id_room_type: id },
		});

		if (deleted) {
			res.status(200).json({ message: 'Room type deleted successfully' });
		} else {
			res.status(404).json({ message: 'Room type not found' });
		}
	} catch (error) {
		console.error('Error deleting room type:', error);
		res.status(500).json({
			message: 'Error deleting room type',
			error: error.message,
		});
	}
};

//ROOM CONTROLLERS
export const createRoom = async (req, res) => {
	try {
		const { id_room_type, room_number } = req.body;

		if (!id_room_type) {
			return res.status(400).json({ message: 'Room type is required' });
		}
		if (!room_number || !room_number.trim()) {
			return res.status(400).json({ message: 'Room number is required' });
		}

		const roomType = await MsRoomType.findByPk(id_room_type);
		if (!roomType) {
			return res.status(400).json({ message: 'Selected room type does not exist' });
		}

		const existingRoom = await Rooms.findOne({
			where: { room_number: room_number.trim() },
		});
		if (existingRoom) {
			return res.status(400).json({ message: 'Room number already exists' });
		}

		const newRoom = await Rooms.create({
			id_room_type,
			room_number: room_number.trim(),
		});

		const roomWithType = await Rooms.findByPk(newRoom.id_room, {
			include: [{ model: MsRoomType, as: 'room_type' }],
		});

		res.status(201).json({
			message: 'Room created successfully',
			room: roomWithType,
		});
	} catch (error) {
		console.error('Error creating room:', error);
		res.status(500).json({
			message: 'Error creating room',
			error: error.message,
		});
	}
};

export const readRooms = async (req, res) => {
	try {
		const rooms = await Rooms.findAll({
			include: [{ model: MsRoomType, as: 'room_type' }],
			order: [['room_number', 'ASC']],
		});
		res.status(200).json(rooms);
	} catch (error) {
		console.error('Error reading rooms:', error);
		res.status(500).json({
			message: 'Error reading rooms',
			error: error.message,
		});
	}
};

export const updateRoom = async (req, res) => {
	try {
		const { id } = req.params;
		const { id_room_type, room_number } = req.body;

		// Check if room exists
		const existingRoom = await Rooms.findByPk(id);
		if (!existingRoom) {
			return res.status(404).json({ message: 'Room not found' });
		}

		if (!id_room_type) {
			return res.status(400).json({ message: 'Room type is required' });
		}
		if (!room_number || !room_number.trim()) {
			return res.status(400).json({ message: 'Room number is required' });
		}

		const roomType = await MsRoomType.findByPk(id_room_type);
		if (!roomType) {
			return res.status(400).json({ message: 'Selected room type does not exist' });
		}

		const duplicateRoom = await Rooms.findOne({
			where: {
				room_number: room_number.trim(),
				id_room: { [Op.ne]: id },
			},
		});
		if (duplicateRoom) {
			return res.status(400).json({ message: 'Room number already exists' });
		}

		const [updated] = await Rooms.update(
			{
				id_room_type,
				room_number: room_number.trim(),
			},
			{
				where: { id_room: id },
			}
		);

		if (updated) {
			const updatedRoom = await Rooms.findByPk(id, {
				include: [{ model: MsRoomType, as: 'room_type' }],
			});
			res.status(200).json({
				message: 'Room updated successfully',
				room: updatedRoom,
			});
		} else {
			res.status(404).json({ message: 'Room not found' });
		}
	} catch (error) {
		console.error('Error updating room:', error);
		res.status(500).json({
			message: 'Error updating room',
			error: error.message,
		});
	}
};

export const deleteRoom = async (req, res) => {
	try {
		const { id } = req.params;

		const room = await Rooms.findByPk(id);
		if (!room) {
			return res.status(404).json({ message: 'Room not found' });
		}

		const deleted = await Rooms.destroy({
			where: { id_room: id },
		});

		if (deleted) {
			res.status(200).json({ message: 'Room deleted successfully' });
		} else {
			res.status(404).json({ message: 'Room not found' });
		}
	} catch (error) {
		console.error('Error deleting room:', error);
		res.status(500).json({
			message: 'Error deleting room',
			error: error.message,
		});
	}
};

//SERVICES CONTROLLERS
export const createService = async (req, res) => {
	try {
		const { name, desc, service_price, unit } = req.body;

		if (!name || !name.trim()) {
			return res.status(400).json({ message: 'Service name is required' });
		}
		if (!service_price || service_price <= 0) {
			return res.status(400).json({ message: 'Valid service price is required' });
		}
		const existingService = await MsServices.findOne({
			where: { name: name.trim() },
		});

		if (existingService) {
			return res.status(400).json({ message: 'Service name already exists' });
		}

		const service = await MsServices.create({
			name: name.trim(),
			desc: desc.trim(),
			service_price,
			unit: unit.trim(),
		});

		res.status(201).json({ message: 'Service created successfully', service });
	} catch (error) {
		console.error('Error creating service:', error);
		res.status(500).json({ message: 'Error creating service:', error: error.message });
	}
};

export const readServices = async (req, res) => {
	try {
		const services = await MsServices.findAll({
			order: [['name', 'ASC']],
		});
		res.status(200).json(services);
	} catch (error) {
		console.error('Error reading services:', error);
		res.status(500).json({ message: 'Error reading services:', error: error.message });
	}
};

export const updateService = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, desc, service_price, unit } = req.body;

		const existingService = await MsServices.findByPk(id);
		if (!existingService) {
			return res.status(404).json({ message: 'Service not found' });
		}

		if (!name || !name.trim()) {
			return res.status(400).json({ message: 'Service name is required' });
		}
		if (!service_price || service_price <= 0) {
			return res.status(400).json({ message: 'Valid service price is required' });
		}
		const duplicateService = await MsServices.findOne({
			where: {
				name: name.trim(),
				id_service: { [Op.ne]: id },
			},
		});
		if (duplicateService) {
			return res.status(400).json({ message: 'Service name already exists' });
		}

		const [updated] = await MsServices.update(
			{
				name: name.trim(),
				desc: desc.trim(),
				service_price,
				unit: unit.trim(),
			},
			{ where: { id_service: id } }
		);

		if (updated) {
			const updatedService = await MsServices.findByPk(id);
			res.status(200).json({
				message: 'Service updated successfully',
				service: updatedService,
			});
		} else {
			res.status(404).json({ message: 'Service not found' });
		}
	} catch (error) {
		console.error('Error updating service:', error);
		res.status(500).json({ message: 'Error updating service:', error: error.message });
	}
};

export const deleteServices = async (req, res) => {
	try {
		const { id } = req.params;

		const service = await MsServices.findByPk(id);
		if (!service) {
			return res.status(404).json({ message: 'Service not found' });
		}

		const deleted = await MsServices.destroy({
			where: { id_service: id },
		});

		if (deleted) {
			res.status(200).json({ message: 'Service deleted successfully' });
		} else {
			res.status(404).json({ message: 'Service not found' });
		}
	} catch (error) {
		console.error('Error deleting service:', error);
		res.status(500).json({ message: 'Error deleting service:', error: error.message });
	}
};
