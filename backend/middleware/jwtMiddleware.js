/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// JWT verification middleware
const verifyJWT = (req, res, next) => {
  // Allow access to /api/auth routes without checking the token
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  // Get the token from cookies
  const token = req.cookies.token;

  // If no token is provided, return a 403 (Forbidden) response
  if (!token) {
    return res
      .status(403)
      .json({ message: 'Access denied. No token provided. Please log in.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      // Return 401 (Unauthorized) if the token is invalid or expired
      return res
        .status(401)
        .json({ message: 'Invalid or expired token. Please log in again.' });
    }

    // Attach user info from the decoded token to the request object
    req.decodedToken = decoded;

    // Proceed to the next middleware or route
    next();
  });
};

// Route for verifying JWT validity (used by the frontend)
export const verifyToken = (req, res) => {
  // Get the token from cookies
  const token = req.cookies.token;

  // If no token is found, return a 403 (Forbidden) response
  if (!token) {
    return res
      .status(403)
      .json({ message: 'Access denied. No token provided. Please log in.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      // Return 401 (Unauthorized) if the token is invalid or expired
      return res
        .status(401)
        .json({ message: 'Invalid or expired token. Please log in again.' });
    }

    // If the token is valid, return a 200 (OK) response
    return res.status(200).json({ message: 'Token is valid', user: decoded });
  });
};

export default verifyJWT;
