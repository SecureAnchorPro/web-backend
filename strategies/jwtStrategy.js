require('dotenv').config();
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mysqlconfig = require('../config/mysqlConfig');
const sessionConfig = require('../config/sessionConfig');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
    // issuer: '',   // Uncomment and set if required
    // audience: '', // Uncomment and set if required
};

// Get the Redis client from sessionConfig
const redisClient = sessionConfig.store.client;

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {

        const userKey = `LockBoxPro_Vault:${jwt_payload.id}`;

        // Await the result from Redis
        const userExistsInSession = await redisClient.get(userKey);
        if (userExistsInSession) {
            // Parse the user data from Redis
            const user = JSON.parse(userExistsInSession);
            return done(null, user);
        } else {

            // Query MySQL for user data
            const [user] = await mysqlconfig.query(`
                SELECT * FROM Users WHERE user_id = ?
            `, [jwt_payload.id]);

            if (user.length > 0) {
                // Store the user data in Redis for future requests
                await redisClient.set(userKey, JSON.stringify(user[0].user_id));
                return done(null, user[0].user_id); // Return the user object
            } else {
                return done(null, false); // No user found
            }
        }
    } catch (err) {
        return done(err, false); // Error occurred
    }
}));
