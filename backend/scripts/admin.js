import bcrypt from 'bcrypt';
import MsUser from '../models/MsUsers.js';
import sequelize from '../config/db.js'; 

const admin = async () => {
	try {
		await sequelize.authenticate();
		console.log('Database connected.');

		const admin = await MsUser.findOne({ where: { email: 'admin@admin.admin' } });
		if (!admin) {
			console.log('Admin not found');
			return;
		}

		const newHash = await bcrypt.hash('admin', 10);
		admin.password = newHash;
		await admin.save();

		console.log('✅ Admin password successfully rehashed!');
	} catch (err) {
		console.error('❌ Error fixing admin password:', err);
	} finally {
		await sequelize.close();
		console.log('Connection closed.');
	}
};

admin();
