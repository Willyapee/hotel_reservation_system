// controllers/adminController.js
import { Op } from 'sequelize';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import Room from '../models/Rooms.js';
import MsServices from '../models/msServices.js';
import Invoices from '../models/Invoices.js';
import Payments from '../models/Payments.js';

// STEP 6: ASSIGN ROOM WHEN USER CHECK-IN
export const assignRoomOnCheckin = async (req, res) => {
    try {
        const { reservation_id } = req.body;

        const reservation = await Reservations.findByPk(reservation_id, {
            include: [{
                model: RoomReservations,
                as: 'room_reservations'
            }]
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Cek apakah sudah check-in
        if (reservation.room_reservations[0].status === 'checked_in') {
            return res.status(400).json({ message: "Already checked in" });
        }

        // Update room reservation status to checked_in
        await RoomReservations.update(
            { status: 'checked_in' },
            { where: { id_reservation: parseInt(reservation_id) } }
        );

        // Update reservation status
        await reservation.update({ status: 'checked_in' });

        res.json({
            message: "Check-in successful",
            reservation_id: reservation_id,
            status: 'checked_in',
            room_number: reservation.room_reservations[0].room.room_number,
            check_in_date: reservation.check_in
        });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// STEP 7: ADD SERVICES DURING STAY
export const addServicesDuringStay = async (req, res) => {
    try {
        const { reservation_id, services } = req.body;

        const reservation = await Reservations.findByPk(reservation_id, {
            include: [{
                model: RoomReservations,
                as: 'room_reservations'
            }]
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Cek status checked_in
        if (reservation.room_reservations[0].status !== 'checked_in') {
            return res.status(400).json({ message: "Customer is not checked in" });
        }

        const addedServices = [];
        let additionalTotal = 0;

        for (const service of services) {
            const serviceData = await MsServices.findByPk(service.id_service);
            if (serviceData) {
                const subtotal = serviceData.service_price * service.quantity;
                additionalTotal += subtotal;
                
                const serviceReservation = await ServiceReservations.create({
                    id_room_reservation: reservation.room_reservations[0].id_room_reservation,
                    id_service: service.id_service,
                    quantity: service.quantity,
                    subtotal_price: subtotal
                });
                
                addedServices.push({
                    service_name: serviceData.name,
                    quantity: service.quantity,
                    unit_price: serviceData.service_price,
                    subtotal: subtotal
                });
            }
        }

        // Update invoice total amount
        const invoice = await Invoices.findOne({
            where: { id_reservation: parseInt(reservation_id) }
        });

        if (invoice) {
            const newTotal = parseFloat(invoice.total_amount) + additionalTotal;
            await invoice.update({ total_amount: newTotal });
        }

        res.json({
            message: "Services added successfully during stay",
            added_services: addedServices,
            additional_total: additionalTotal,
            new_invoice_total: invoice ? invoice.total_amount : additionalTotal
        });

    } catch (error) {
        console.error("Add services during stay error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// STEP 8: CHECKOUT & GENERATE FINAL INVOICE
export const checkoutAndGenerateInvoice = async (req, res) => {
    try {
        const { reservation_id } = req.body;

        const reservation = await Reservations.findByPk(reservation_id, {
            include: [{
                model: RoomReservations,
                as: 'room_reservations',
                include: [{
                    model: ServiceReservations,
                    as: 'services',
                    include: [{
                        model: MsServices,
                        as: 'service'
                    }]
                }]
            }]
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Update status to checked_out
        await RoomReservations.update(
            { status: 'checked_out' },
            { where: { id_reservation: parseInt(reservation_id) } }
        );

        await reservation.update({ status: 'checked_out' });

        // Calculate final total dari semua rooms dan services
        const finalTotal = reservation.room_reservations.reduce((sum, rr) => {
            const roomSubtotal = parseFloat(rr.subtotal_price);
            const servicesSubtotal = rr.services.reduce((sSum, sr) => 
                sSum + parseFloat(sr.subtotal_price), 0
            );
            return sum + roomSubtotal + servicesSubtotal;
        }, 0);

        // Update invoice dengan final total
        const invoice = await Invoices.findOne({
            where: { id_reservation: parseInt(reservation_id) }
        });

        let finalInvoice;
        if (invoice) {
            await invoice.update({ 
                total_amount: finalTotal,
                status: 'pending_payment' // Status khusus untuk menunggu pembayaran
            });
            finalInvoice = invoice;
        }

        // Siapkan detail untuk response
        const invoiceDetails = {
            reservation_id: reservation_id,
            customer_name: reservation.customer_name,
            check_in: reservation.check_in,
            check_out: reservation.check_out,
            room_charges: reservation.room_reservations.map(rr => ({
                room_number: rr.room.room_number,
                room_type: rr.room.room_type.name,
                subtotal: rr.subtotal_price
            })),
            service_charges: reservation.room_reservations.flatMap(rr => 
                rr.services.map(sr => ({
                    service_name: sr.service.name,
                    quantity: sr.quantity,
                    unit_price: sr.service.service_price,
                    subtotal: sr.subtotal_price
                }))
            ),
            final_total: finalTotal
        };

        res.json({
            message: "Checkout successful. Please proceed to payment.",
            reservation_id: reservation_id,
            status: 'checked_out',
            final_invoice: invoiceDetails,
            payment_required: true
        });

    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ACTIVE STAYS (Untuk admin lihat siapa yang sedang menginap)
export const getActiveStays = async (req, res) => {
    try {
        const activeStays = await Reservations.findAll({
            where: { 
                status: 'checked_in',
                check_out: { [Op.gte]: new Date() } // Masih dalam masa menginap
            },
            include: [{
                model: RoomReservations,
                as: 'room_reservations',
                include: [
                    {
                        model: Room,
                        as: 'room',
                        include: [{
                            model: MsRoomType,
                            as: 'room_type'
                        }]
                    },
                    {
                        model: ServiceReservations,
                        as: 'services',
                        include: [{
                            model: MsServices,
                            as: 'service'
                        }]
                    }
                ]
            }],
            order: [['check_in', 'ASC']]
        });

        res.json({
            active_stays: activeStays
        });

    } catch (error) {
        console.error("Get active stays error:", error);
        res.status(500).json({ message: "Server error" });
    }
};