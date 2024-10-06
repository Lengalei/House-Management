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
  adminUpdate,
  deleteAdmin,
} from '../controllers/auth.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);
router.get('/logout', logout);
router.get('/getAdmins', checkIfthereIsAnyAdmin);
router.post('/forgotPassword', forgotPassword); // Add forgot password route
router.post('/resetPassword', resetPassword); // Add reset password route
router.put('/adminChangePassword', adminChangePassword); // Add reset password route
router.put('/adminUpdateProfile/:id', adminUpdateProfile); // Add reset password route
router.put('/adminUpdate', authorizeRoles('super_admin'), adminUpdate);
router.delete(
  '/deleteAdmin/:adminId',
  authorizeRoles('super_admin'),
  deleteAdmin
);

export default router;
