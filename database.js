const Sequelize = require('sequelize');
const dbConfig = require('./config.json').database;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: console.log,
});

////// Sessions, Users //////
// Sessions
const Session = sequelize.define('Session', {
    sid: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    data: Sequelize.TEXT,
    expires: Sequelize.DATE,
});

// User
const User = sequelize.define('User', {
    username: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false,
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    streamKey: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false
    },
    publicStreamKey: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false        
    },
    power: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
    }
});

////// Exports //////
module.exports = {
    db: sequelize,
    models: {
        Session,
        User,
    }
}