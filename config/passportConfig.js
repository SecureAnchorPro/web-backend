const mysqlconnection = require('./mysqlConfig');
const passport = require("passport");

module.exports = (app) => {

    // Initialize Passport.js middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Use the Local Strategy
    require('../strategies/localStrategy');

    // Use Jwt Strategy
    require('../strategies/jwtStrategy');

    // Add other strategies here as needed

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await mysqlconnection.query(`
                SELECT * FROM Users WHERE user_id = ?
            `, [id]);

            if (rows.length > 0) {
                done(null, rows[0]);
            }
            else {
                done(new Error("User not found"), null);
            }
        } catch (err) {
            done(err, null);
        }
    });
}
