var exports = module.exports = {};

// Checks if the url is in the correct format
// Return true if it is; false otherwise
// @url: url to check
exports.checkURL = function(url) {
    var urlRE = /(https?:\/\/)?(www\.)?[\-A-Za-z0-9]+(:\d+)?(\.[A-Za-z\.]{2,})/;
    // Test for valid url
    if (urlRE.test(url) && url.length <= 64) {
        return true;
    }

    return false;
};

// Checks if the url is a 1-4 digit url redirect
// Return true if it is a redirect; false otherwise
// @url: url to check
exports.checkRedirect = function(url) {
    return /\b\d{1,4}\b/.test(url);
};

// Returns a short 4 digit version of a url
exports.shortenURL = function() {
    return Math.floor(Math.random() * 10000);
};

// Returns a url with http in front of it
exports.addHTTP = function(url) {
    if (/(https?:\/\/)/.test(url)) {
        return url;
    }
    return 'http://' + url;
};
