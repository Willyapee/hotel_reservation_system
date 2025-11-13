import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session'; // ✅ IMPORT SESSION
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import MsUser from './models/MsUsers.js';
import MsRoomType from './models/msRoomTypes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

import db from './config/db.js';
import defineRelationships from './models/Relationship.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationsRoutes.js';
import roomReservationsRoutes from './routes/roomReservationsRoutes.js';
import servicesRoutes from './routes/serviceRoutes.js';
import serviceReservationsRoutes from './routes/serviceReservationsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

/*===================== JADIIN COMMENT KALAU MAU LOCAL EDIT ===================== */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174' // ✅ BACKUP PORT
];
/*=============================================================================== */

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	})
);

app.use(cookieParser());

// ✅ SESSION MIDDLEWARE (PENTING UNTUK CART SYSTEM)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // true jika pakai HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 jam
  }
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);
app.use('/room-reservations', roomReservationsRoutes);
app.use('/services', servicesRoutes);
app.use('/service-reservations', serviceReservationsRoutes);
app.use('/admin', adminRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);
app.use('/api/cart', cartRoutes);

/*===================== JADIIN COMMENT KALAU MAU LOCAL EDIT ===================== */
// const __filename = fileURLToPath(import.meta.url);
// const _dirname = path.dirname(_filename);

// if (process.env.NODE_ENV === 'production') {
// 	const buildPath = path.join(__dirname, '../client/dist');
// 	app.use(express.static(buildPath));

// 	app.get('*', (req, res) => {
// 		res.sendFile(path.join(buildPath, 'index.html'));
// 	});
// }
/*=============================================================================== */

(async () => {
	try {
		await db.authenticate();
		console.log('✅ Connected to the database');

		defineRelationships();
		console.log('🔗 Relationships defined');

		// ✅ FIXED: SAFE DATABASE SYNC - NO MORE DUPLICATE INDEXES
		if (process.env.NODE_ENV === 'production') {
			await db.sync({ alter: true });
			console.log('📦 Production: All models synchronized with alter');
		} else {
			// Development: Safe sync without alter to prevent duplicate indexes
			await db.sync({ force: false, alter: false });
			console.log('📦 Development: All models synchronized safely (no alter)');
		}

		try {
			const adminEmail = 'admin@admin.admin';
			const existingAdmin = await MsUser.findOne({ where: { email: adminEmail } });

			if (!existingAdmin) {
				const hashedPassword = await bcrypt.hash('admin', 10);
				await MsUser.create({
					username: 'Admin',
					email: adminEmail,
					password: hashedPassword,
					role: 'admin',
				});
				console.log('✅ Default admin successfully created');
			} else {
				console.log('ℹ️ Default admin already exists');
			}
		} catch (error) {
			console.error('❌ Failed to create default admin:', error);
		}

		try {
			const roomTypeCount = await MsRoomType.count();

			if (roomTypeCount === 0) {
				const defaultRoomTypes = [
					{
						name: 'Stellar Suite',
						capacity: 2,
						price_per_night: 200,
						description: 'Warm materials, elegant furnishings and sweeping view of the slopes.',
						room_bed: 'King Bed • 40m²',
						max_stay_duration: 30,
						image_url: '../public/room/room1.jpg',
					},
					{
						name: 'Orion Suite',
						capacity: 3,
						price_per_night: 250,
						description: 'Separate living room, refined details and private balcony.',
						room_bed: 'King Bed • Living Area • 50m²',
						max_stay_duration: 30,
						image_url: '../public/room/room3.jpg',
					},
					{
						name: 'Deluxe Luna',
						capacity: 2,
						price_per_night: 300,
						description: 'Expansive terrace, private services and panoramic vistas.',
						room_bed: 'King Bed • Terrace • 40m²',
						max_stay_duration: 30,
						image_url: '../public/room/room7.jpg',
					},
					{
						name: 'Celestial Chamber',
						capacity: 2,
						price_per_night: 350,
						description: 'Cozy elegance with soft tones, perfect for a serene retreat.',
						room_bed: 'Queen Bed • 35m²',
						max_stay_duration: 30,
						image_url: '../public/room/room4.jpg',
					},
					{
						name: 'Aurora Retreat',
						capacity: 2,
						price_per_night: 400,
						description:
							'Bright interiors with natural light and a private balcony overlooking the skyline.',
						room_bed: 'King Bed • Balcony • 45m²',
						max_stay_duration: 30,
						image_url: '../public/room/room5.jpg',
					},
					{
						name: 'Galaxy Loft',
						capacity: 4,
						price_per_night: 450,
						description:
							'Two-story loft with modern design, spacious living area, and sweeping city views.',
						room_bed: 'King Bed • Duplex • 55m²',
						max_stay_duration: 30,
						image_url: '../public/room/room8.jpg',
					},
					{
						name: 'Nova Deluxe',
						capacity: 2,
						price_per_night: 500,
						description: 'Refined comfort with flexible twin setup, ideal for friends or family.',
						room_bed: 'Twin Beds • 38m²',
						max_stay_duration: 30,
						image_url: '../public/room/room9.jpg',
					},
					{
						name: 'Lunar Penthouse',
						capacity: 4,
						price_per_night: 550,
						description:
							'Opulent penthouse featuring a jacuzzi, floor-to-ceiling windows, and premium amenities.',
						room_bed: 'King Bed • Jacuzzi • 90m²',
						max_stay_duration: 30,
						image_url: '../public/room/room6.jpg',
					},
				];

				await MsRoomType.bulkCreate(defaultRoomTypes);
				console.log('✅ Default room types berhasil dibuat');
			} else {
				console.log('ℹ️ Default room types already exist.');
			}
		} catch (error) {
			console.error('❌ Gagal membuat default room types:', error);
		}

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error('❌ Unable to connect to the database:', error);
	}
})();