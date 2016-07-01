var optional = require("optional");
var credentials = optional('./slack/credentials')

credentials = credentials || 
{
	clientId: process.env.SLACK_KEY,
	clientSecret: process.env.SLACK_SECRET,
}

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));



var authenticate = function(code, redirect) {
    return request( {
        url: 'https://slack.com/api/oauth.access',
        method: 'POST',
        headers: {  ContentType: 'application/x-www-form-urlencoded'  },
        form: {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            code: code,
            redirect_uri: redirect
        }   
    })
    .then(function(resp) {     
      return JSON.parse(resp.body);
     });
};


var sendMessage = function(token, channel, message) {
   return request( {
        url: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        headers: {  ContentType: 'application/x-www-form-urlencoded'  },
        form: {
            token: token,
            channel: channel,
            text: message
        }   
    });
};


module.exports = {
    authenticate: authenticate,
    sendMessage: sendMessage
}
