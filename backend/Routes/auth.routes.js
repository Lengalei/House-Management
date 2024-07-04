import express from 'express';
import {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword); // Add forgot password route
router.post('/resetPassword', resetPassword); // Add reset password route

export default router;
