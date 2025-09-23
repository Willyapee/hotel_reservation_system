import express from 'express';
import cors from 'cors';
import db from './config/database.js';
import authRouters from './routes/authRouters.js';
import reservationsRoute from './routes/reservationRoutes.js';

try {
	await db.authenticate();
	console.log('Database Connected');
} catch (error) {
	console.error(error);
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(authRouters);
app.use(reservationsRoute);


app.listen(5000, () => {
	console.log('Server is Running');
});
