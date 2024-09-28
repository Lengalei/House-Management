import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      // Extract the token from the cookies
      const token = req.cookies.token;

      if (!token) {
        return res
          .status(401)
          .json({ message: 'Access denied. No token provided.' });
      }

      // Verify the token and get the user ID from it
      // eslint-disable-next-line no-undef
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userId = decoded.id;

      // Fetch the user from the database using the decoded ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if the user's role is included in the allowed roles
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      // Attach the user object to the request object for use in the next middleware or route
      req.user = user;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(403).json({ message: 'Access denied. Invalid token.' });
    }
  };
};
