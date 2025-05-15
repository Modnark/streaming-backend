const express = require('express');
const app = express();
const config = require('./config.json');
const routes = require('./router');
const database = require('./database');
const { houseKeeper } = require('./housekeeper');
const houseKeeperInterval = 60; // In seconds
const mod = 1000;

const appPort = config.server.port;

// Load routes
routes(app);

// Setup housekeeping
setInterval(houseKeeper, houseKeeperInterval * mod);

// Server startup
const db = database.db;
db.sync().then(() => {
    app.use((req, res, next) => {
        const notFoundError = new Error('Not Found');
        notFoundError.status = 404;  
        next(notFoundError);
    });

    // TODO: Make a real error page
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            error: {
                details: [{message: err.message || 'Internal Server Error'}]
            }
        });
    });

    app.listen(appPort, () => {
        console.log(`Streaming backend running @ localhost:${appPort}`);
    });
});