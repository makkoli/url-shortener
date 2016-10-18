var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var urlHelper = require('./urlhelper');
var app = express();
var urlEncode = "";

MongoClient.connect('mongodb://localhost:27017/url', function(err, db) {
    if (err) {
        console.log(err);
    }

    // Get the index file for homepage
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/*', function(req, res, next) {
        // Check if url is valid and encode it
        if (urlHelper.checkURL(req.params[0]) || urlHelper.checkRedirect(req.params[0])) {
            urlEncode = encodeURIComponent(req.params[0]);
            
            next();
        }
        // Otherwise, invalid url
        else {
            res.send({
                "Error": "Invalid URL format"
            });
        }
    });

    // Check and add a new url to the db
    app.get('/*', function(req, res) {
        res.status(200);
        res.set('Content-Type', 'text/plain');
        res.charset = 'utf-8';
        // Check if the url is a four digit redirect
        // and redirect if it is valid
        if (urlHelper.checkRedirect(urlEncode)) {
            db.collection('url').find({shortened: parseInt(urlEncode)}).toArray(function(err, docs) {
                if (err) {
                    console.log(err);
                }
                // Invalid redirect
                if (docs.length < 1) {
                    return res.send({ "Error": "Invalid redirect" });
                }

                // Redirect
                res.redirect(decodeURIComponent(docs[0].url));
            });
        }
        // Otherwise, insert into the db and return the shortened url
        else {
            var shortURL = urlHelper.shortenURL();
            // Check if url is in the database
            db.collection('url').find({url: urlEncode}).toArray(function(err, docs) {
                if (err) {
                    console.log(error);
                }
                // If the url is not in the db, insert it
                if (docs.length < 1) {
                    db.collection('url').insertOne(
                        { 'url': urlEncode, 'shortened': shortURL },
                        function(err, record) {
                            // Error inserting
                            if (err) {
                                console.log(err);
                            }
                            // Successfully inserted
                            res.send({
                                "original_url": decodeURIComponent(urlEncode),
                                "short_url": shortURL
                            });
                        }
                    )
                }
                // Else, return the url from the db
                else {
                    return res.send({
                        "original_url": decodeURIComponent(docs[0].url),
                        "short_url": docs[0].shortened
                    });
                }
            });
        }
    });

    var server = app.listen(8000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
