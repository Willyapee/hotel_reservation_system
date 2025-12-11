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

export const getCustomerLoyaltyAnalytics = async (req, res) => {
    res.status(410).json({ 
        success: false, 
        message: 'Endpoint deprecated. Use /analytics/customer-loyalty instead' 
    });
};

export const getTopSpendingUsers = async (req, res) => {
    res.status(410).json({ 
        success: false, 
        message: 'Endpoint deprecated. Use /analytics/top-spenders instead' 
    });
};