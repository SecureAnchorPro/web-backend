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

passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const [user] = await mysqlconfig.query(`
            SELECT * FROM Users WHERE user_id = ?
        `, [jwt_payload.id]);

        if (user.length > 0) {
            return done(null, user[0]); // Return the user object
        } else {
            return done(null, false); // No user found
        }
    } catch (err) {
        return done(err, false); // Error occurred
    }
}));
