// routes/auth.routes.js
import express from 'express';
import { verifyToken } from '../../../middleware/jwtMiddleware.js';
const router = express.Router();

// New route for token validation
router.get('/verify', verifyToken);

export default router;
