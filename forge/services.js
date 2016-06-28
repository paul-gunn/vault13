var credentials = require('./credentials')
var fs = require('fs');
var Promise = require('bluebird');
var _request = require('request');
var request = Promise.promisify(require('request'));
var streamifier = require('streamifier');

var baseUrl = credentials.url;
var version = 'v1';
var forgeUrls = {
	authenticationUrl: baseUrl + '/authentication/' + version + '/authenticate',
	ossUrl: baseUrl + '/oss/' + version + '/buckets',
    viewingUrl: baseUrl + '/viewingservice/'  + version,
    registerUrl: baseUrl + '/viewingservice/'  + version +  '/register',
    relationshipUrl: baseUrl + '/references/'  + version +  '/setreference'
};

var grantType = 'client_credentials';
var	scope = 'data:read data:write data:create data:search bucket:create bucket:read bucket:update';
var	scope_client = 'data:read';



var authenticate = function(isclient) {
    return request( {
        url: forgeUrls.authenticationUrl,
        method: 'POST',
        headers: {  ContentType: 'application/x-www-form-urlencoded'  },
        form: {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            grant_type: grantType,
            scope: isclient ? scope_client : scope
        }   
    })
    .then(function(resp) {     
      var creds = JSON.parse(resp.body);
      creds.url = credentials.url;
      return creds;
     });
};

var createBucket = function(token, bucketName) {
     return request( {
        url: forgeUrls.ossUrl,
        method: 'POST',
        headers: {  Authorization: 'Bearer ' + token  },
        json: {
                bucketKey: bucketName,
                policy: 'transient'
            }        
    })
    .then(function(resp) {     
        console.log("Create bucket: " + bucketName);
        console.log(resp.body);
        return bucketName; // may have already been created
    });
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

var doUploadFile = function(token, url, bytes) {
   return new Promise(function(resolve, reject) {
      streamifier.createReadStream(bytes).pipe(_request( {
        url: url,
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token  }      
    }, function(err, resp) {
        if(err) { reject(err); }
        else { resolve(resp); }
    }))
  });
};
var getUrnFromResponse = function(resp) {
    var body = JSON.parse(resp.body);
    var urn = body.objects[0].id;
    var urn64 = new Buffer(urn).toString('base64');
    console.log(body);
    console.log(urn + ' -- ' + urn64);
    return urn64;
};

var uploadFile = function(token, bucketName, filename, bytes) {

    filename = filename.replaceAll(' ', '_'); // viewer doesn't like spaces
    var url = forgeUrls.ossUrl + '/' + bucketName + '/objects/' + filename;

    return doUploadFile(token, url, bytes)
    .then(function(resp) {     
        return getUrnFromResponse(resp);
     });

};

var getFileStatus = function(token, bucketName, filename) {

    var url = forgeUrls.ossUrl + '/' + bucketName + '/objects/' + filename + '/details';

     return request( {
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
     })
};

var getViewingStatus = function(token, urn) {

    var url = forgeUrls.viewingUrl + '/' + urn + '/status';

     return request( {
        url: url,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
     })
    .then(function(resp) {
        console.log(resp.body);
        return resp.body;
    });
};

var registerFile = function(token, urn) {
   return request( {
        url: forgeUrls.registerUrl,
        method: 'POST',
        headers: {  Authorization: 'Bearer ' + token  },
        json: { urn: urn }        
    })
    .then(function(resp) {     
        console.log(resp.body);
    });
};

var createRelationships = function(token, dependencies) {
   return request( {
        url: forgeUrls.relationshipUrl,
        method: 'POST',
        headers: {  Authorization: 'Bearer ' + token  },
        json: dependencies        
    });
};
/////////////////////////////

module.exports = {
    authenticate: authenticate,
    uploadFile: uploadFile,
    registerFile: registerFile,
    getViewingStatus: getViewingStatus,
    createRelationships:createRelationships,
    createBucket: createBucket
}
