//Import Libraries
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

//Import Database dan Relationship
import db from './config/db.js';
import defineRelationships from './models/Relationship.js'; // ← TAMBAH .js

//Import Routes
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationsRoutes.js';
import roomReservationsRoutes from './routes/roomReservationsRoutes.js';
import servicesRoutes from './routes/serviceRoutes.js';
import serviceReservationsRoutes from './routes/serviceReservationsRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());

//Routes
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);
app.use('/room-reservations', roomReservationsRoutes);
app.use('/services', servicesRoutes);
app.use('/service-reservations', serviceReservationsRoutes);
// app.use('/admin', adminRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);

//Database connection and synchronization
(async () => {
	try {
		await db.authenticate();
		console.log('Connected to the database');

		defineRelationships();
		console.log('Relationships defined');

		await db.sync({ alter: true });
		console.log('All models were synchronized successfully');

		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
})();
