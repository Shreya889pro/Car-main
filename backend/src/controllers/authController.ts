import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Employee } from '../models';
import { HTTP_STATUS, UserRole } from '../constants';
import { sendResponse, sendErrorResponse } from '../utils/response';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generatePasswordResetToken, generateEmailVerificationToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email';
import config from '../config';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendErrorResponse(res, HTTP_STATUS.CONFLICT, 'User already exists with this email');
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.EMPLOYEE,
      emailVerificationToken: generateEmailVerificationToken().hashedToken,
    });

    // Send verification email
    const { token } = generateEmailVerificationToken();
    await sendVerificationEmail(email, token, firstName);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    sendResponse(res, HTTP_STATUS.CREATED, userResponse, 'User registered. Please check your email for verification.');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error creating user');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'Account is deactivated');
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Set cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Get employee data
    const employee = await Employee.findOne({ user: user._id });

    sendResponse(res, HTTP_STATUS.OK, {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      employee,
      tokens: { accessToken, refreshToken },
    }, 'Login successful');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Login failed');
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Remove refresh token from user
      await User.findByIdAndUpdate(req.user?._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    sendResponse(res, HTTP_STATUS.OK, null, 'Logged out successfully');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Logout failed');
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Refresh token required');
    return;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(token)) {
      sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, 'Invalid refresh token');
      return;
    }

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update refresh tokens
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, HTTP_STATUS.OK, { accessToken }, 'Token refreshed');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, HTTP_STATUS.OK, null, 'If user exists, password reset email sent');
      return;
    }

    const { token, hashedToken } = generatePasswordResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, token, user.firstName);

    sendResponse(res, HTTP_STATUS.OK, null, 'Password reset email sent');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error sending reset email');
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  try {
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid or expired reset token');
      return;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    sendResponse(res, HTTP_STATUS.OK, null, 'Password reset successful');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error resetting password');
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
      return;
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    sendResponse(res, HTTP_STATUS.OK, null, 'Password changed successfully');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error changing password');
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) {
      sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid verification token');
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    sendResponse(res, HTTP_STATUS.OK, null, 'Email verified successfully');
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error verifying email');
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password -refreshTokens');
    const employee = await Employee.findOne({ user: req.user?._id })
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName');

    sendResponse(res, HTTP_STATUS.OK, { user, employee });
  } catch (error) {
    sendErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error fetching user');
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getMe,
};
