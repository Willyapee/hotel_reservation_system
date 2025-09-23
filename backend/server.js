import express from 'express';
import cors from 'cors';
import db from './config/database.js';

import authRouters from './routes/authRouters.js';
import reservationRoutes from './routes/reservationRoutes.js'

const app = express();

app.use(
	cors({
		credentials: true,
		origin: 'http://localhost:5173',
	})
);

app.use(express.json());

try {
	await db.authenticate();
	console.log('Database Connected');
} catch (error) {
	console.error('Database connection error:', error);
}

app.use(authRouters);
app.use(reservationRoutes);

app.listen(5000, () => {
	console.log('Server is Running');
});
