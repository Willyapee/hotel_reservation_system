import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const reservationFile = path.join(process.cwd(), 'models', 'reservations.json');

async function readReservations() {
	try {
		const data = await fs.promises.readFile(reservationFile, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		if (err.code === 'ENOENT') {
			return [];
		}
		throw err;
	}
}

async function writeReservations(reservations) {
	await fs.promises.writeFile(reservationFile, JSON.stringify(reservations, null, 2));
}

router.post('/reservation', async (req, res) => {
	try {
		const newReservation = req.body;

		if (!newReservation.guestName || !newReservation.checkInDate || !newReservation.checkOutDate) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const reservations = await readReservations();
		reservations.push(newReservation);
		await writeReservations(reservations);

		res.status(201).json({ message: 'Reservation created successfully' });
	   } catch (err) {
		   console.error('Reservation POST error:', err);
		   res.status(500).json({ message: 'Server error', error: err.message });
	   }
});

router.get('/reservation', async (req, res) => {
	try {
		const reservations = await readReservations();
		res.json(reservations);
	} catch (error) {
		console.error('Error getting reservations:', error);
		res.status(500).json({ message: 'Failed to get reservations' });
	}
});

export default router;
