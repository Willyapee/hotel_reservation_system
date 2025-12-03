import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => { 
    try {
        const token = req.cookies.token;

        if (!token) {
            req.user = null;
            console.log('Guest user');
        } else {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                console.log('Authenticated user:', decoded.id);
            } catch (error) {
                req.user = null;
                console.log('Invalid token');
            }
        }
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        req.user = null;
        next();
    }
};

export const getOrCreateCartId = (req, res, next) => {
    try {
        if (!req.session.cartId) {
            req.session.cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('New cart ID:', req.session.cartId);
        }
        
        req.cartIdentifier = req.session.cartId;
        console.log('Cart identifier:', req.cartIdentifier);
        next();
    } catch (error) {
        console.error("Cart middleware error:", error);
        res.status(500).json({ message: "Cart initialization error" });
    }
};