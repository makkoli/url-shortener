var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = require('./urlhelper');
var app = express();

MongoClient.connect('mongodb://localhost:27017/url', function(err, db) {
    if (err) {
        console.log(err);
    }

    // Get the index file for homepage
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    app.param('url', function(req, res, next, id) {

        next();
    });

    // Check and add a new url to the db
    app.get('/:url', function(req, res) {
        res.status(200);
        res.set('Content-Type', 'text/plain');
        res.charset = 'utf-8';
        // Check if the url is a four digit redirect
        // and redirect if it is valid
        if (url.checkRedirect(req.params.url)) {
            db.collection('url').find({shortened: parseInt(req.params.url)}).toArray(function(err, docs) {
                if (err) {
                    console.log(err);
                }
                // Invalid redirect
                if (docs.length < 1) {
                    return res.send({ "Error": "Invalid redirect" });
                }

                // Redirect
                res.redirect('https://' + docs[0].url);
            });
        }
        // Otherwise, check if the url is valid and insert into the db
        else if (url.checkURL(req.params.url)) {
            var shortURL = url.shortenURL();
            // Check if url is in the database
            db.collection('url').find({url: req.params.url}).toArray(function(err, docs) {
                if (err) {
                    console.log(error);
                }
                // If the url is not in the db, insert it
                if (docs.length < 1) {
                    db.collection('url').insertOne(
                        { 'url': req.params.url, 'shortened': shortURL },
                        function(err, record) {
                            // Error inserting
                            if (err) {
                                console.log(err);
                            }
                            // Successfully inserted
                            res.send({
                                "original_url": req.params.url,
                                "short_url": shortURL
                            });
                        }
                    )
                }
                // Else, return the url from the db
                else {
                    return res.send({
                        "original_url": docs[0].url,
                        "short_url": docs[0].shortened
                    });
                }
            });
        }
        // Otherwise, invalid redirect or url
        else {
            res.send({
                "Error": "Invalid URL format"
            });
        }
    });

    var server = app.listen(8000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
