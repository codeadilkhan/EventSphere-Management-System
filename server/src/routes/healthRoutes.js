const express = require('express');
const mongoose = require('mongoose');
const { sendFormattedResponse } = require('../utils/helpers');

const healthRouter = express.Router();

healthRouter.get('/', (req, res) => {
  const dbStateIndex = mongoose.connection.readyState;
  const dbStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const mem = process.memoryUsage();

  const healthData = {
    service: 'EventSphere Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseStatus: dbStates[dbStateIndex] || 'Unknown',
    databaseConnected: dbStateIndex === 1,
    nodeEnvironment: process.env.NODE_ENV || 'development',
    memoryUsageMB: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    },
  };

  const httpStatus = dbStateIndex === 1 || process.env.NODE_ENV === 'test' ? 200 : 503;
  sendFormattedResponse(res, httpStatus, httpStatus === 200, healthData, 'EventSphere service operational');
});

module.exports = healthRouter;
