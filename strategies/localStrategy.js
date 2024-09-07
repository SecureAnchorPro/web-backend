require("dotenv").config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mysqlconnection = require("../config/mysqlConfig");

module.exports = passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const [users] = await mysqlconnection.query(`
                SELECT * FROM Users WHERE email = ?
            `, [email]);

            if (!users || users.length === 0) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            
            const jwtToken = jwt.sign(
                { id: user.user_id },
                process.env.TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            return done(null, { jwtToken, id: user.user_id });
        } catch (err) {
            console.error('Error in JWT strategy:', err); // Debugging line
            return done(err);
        }
    }
));
