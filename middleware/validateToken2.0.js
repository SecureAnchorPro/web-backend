const asyncHandler = require('express-async-handler');
const passport = require('passport');
const validateToken2 = asyncHandler((req,res,next)=>{
    passport.authenticate('jwt',(err,user,info)=>{
        if (!user) {
            res.status(401);
            return next(new Error(info.message || "Authentication failed"));
        }

        if(err) return next(err);

        req.user = user; // Attach the authenticated user to the request object
        next(); // Proceed to the next middleware or route handler
    })(req,res,next);
})

module.exports = validateToken2;