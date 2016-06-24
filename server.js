var path = require('path');
var express = require('express');
var api = require('./routes/api');
var app = express();

app.use(express.static(path.join(__dirname, 'client')));
app.use('/api', api);

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Server listening on port ' + server.address().port);
});



