import User from '../models/MsUsers.js';
import Reservations from '../models/Reservations.js'; 
import Invoices from '../models/Invoices.js';       
import db from '../config/db.js';
import { Op } from 'sequelize';

export const getAllUsers = async (req, res) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (err) {
		console.error('Error listing users', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findByPk(id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (err) {
		console.error('Error getting user', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const createUser = async (req, res) => {
	try {
		const newUser = await User.create(req.body);
		res.status(201).json(newUser);
	} catch (err) {
		console.error('Error creating user', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await User.update(req.body, { where: { id_user: id } });
		if (updated) {
			const updatedUser = await User.findByPk(id);
			return res.json(updatedUser);
		}
		res.status(404).json({ message: 'User not found' });
	} catch (err) {
		console.error('Error updating user', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await User.destroy({ where: { id_user: id } });
		if (deleted) return res.json({ message: 'User deleted' });
		res.status(404).json({ message: 'User not found' });
	} catch (err) {
		console.error('Error deleting user', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getTopSpendingUsers = async (req, res) => {
    try {
        console.log('🔍 [ANALYTICS] Fetching top spending users...');
        
        const testQuery = await User.findAll({
            include: [{
                model: Reservations,
                as: 'reservations',
                required: false,
                include: [{
                    model: Invoices,
                    as: 'invoice',
                    required: false,
                    where: { 
                        status: 'paid'
                    }
                }]
            }],
            limit: 5
        });

        console.log('✅ Test query successful, found:', testQuery.length, 'users');

        const topSpenders = await User.findAll({
            attributes: [
                'id_user',
                'username',
                'email',
                'role',
                [
                    db.fn('COUNT', 
                        db.fn('DISTINCT', db.col('reservations.id_reservation'))
                    ), 
                    'total_bookings'
                ],
                [
                    db.fn('SUM', 
                        db.col('reservations.invoice.total_amount')
                    ), 
                    'total_spent'
                ],
                [
                    db.fn('MAX', 
                        db.col('reservations.reservation_date')
                    ), 
                    'last_booking'
                ]
            ],
            include: [{
                model: Reservations,
                as: 'reservations',
                attributes: [],
                required: false,
                include: [{
                    model: Invoices,
                    as: 'invoice',
                    attributes: [],
                    required: false,
                    where: { 
                        status: 'paid'
                    }
                }]
            }],
            group: ['ms_user.id_user', 'ms_user.username', 'ms_user.email', 'ms_user.role'],
            order: [[db.literal('total_spent'), 'DESC']],
            limit: 10,
            subQuery: false
        });

        console.log('✅ Complex query successful, found:', topSpenders.length, 'top spenders');

        const formattedSpenders = topSpenders.map(user => {
            const data = user.get({ plain: true });
            return {
                id: data.id_user,
                username: data.username,
                email: data.email,
                role: data.role,
                totalBookings: parseInt(data.total_bookings) || 0,
                totalSpent: parseFloat(data.total_spent) || 0,
                lastBooking: data.last_booking 
                    ? new Date(data.last_booking).toLocaleDateString('id-ID') 
                    : 'No bookings'
            };
        }).filter(user => user.totalSpent > 0);

        const summary = {
            totalRevenue: formattedSpenders.reduce((sum, user) => sum + user.totalSpent, 0),
            averageSpending: formattedSpenders.length > 0 
                ? formattedSpenders.reduce((sum, user) => sum + user.totalSpent, 0) / formattedSpenders.length 
                : 0,
            topSpender: formattedSpenders[0] || null,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            summary,
            topSpenders: formattedSpenders,
            debug: {
                rawCount: topSpenders.length,
                filteredCount: formattedSpenders.length,
                testQueryCount: testQuery.length
            }
        });

    } catch (error) {
        console.error('❌ Error fetching top spending users:');
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching top spending users',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};
