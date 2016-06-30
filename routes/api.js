var express = require('express');
var request = require('request');
var Promise = require('bluebird');

var router = express.Router();
var forge = require('../forge/services.js');
var multer = require('multer')
var bodyParser = require('body-parser')
var uuid = require('node-uuid');

router.use( bodyParser.json() );       // to support JSON-encoded bodies

// cached promises. 
var bucketname = 'grue2';
var serverAuth, clientAuth;;
function CacheCredentials() {
    serverAuth = forge.authenticate();
    clientAuth = forge.authenticate(true);
    return Promise.all( [serverAuth, clientAuth] )
    .then(function(resultArray) {
        var expiration = Math.min(resultArray[0].expires_in, resultArray[1].expires_in) - 60;  // renew 60s ahead
        setTimeout(CacheCredentials, expiration*1000); // convert from seconds to milliseconds
    });
}

CacheCredentials();
var bucket = serverAuth.then(function(creds) {
    return forge.createBucket(creds.access_token, bucketname);
});

router.post("/signin", function(req, res) {

    clientAuth.then(function(creds) {
        res.json(creds);
    });
 
});

router.post("/upload", multer().single('fileupload'), function(req, res) {
    var ext = req.headers['x-file-ext'];
    
    bucket.then( () => serverAuth ).then(function(creds) {
        return forge.uploadFile(creds.access_token, bucketname, uuid.v1() + '.' + ext, req.file.buffer)
    })
    .then(function(urn) {
       res.json({urn:urn});
    });
 
});

router.post("/register", function(req, res) {

    serverAuth.then(function(creds) {
        return forge.registerFile(creds.access_token, req.body.urn)
    })
    .then(function() {
       res.sendStatus(200);
    });
});

router.post("/relationships", function(req, res) {

    serverAuth.then(function(creds) {
        return forge.createRelationships(creds.access_token, req.body.relationships)
    })
    .then(function(resp) {
       res.json(resp);
    });
});

router.get("/viewStatus", function(req, res) {

    serverAuth.then(function(creds) {
        return forge.getViewingStatus(creds.access_token, req.query.urn)
    })
    .then(function(resp) {
       res.json(resp);
    });
});

module.exports = router;

