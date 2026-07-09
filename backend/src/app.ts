import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import config from './config';
import { errorHandler, notFound } from './middleware/error';
import { authRateLimiter, apiRateLimiter } from './middleware/rateLimit';
import {
  authRoutes,
  employeeRoutes,
  departmentRoutes,
  plantRoutes,
  productionRoutes,
  inventoryRoutes,
  qualityRoutes,
  shipmentRoutes,
  notificationRoutes,
  documentRoutes,
  reportRoutes,
  dashboardRoutes,
  searchRoutes,
} from './routes';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.NODE_ENV === 'production',
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Info', 'Apikey'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookies
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API documentation endpoint
app.get('/api', (_req, res) => {
  res.json({
    name: 'FlowCore API',
    version: '1.0.0',
    description: 'Enterprise Workflow Management System API',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      departments: '/api/departments',
      plants: '/api/plants',
      production: '/api/production',
      inventory: '/api/inventory',
      quality: '/api/quality',
      shipments: '/api/shipments',
      notifications: '/api/notifications',
      documents: '/api/documents',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      search: '/api/search',
    },
  });
});

// Rate limiting
app.use('/api/auth', authRateLimiter);
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
