const app = require('express')();
const config = require('./config.json');
const routes = require('./router');
const database = require('./database');
const { houseKeeper } = require('./housekeeper');
const appPort = config.server.port;
const houseKeeperInterval = config.server.houseKeeperInterval; // In seconds
const mod = 1000;

// Load routes
routes(app);

// Setup housekeeping
setInterval(houseKeeper, houseKeeperInterval * mod);
houseKeeper(); // Run once in the event of a complete server crash
// TODO: come up with some way for people to properly continue streams if the server goes down

// Server startup
const db = database.db;
db.sync().then(() => {

    // Handle 404s
    app.use((req, res, next) => {
        const notFoundError = new Error('Not Found');
        notFoundError.status = 404;  
        next(notFoundError);
    });

    // Handle other errors
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            error: {
                details: [{message: err.message || 'Internal Server Error'}]
            }
        });
    });

    // Start the backend server
    app.listen(appPort, () => {
        console.log(`Streaming backend running @ localhost:${appPort}`);
    });
});