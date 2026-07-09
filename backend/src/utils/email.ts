import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: config.FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, token: string, name: string): Promise<boolean> => {
  const verificationUrl = `${config.CLIENT_URL}/verify-email/${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2563EB;">FlowCore - Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with FlowCore. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
      <p style="color: #666;">If you did not create an account, you can safely ignore this email.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'FlowCore - Verify Your Email',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string): Promise<boolean> => {
  const resetUrl = `${config.CLIENT_URL}/reset-password/${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2563EB;">FlowCore - Password Reset</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
      <p style="color: #666;">If you did not request a password reset, please ignore this email.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'FlowCore - Reset Your Password',
    html,
  });
};

export const sendWelcomeEmail = async (email: string, name: string, tempPassword?: string): Promise<boolean> => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2563EB;">Welcome to FlowCore!</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created on FlowCore Enterprise Workflow Management System.</p>
      ${tempPassword ? `
        <p style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Temporary Password:</strong> <code>${tempPassword}</code>
        </p>
        <p style="color: #EF4444; font-weight: bold;">Please change your password immediately after logging in.</p>
      ` : ''}
      <p>You can log in at: <a href="${config.CLIENT_URL}/login">${config.CLIENT_URL}/login</a></p>
      <p style="color: #666; margin-top: 20px;">If you have any questions, please contact your administrator.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to FlowCore!',
    html,
  });
};
