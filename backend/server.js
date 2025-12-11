import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import cron from 'node-cron'; 
import { Op } from 'sequelize'; 

import MsUser from './models/MsUsers.js';
import MsRoomType from './models/msRoomTypes.js';
import MsServices from './models/msServices.js';
import Invoices from './models/Invoices.js';
import Reservations from './models/Reservations.js';
import RoomReservations from './models/RoomReservations.js';

import connectMongoDB from './config/mongoDb.js'; 
import feedbackRoutes from './routes/feedbackRoutes.js';

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
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js'; 
import analyticsRoutes from './routes/analyticsRoutes.js';

/*===================== JADIIN COMMENT KALAU MAU LOCAL EDIT ===================== */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174', // BACKUP PORT
];
/*=============================================================================== */

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);

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
app.use('/feedbacks', feedbackRoutes);
app.use('/analytics', analyticsRoutes);

/*===================== JADIIN COMMENT KALAU MAU LOCAL EDIT ===================== */
// const __filename = fileURLToPath(import.meta.url);
// const _dirname = path.dirname(_filename);

// if (process.env.NODE_ENV === 'production') {
//   const buildPath = path.join(__dirname, '../client/dist');
//   app.use(express.static(buildPath));

//   app.get('*', (req, res) => {
//     res.sendFile(path.join(buildPath, 'index.html'));
//   });
// }
/*=============================================================================== */

const setupCronJobs = () => {
    console.log('⏰ Setting up cron job for auto-cancel...');
    
    cron.schedule('*/5 * * * *', async () => {
        try {
            const now = new Date();
            console.log(`⏰ [${now.toLocaleTimeString()}] Checking expired invoices...`);
            
            const expiredInvoices = await Invoices.findAll({
                where: {
                    status: 'pending',
                    due_date: { [Op.lt]: now }
                },
                include: [{
                    model: Reservations,
                    as: 'reservation',
                    include: [{
                        model: RoomReservations,
                        as: 'room_reservations',
                        where: { status: 'pending_payment' }
                    }]
                }]
            });

            if (expiredInvoices.length > 0) {
                console.log(`📋 Found ${expiredInvoices.length} expired invoice(s)`);
                
                for (const invoice of expiredInvoices) {
                    await invoice.update({ status: 'expired' });
                    
                    for (const roomRes of invoice.reservation.room_reservations) {
                        await roomRes.update({ status: 'cancelled' });
                    }
                    
                    console.log(`✅ Invoice ${invoice.invoice_number} cancelled`);
                }
            }
            
        } catch (error) {
            console.error('❌ Cron job error:', error);
        }
    });
    
    console.log('✅ Auto-cancel cron job activated (runs every 5 minutes)');
};

(async () => {
  try {
    await db.authenticate();
    console.log('✅ Connected to the database');

    await connectMongoDB();

    defineRelationships();
    console.log('🔗 Relationships defined');

    const syncOptions = {
      force: false,
      alter: false 
    };

    if (process.env.NODE_ENV === 'production') {
      await db.sync(syncOptions);
      console.log('📦 Production: Models synchronized (alter disabled to prevent index duplication)');
    } else {
      await db.sync(syncOptions);  
      console.log('📦 Development: Models synchronized (alter disabled)');
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
      const existingServices = await MsServices.findOne({ where: { name: 'Breakfast' } });
      const defaultServices = [
        { name: 'Breakfast', desc: 'Premium buffet breakfast with international cuisine', service_price: 35.0, unit: 'per_person' },
        { name: 'Business Center', desc: 'Executive business facilities with meeting rooms', service_price: 50.0, unit: 'per_booking' },
        { name: 'Rooftop Beach Club', desc: 'Exclusive rooftop beach club with pool and bar', service_price: 75.0, unit: 'per_person' },
        { name: 'Spa', desc: 'Luxury spa treatments and massages', service_price: 89.0, unit: 'per_person' },
        { name: 'Butler Service', desc: 'Personal butler service for premium guests', service_price: 120.0, unit: 'per_booking' },
      ];
      
      if (!existingServices) {
        await MsServices.bulkCreate(defaultServices);
        console.log('✅ Default services successfully created');
      } else {
        console.log('ℹ️ Default services already exists');
      }
    } catch (error) {
      console.error('❌ Failed to create default services:', error);
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

    setupCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
      console.log(`🔧 Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`);
      console.log(`⏰ Cron jobs activated for reservation management`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();