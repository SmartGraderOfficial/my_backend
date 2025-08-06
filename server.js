import express from 'express';
import { app } from './app.js';
import { connectDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDb();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });

    // Set server timeout
    server.timeout = 30000; // 30 seconds

    // Export server for graceful shutdown
    global.server = server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


