require('dotenv').config();
const { createClient } = require("redis");
const RedisStore = require('connect-redis').default; // Importing the RedisStore correctly

// Create the Redis client
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Optionally, you can connect the client
(async () => {
    await redisClient.connect();
})();

// Set up the session configuration

const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'LockBoxPro_Vault:' // Custom prefix for session keys
});

const sessionConfig = {
    store: redisStore,
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production' // Ensure this matches your deployment environment
    }
};

module.exports = sessionConfig;
