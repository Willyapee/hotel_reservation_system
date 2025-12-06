import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), '../frontend/public/room/');

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const fileFilter = (req, file, cb) => {
	const filetypes = /jpeg|jpg|png|gif|webp|svg/;

	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

	const mimetype = filetypes.test(file.mimetype);

	console.log(`📂 Processing: ${file.originalname}`);
	console.log(`   ➜ Ext: ${path.extname(file.originalname)}`);
	console.log(`   ➜ Mime: ${file.mimetype}`);

	if (mimetype || extname) {
		return cb(null, true);
	} else {
		console.error('❌ File Rejected');
		cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: fileFilter,
});

export default upload;
