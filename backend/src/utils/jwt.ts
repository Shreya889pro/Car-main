import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE } as jwt.SignOptions
  );
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRE } as jwt.SignOptions
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generatePasswordResetToken = (): { token: string; hashedToken: string } => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  return { token, hashedToken };
};

export const generateEmailVerificationToken = (): { token: string; hashedToken: string } => {
  const token = generateToken();
  const hashedToken = hashToken(token);
  return { token, hashedToken };
};
