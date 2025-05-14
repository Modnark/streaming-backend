const { v4: uuidv4 } = require('uuid');

function quickError(message, status) {
    const quickError = new Error(message);
    quickError.status = status;
    return quickError;          
}

function randomString() {
    return uuidv4().replace(/-/g, '').toUpperCase() + uuidv4().replace(/-/g, '').toUpperCase();
}

module.exports = {
    quickError,
    randomString
}