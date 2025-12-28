import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }

        next();
    } catch (err) {
        // If token is invalid, we still proceed as guest
        next();
    }
};

export default auth;
