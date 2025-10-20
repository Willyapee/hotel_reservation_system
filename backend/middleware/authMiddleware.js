import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => { 
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // simpan data user di req, jadi bisa dipakai di controller berikutnya
        next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};