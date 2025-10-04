import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const salt = 10;

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //Express menangkap axios.post via req.bodu

    /* 
    User itu model Sequelize yang mewakili tabel user di MySQL.
    findOne = ambil satu baris data dari database.
    { where: { email } } = kondisi query → ambil user dengan kolom email sama dengan nilai email yang dikirim dari frontend.
    */
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      //status 400 = User exist already
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => { 
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    //cek user email udh bener/blm
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    
    console.log("login attempt:", email, password);
    console.log("stored hash:", user.password);

    //cek password
    const isMatch = await bcrypt.compare(password, user.password); //compare(plainText, hashed)
    if(!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    //generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,   // tidak bisa diakses JS → aman dari XSS
      secure: false,    // true kalau pakai https
      sameSite: "strict",
      maxAge: 60 * 60 * 1000 // 1 jam
    });

    //respons ke frontend
    res.status(200).json({
      message: "Login successful",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email'] // exclude password
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);

  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token" });
  }
};