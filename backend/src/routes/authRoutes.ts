import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';

const router = Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);
router.post('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', protect, authController.getMe);

export default router;
