import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => { 
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access denied. No token provided." 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification error:', error);
        
        res.clearCookie('token');
        
        return res.status(403).json({ 
            success: false,
            message: "Invalid or expired token" 
        });
    }
};

export const checkAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};