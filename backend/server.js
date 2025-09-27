import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/AuthRoutes.js";//nama fileny
import reservationRoutes from "./routes/reservationRouter.js";
import db from "./config/User.js";
import Users from "./models/User.js";

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors(
	{
		origin: "http://localhost:5173", //frontend
		credentials: true
	}
));
app.use(express.json());

//Routes
app.use("/auth", authRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

(async () => {
  try {
    await db.authenticate(); // cek koneksi
	console.log("Database connected...");
	//SELAMA ADA PERUBAHAN DI COLUMN TABLE, JALANKAN
	//await db.sync({ alter: true }); // sesuaikan table di db sesuai model
    await db.sync(); // bikin table kalau belum ada
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();