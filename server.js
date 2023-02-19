const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('Uncaught Exception! Shutting Down ...');
    console.log(err.name, err.message);
});

const app = require('./app.js');

const db = process.env.DB;
mongoose.connect(db)
    .then((con) => {
        console.log('Db Connected');
    })
    .catch(err => {
        console.log('Mongoose Err', err.message);
    });

const port = process.env.PORT;
const server = app.listen(port || 3000, () => {
    console.log(`App stated on - 127.0.0.1:${port}`)
});

process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection! Shutting Down ...');
    console.log(err.name, err.message);
    // close the server
    server.close(() => {
        process.exit(1);
    });
});
