import ServiceReservations from '../models/ServiceReservations.js';
import RoomReservations from '../models/RoomReservations.js';
import MsServices from '../models/msServices.js';

export const addServiceToReservation = async (req, res) => {
    try {
        const { id_room_reservation, id_service, quantity } = req.body;
        
        const roomReservation = await RoomReservations.findByPk(id_room_reservation);
        if (!roomReservation) {
            return res.status(404).json({ message: "Room reservation not found" });
        }
        
        const service = await MsServices.findByPk(id_service);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        
        const subtotal_price = service.service_price * quantity;
        
        const serviceReservation = await ServiceReservations.create({
            id_room_reservation,
            id_service,
            quantity,
            subtotal_price
        });
        
        res.status(201).json({ 
            message: "Service added to reservation successfully", 
            service_reservation: serviceReservation 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getServicesByRoomReservation = async (req, res) => {
    try {
        const { id_room_reservation } = req.params;
        
        const serviceReservations = await ServiceReservations.findAll({
            where: { id_room_reservation: parseInt(id_room_reservation) },
            include: [{ model: MsServices, as: 'service' }]
        });
        
        res.json({ service_reservations: serviceReservations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};