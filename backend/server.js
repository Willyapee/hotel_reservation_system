import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

import db from "./config/db.js";
import defineRelationships from "./models/Relationship.js";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import reservationRoutes from "./routes/reservationsRoutes.js";
import roomReservationsRoutes from "./routes/roomReservationsRoutes.js";
import servicesRoutes from "./routes/serviceRoutes.js";
import serviceReservationsRoutes from "./routes/serviceReservationsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "../backend/routes/userRoutes.js";
const allowedOrigins = [
	process.env.CLIENT_URL || "http://localhost:5173"
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/reservations", reservationRoutes);
app.use("/room-reservations", roomReservationsRoutes);
app.use("/services", servicesRoutes);
app.use("/service-reservations", serviceReservationsRoutes);
app.use("/admin", adminRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

if (process.env.NODE_ENV === "production") {
	const buildPath = path.join(__dirname, "../client/dist");
	app.use(express.static(buildPath));

	app.get("*", (req, res) => {
		res.sendFile(path.join(buildPath, "index.html"));
	});
}

(async () => {
	try {
		await db.authenticate();
		console.log("✅ Connected to the database");

		defineRelationships();
		console.log("🔗 Relationships defined");

		// await db.sync({ alter: true });
		console.log("📦 All models synchronized successfully");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("❌ Unable to connect to the database:", error);
	}
})();