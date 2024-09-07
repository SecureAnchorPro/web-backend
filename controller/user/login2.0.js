const asyncHandler = require("express-async-handler");
const passport = require("passport");

const UserLogin2 = asyncHandler((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Pass any errors to the error handler middleware
        }

        if (!user) {
            res.status(401);
            return res.json({ message: info.message || "Authentication failed" });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                return next(err); // Handle any errors during login
            }

            const { jwtToken } = user; // Extract the JWT token from the user object

            res.status(200).json({
                message: "User logged in successfully",
                token: jwtToken
            });
        });
    })(req, res, next);
});

// const currentUser = asyncHandler(async (req, res) => {
//     res.status(200).json(req.user); // Return the current user's data
// });

// module.exports = { UserLogin2, currentUser };
module.exports = UserLogin2 ;