import MsUser from '../models/MsUsers.js';
import Cart from '../models/Cart.js'; 
import CartItem from '../models/CartItemm.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const salt = 10;

const generateCartId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const registerUser = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		//Express menangkap axios.post via req.bodu

		/* 
		User itu model Sequelize yang mewakili tabel user di MySQL.
		findOne = ambil satu baris data dari database.
		{ where: { email } } = kondisi query → ambil user dengan kolom email sama dengan nilai email yang dikirim dari frontend.
		*/
		const existingUser = await MsUser.findOne({ where: { email } });
		if (existingUser) {
			//status 400 = User exist already
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await MsUser.create({
			username,
			email,
			password: hashedPassword,
		});

		await Cart.create({
			session_id: generateCartId(),
			user_id: newUser.id_user,
			expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
		});
		console.log('🆕 Cart created for new user:', newUser.id_user);

		res.status(201).json({
			message: 'User registered successfully',
			user: { id: newUser.id_user, username: newUser.username, email: newUser.email },
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!process.env.JWT_SECRET) {
			console.error('JWT_SECRET is not defined in environment variables');
			return res.status(500).json({ message: 'Server configuration error' });
		}

		//cek user email udh bener/blm
		const user = await MsUser.findOne({ where: { email } });
		if (!user) return res.status(400).json({ message: 'Invalid email or password' });

		console.log('login attempt:', email, password);
		console.log('stored hash:', user.password);

		//cek passiword
		const isMatch = await bcrypt.compare(password, user.password); //compare(plainText, hashed)
		if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

		console.log('🔄 Checking for guest cart transfer...');
		if (req.session?.cartId) {
			const guestCart = await Cart.findOne({
				where: { session_id: req.session.cartId }
			});
			
			if (guestCart && guestCart.user_id === null) {
				// Cari atau buat user cart
				let userCart = await Cart.findOne({
					where: { user_id: user.id_user }
				});
				
				if (!userCart) {
					userCart = await Cart.create({
						session_id: generateCartId(),
						user_id: user.id_user,
						expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
					});
					console.log('🆕 User cart created during login:', userCart.cart_id);
				}
				
				// Transfer cart items dari guest cart ke user cart
				const transferredItems = await CartItem.update(
					{ cart_id: userCart.cart_id },
					{ where: { cart_id: guestCart.cart_id } }
				);
				
				// Hapus guest cart
				await Cart.destroy({ where: { cart_id: guestCart.cart_id } });
				
				// Update session ke user cart
				req.session.cartId = userCart.session_id;
				
				console.log(`✅ Transferred ${transferredItems[0]} items from guest cart to user cart`);
			}
		} else {
			console.log('ℹ️ No guest cart to transfer');
		}

		//generate token
		const token = jwt.sign({ id: user.id_user, email: user.email, role: user.role }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		res.cookie('token', token, {
			httpOnly: true, // tidak bisa diakses JS → aman dari XSS
			secure: false, // true kalau pakai https
			sameSite: 'strict',
			maxAge: 60 * 60 * 1000, // 1 jam
		});

		res.status(200).json({
			message: 'Login successful',
			token: token,
			role: user.role,
		});
	} catch (error) {
		console.log('❌ Login error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getMe = async (req, res) => {
	try {
		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ message: 'Server configuration error' });
		}

		const token = req.cookies.token;
		if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await MsUser.findByPk(decoded.id, {
			attributes: ['id_user', 'username', 'email'], 
		});
		if (!user) return res.status(404).json({ message: 'User not found' });

		res.status(200).json({
			id: user.id_user,
			username: user.username,
			email: user.email,
		});
	} catch (error) {
		console.log(error);
		res.status(401).json({ message: 'Invalid token' });
	}
};

export const logoutUser = (req, res) => {
	try {
		// ❌ JANGAN clear session cartId, biarkan cart tetap ada
		// req.session.cartId = null;
		
		res.clearCookie('token');
		res.json({
			success: true,
			message: 'Logout successful'
		});
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({ success: false, message: 'Logout failed' });
	}
};