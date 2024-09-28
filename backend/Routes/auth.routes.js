import express from 'express';
import {
  login,
  logout,
  registerAdmin,
  checkIfthereIsAnyAdmin,
  forgotPassword,
  resetPassword,
  adminChangePassword,
  adminUpdateProfile,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getAdmins', checkIfthereIsAnyAdmin);
router.post('/forgotPassword', forgotPassword); // Add forgot password route
router.post('/resetPassword', resetPassword); // Add reset password route
router.put('/adminChangePassword', adminChangePassword); // Add reset password route
router.put('/adminUpdateProfile/:id', adminUpdateProfile); // Add reset password route

export default router;
