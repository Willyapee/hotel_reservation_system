import MsUser from '../models/MsUsers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const salt = 10;

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await MsUser.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await MsUser.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { 
                id: newUser.id_user, 
                username: newUser.username, 
                email: newUser.email 
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ 
                success: false,
                message: 'Server configuration error' 
            });
        }

        const user = await MsUser.findOne({ where: { email } });
        if (!user) return res.status(400).json({ 
            success: false,
            message: 'Invalid email or password' 
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ 
            success: false,
            message: 'Invalid email or password' 
        });

        const token = jwt.sign(
            { 
                id: user.id_user, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } 
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, 
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id_user,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log('❌ Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};


export const getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const user = await MsUser.findByPk(req.user.id, {
            attributes: ['id_user', 'username', 'email', 'role'],
        });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id_user,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log('Get me error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
};

export const checkAuthStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: 'Not authenticated'
      });
    }

    const user = await MsUser.findByPk(req.user.id, {
      attributes: ['id_user', 'username', 'email', 'role'],
    });
    
    if (!user) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: 'User not found in database'
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user.id_user,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log('Check auth error:', error);
    res.status(200).json({ 
      success: true,
      authenticated: false,
      message: 'Authentication check failed'
    });
  }
};