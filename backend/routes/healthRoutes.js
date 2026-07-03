const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { getRedisHealth } = require('../redisClient');
const packageJson = require('../package.json');

router.get('/', async (req, res) => {
  let databaseStatus = 'Disconnected';

  try {
    await query('SELECT 1');
    databaseStatus = 'Connected';
  } catch {
    databaseStatus = 'Disconnected';
  }

  const redisStatus = await getRedisHealth();

  res.json({
    status: databaseStatus === 'Connected' ? 'UP' : 'DEGRADED',
    uptime: Math.floor(process.uptime()),
    database: databaseStatus,
    redis: redisStatus,
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    message: 'backend ci cd check',
  });
});

module.exports = router;
