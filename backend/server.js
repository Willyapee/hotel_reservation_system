//Import Libraries
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

//Import Database dan Relationship
import db from './config/db.js';
import defineRelationships from './models/Relationship';

//Import Routes
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';

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

app.use('/facilities', facilityRoutes);

app.use('/payments', paymentsRoutes);

//Database connection and synxhronization
(async() => {
	try {
		await db.authenticate();
		console.log('conected to the database');

		defineRelationships();
		console.log('relationships defined');

		await db.sync({ alter: true });
		console.log('all models were synchronized successfully');

		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		})
	} catch (error) {
		console.error('unable to connect to the database:', error);
	}
})