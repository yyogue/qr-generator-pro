#!/usr/bin/env node

const express = require('express');
const path = require('path');
const open = require('open');
const chalk = require('chalk');

const app = express();
let PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

console.log(chalk.blue.bold('\n🎯 QR Generator Pro') + chalk.gray(' - Starting...\n'));

// Function to find available port
const findAvailablePort = (port, callback) => {
  const server = app.listen(port, () => {
    callback(null, port);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(chalk.yellow(`Port ${port} is busy, trying ${port + 1}...`));
      findAvailablePort(port + 1, callback);
    } else {
      callback(err);
    }
  });
  return server;
};

// Start server with automatic port detection
const server = findAvailablePort(PORT, (err, availablePort) => {
  if (err) {
    console.error(chalk.red('❌ Failed to start server:'), err.message);
    process.exit(1);
  }
  
  const url = `http://localhost:${availablePort}`;
  
  console.log(chalk.green('✅ Server running at:'), chalk.cyan(url));
  console.log(chalk.yellow('✨ Opening browser...'));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));
  
  // Open browser
  open(url).catch(() => {
    console.log(chalk.yellow('Could not open browser automatically'));
    console.log(chalk.cyan(`Please open ${url} manually`));
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down...'));
  if (server && server.close) {
    server.close(() => {
      console.log(chalk.green('✅ Goodbye!'));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
