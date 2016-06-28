var express = require('express');
var request = require('request');

var router = express.Router();
var forge = require('../forge/services.js');
var multer = require('multer')
var bodyParser = require('body-parser')
var uuid = require('node-uuid');

router.use( bodyParser() );       // to support JSON-encoded bodies

router.post("/signin", function(req, res) {

    forge.authenticate(true)
    .then(function(creds) {
        res.json(creds);
    });
 
});

router.post("/upload", multer().single('fileupload'), function(req, res) {

    var ext = req.headers['x-file-ext'];
    forge.upload(uuid.v1() + '.' + ext, req.file.buffer)
    .then(function(urn) {
       res.json({urn:urn});
    });
 
});

router.post("/register", function(req, res) {

    forge.register(req.body.urn)
    .then(function() {
       res.sendStatus(200);
    });
});

router.post("/relationships", function(req, res) {

    forge.createRelationships(req.body.relationships)
    .then(function(resp) {
       res.json(resp);
    });
});

router.get("/viewStatus", function(req, res) {

    forge.getViewStatus(req.query.urn)
    .then(function(resp) {
       res.json(resp);
    });
});

module.exports = router;

