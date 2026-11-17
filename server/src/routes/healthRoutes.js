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

  const healthData = {
    service: 'EventSphere Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseStatus: dbStates[dbStateIndex] || 'Unknown',
    nodeEnvironment: process.env.NODE_ENV || 'development',
  };

  sendFormattedResponse(res, 200, true, healthData, 'EventSphere service operational');
});

module.exports = healthRouter;
