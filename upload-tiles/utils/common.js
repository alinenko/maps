function log(message) {
    console.log(`[${(new Date()).toJSON()}] ${message}`);
}

function error(message) {
    console.error(`[${(new Date()).toJSON()}] ${message}`);
}

module.exports = {
    log,
    error
};
