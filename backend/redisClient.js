const { createClient } = require('redis');

let client;
let connectPromise;

function getRedisUrl() {
  return process.env.REDIS_URL || null;
}

async function getRedisClient() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    return null;
  }

  if (!client) {
    client = createClient({ url: redisUrl });
    client.on('error', () => {});
  }

  if (!client.isOpen) {
    connectPromise = connectPromise || client.connect().catch((error) => {
      connectPromise = null;
      throw error;
    });

    await connectPromise;
  }

  return client;
}

async function getRedisHealth() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    return 'Not Configured';
  }

  try {
    const redisClient = await getRedisClient();
    if (!redisClient) {
      return 'Not Configured';
    }

    const pong = await redisClient.ping();
    return pong === 'PONG' ? 'Connected' : 'Disconnected';
  } catch {
    return 'Disconnected';
  }
}

module.exports = { getRedisHealth };
