const statusConstants = require('../status');

const errorHandler = (err, req, res, next) => {
    const currentStatusCode = res.statusCode ? res.statusCode : statusConstants.INTERNAL_SERVER_ERROR;
    
    switch (currentStatusCode) {
        case statusConstants.NOT_FOUND:
            res.status(currentStatusCode).json({
                title: "NOT FOUND",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            break;

        case statusConstants.BAD_REQUEST:
            res.status(currentStatusCode).json({
                title: "VALIDATION FAILED",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            break;

        case statusConstants.UNAUTHORIZED:
            res.status(currentStatusCode).json({
                title: "UNAUTHORIZED",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            break;

        case statusConstants.FORBIDDEN:
            res.status(currentStatusCode).json({
                title: "FORBIDDEN",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            break;

        case statusConstants.INTERNAL_SERVER_ERROR:
            res.status(currentStatusCode).json({
                title: "SERVER ERROR",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            break;

        default:
            res.status(statusConstants.INTERNAL_SERVER_ERROR).json({
                title: "SERVER ERROR",
                message: err.message,
                stackTrace: err.stack,
                isCorrect: false
            });
            console.log("server error!");
            break;
    }
    next();
};

module.exports = errorHandler;
