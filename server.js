var path = require('path');
var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, 'client')));

var forgeapi = require('./routes/api');
var slackapi = require('./routes/slack');

app.use('/api', forgeapi);
app.use('/slack', slackapi);

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Server listening on port ' + server.address().port);
});



