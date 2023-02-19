const AppError = require('../utils/appError');

const handleDuplicateFieldsDB = err => {
    const dupField = Object.keys(err.keyPattern ? err.keyPattern : err.keyValue)[0];
    const message = `Duplicate field value for ${dupField}. Please use another value!`;
    return new AppError(message, 400);
};

const handleJWTError = err => new AppError('Invalid token. Please log in again.', 401);

const handleTokenExpiredError = err => new AppError('Your token is expired. Please log in again.', 401);

const handleValidationErrorDB = err => {
    const errKeys = Object.keys(err.errors)
    return new AppError(Object.values(err.errors).map((el, i) => `${errKeys[i]} : ${el.message}`).join(','), 400)
};

module.exports = (err, req, res, next) => {
    // if starts with 5 then error otherwise fail
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // hard copy
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // duplicate entry
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, res);

    // Validation errors - stringify
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error, res);

    // Jwt
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);

    // if none from above

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}