const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function quickError(message, status) {
    const quickError = new Error(message);
    quickError.status = status;
    return quickError;          
}

function randomString() {
    return uuidv4().replace(/-/g, '').toUpperCase() + uuidv4().replace(/-/g, '').toUpperCase();
}

function getStreamFileName(username, userid) {
    return crypto.createHash('sha256').update(`${username}${userid}`).digest('hex');
}

module.exports = {
    quickError,
    randomString,
    getStreamFileName
}