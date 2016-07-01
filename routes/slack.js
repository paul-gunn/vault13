var express = require('express');
var request = require('request');
var Promise = require('bluebird');

var router = express.Router();
var slack = require('../slack/services.js');
var bodyParser = require('body-parser')

router.use( bodyParser.json() );       // to support JSON-encoded bodies

router.get("/clientId", function(req, res) {
    var clientId = slack.getClientId();
    res.json( {clientId : clientId});
});


router.post("/signin", function(req, res) {

    slack.authenticate(req.body.code, req.body.redirect)
    .then(function(creds) {
        res.json(creds);
    });
 
});

router.post("/sendMessage", function(req, res) {

    slack.sendMessage(req.body.token, req.body.channel, req.body.message)
    .then(function(resp) {
        res.json(resp);
    });
});

module.exports = router;

