import MsRoomType from '../models/msRoomTypes.js';
import Rooms from '../models/Rooms.js';
import { Op } from 'sequelize';

// === ROOM TYPE CONTROLLERS ===
export const createRoomType = async (req, res) => {
  try {
    const { name, capacity, price_per_night, description, room_bed, max_stay_duration, image_url } = req.body;

    // Validation
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

    // Check if room type name already exists
    const existingRoomType = await MsRoomType.findOne({ 
      where: { name: name.trim() } 
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
      image_url: image_url || null
    });

    res.status(201).json({ 
      message: 'Room type created successfully', 
      roomType: newRoomType 
    });
  } catch (error) {
    console.error('Error creating room type:', error);
    res.status(500).json({ 
      message: 'Error creating room type', 
      error: error.message 
    });
  }
};

export const readRoomTypes = async (req, res) => {
  try {
    const roomTypes = await MsRoomType.findAll({
      order: [['name', 'ASC']]
    });
    res.status(200).json(roomTypes);
  } catch (error) {
    console.error('Error reading room types:', error);
    res.status(500).json({ 
      message: 'Error reading room types', 
      error: error.message 
    });
  }
};

export const updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, price_per_night, description, room_bed, max_stay_duration, image_url } = req.body;

    // Check if room type exists
    const existingRoomType = await MsRoomType.findByPk(id);
    if (!existingRoomType) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    // Validation
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

    // Check if room type name already exists (excluding current room type)
    const duplicateRoomType = await MsRoomType.findOne({ 
      where: { 
        name: name.trim(),
        id_room_type: { [Op.ne]: id }
      } 
    });
    if (duplicateRoomType) {
      return res.status(400).json({ message: 'Room type name already exists' });
    }

    const [updated] = await MsRoomType.update({
      name: name.trim(),
      capacity,
      price_per_night,
      description: description.trim(),
      room_bed: room_bed.trim(),
      max_stay_duration,
      image_url: image_url || null
    }, { 
      where: { id_room_type: id } 
    });

    if (updated) {
      const updatedRoomType = await MsRoomType.findByPk(id);
      res.status(200).json({ 
        message: 'Room type updated successfully', 
        roomType: updatedRoomType 
      });
    } else {
      res.status(404).json({ message: 'Room type not found' });
    }
  } catch (error) {
    console.error('Error updating room type:', error);
    res.status(500).json({ 
      message: 'Error updating room type', 
      error: error.message 
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
      where: { id_room_type: id } 
    });
    
    if (associatedRooms > 0) {
      return res.status(400).json({ 
        message: `Cannot delete room type. There are ${associatedRooms} room(s) associated with this room type. Please delete or reassign the rooms first.` 
      });
    }

    const deleted = await MsRoomType.destroy({ 
      where: { id_room_type: id } 
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
      error: error.message 
    });
  }
};

// === ROOM CONTROLLERS ===
export const createRoom = async (req, res) => {
  try {
    const { id_room_type, room_number } = req.body;

    // Validation
    if (!id_room_type) {
      return res.status(400).json({ message: 'Room type is required' });
    }
    if (!room_number || !room_number.trim()) {
      return res.status(400).json({ message: 'Room number is required' });
    }

    // Check if room type exists
    const roomType = await MsRoomType.findByPk(id_room_type);
    if (!roomType) {
      return res.status(400).json({ message: 'Selected room type does not exist' });
    }

    // Check if room number already exists
    const existingRoom = await Rooms.findOne({ 
      where: { room_number: room_number.trim() } 
    });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const newRoom = await Rooms.create({
      id_room_type,
      room_number: room_number.trim()
    });

    // Include room type information in response
    const roomWithType = await Rooms.findByPk(newRoom.id_room, {
      include: [{ model: MsRoomType, as: 'room_type' }]
    });

    res.status(201).json({ 
      message: 'Room created successfully', 
      room: roomWithType 
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ 
      message: 'Error creating room', 
      error: error.message 
    });
  }
};

export const readRooms = async (req, res) => {
  try {
    const rooms = await Rooms.findAll({
      include: [{ model: MsRoomType, as: 'room_type' }],
      order: [['room_number', 'ASC']]
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error reading rooms:', error);
    res.status(500).json({ 
      message: 'Error reading rooms', 
      error: error.message 
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

    // Validation
    if (!id_room_type) {
      return res.status(400).json({ message: 'Room type is required' });
    }
    if (!room_number || !room_number.trim()) {
      return res.status(400).json({ message: 'Room number is required' });
    }

    // Check if room type exists
    const roomType = await MsRoomType.findByPk(id_room_type);
    if (!roomType) {
      return res.status(400).json({ message: 'Selected room type does not exist' });
    }

    // Check if room number already exists (excluding current room)
    const duplicateRoom = await Rooms.findOne({ 
      where: { 
        room_number: room_number.trim(),
        id_room: { [Op.ne]: id }
      } 
    });
    if (duplicateRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const [updated] = await Rooms.update({
      id_room_type,
      room_number: room_number.trim()
    }, { 
      where: { id_room: id } 
    });

    if (updated) {
      const updatedRoom = await Rooms.findByPk(id, {
        include: [{ model: MsRoomType, as: 'room_type' }]
      });
      res.status(200).json({ 
        message: 'Room updated successfully', 
        room: updatedRoom 
      });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ 
      message: 'Error updating room', 
      error: error.message 
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const room = await Rooms.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has active reservations (you might want to add this later)
    // const activeReservations = await RoomReservations.count({
    //   where: { id_room: id, status: 'active' }
    // });
    // if (activeReservations > 0) {
    //   return res.status(400).json({ 
    //     message: 'Cannot delete room with active reservations' 
    //   });
    // }

    const deleted = await Rooms.destroy({ 
      where: { id_room: id } 
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
      error: error.message 
    });
  }
};