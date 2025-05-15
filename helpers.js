const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Quickly creates an error with a message and http status
function quickError(message, status) {
    const quickError = new Error(message);
    quickError.status = status;
    return quickError;          
}

// Generates a pretty random string
function randomString() {
    return uuidv4().replace(/-/g, '').toUpperCase() + uuidv4().replace(/-/g, '').toUpperCase();
}

// Deprecated, keeping just in case it's needed later
function getStreamFileName(username, userid) {
    return crypto.createHash('sha256').update(`${username}${userid}`).digest('hex');
}

module.exports = {
    quickError,
    randomString,
    getStreamFileName
}