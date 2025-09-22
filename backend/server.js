import express from 'express';
import cors from 'cors';
import db from './config/database.js';
import authRouters from './routes/authRouters.js';

try {
    await db.authenticate();
    console.log('Database Connected');
} catch (error) {
    console.error(error);
}

const app = express();
app.use(express.json());
app.use(authRouters);

app.listen(5000, ()=> { 
    console.log('Server is Running');
})