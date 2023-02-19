// error parent class is provided already
class AppError extends Error {
    constructor(errMsg, statusCode) {
        super(errMsg);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor)
    }
}
module.exports = AppError;