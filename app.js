const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const helmet = require('helmet');
const userRouter = require('./routes/userRouter');
const ErrorHandler = require('./controllers/errorController')


// middleware stack
app.use(helmet());
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Routers
app.use('/api/v1/users', userRouter);

// testing
app.use('/api/test', (req, res, next) => {
    res.json('Helllo');
})
// Handle undefined routes
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

app.use(ErrorHandler);

module.exports = app;