import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import config from './config';
import connectDatabase from './config/database';
import { setupSocketHandlers } from './sockets';
import { setupScheduledJobs } from './jobs';

const PORT = config.PORT;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: config.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible to controllers
app.set('io', io);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Setup scheduled jobs
setupScheduledJobs();

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║   FlowCore - Enterprise Workflow Management System         ║
║                                                            ║
║   Server running on port ${PORT}                            ║
║   Environment: ${config.NODE_ENV.padEnd(38)}║
║   API: http://localhost:${PORT}/api                         ║
║                                                            ║
║   Press Ctrl+C to stop the server                         ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');

  server.close(() => {
    console.log('HTTP server closed');

    // Close Socket.IO connections
    io.close(() => {
      console.log('Socket.IO server closed');
    });

    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

export { server, io };
