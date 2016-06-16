class API {
    constructor(options) {
        this.IdentService = new IdentService();
    }
};

class IdentService {
    constructor(options) {
        this._serviceName = "IdentificationService";
        this._uriPath = 'Filestore/v22/';
        this._actionPath = 'Filestore/Identification/2/3/2016/';
    }

    _callAPI(methodName, data, cb) {
        _soap(this._uriPath, this._actionPath, this._serviceName, methodName, data, cb);
    };

    GetServerIdentities(cb) {
        this._callAPI('GetServerIdentities', {}, cb);	
    }
};


var _soap = function(uriPath, actionPath, serviceName, methodName, parameters, cb) {
    var baseUri = 'http://localhost/autodeskdm/Services/';
    var baseAction = 'http://AutodeskDM/'
    $.soap({
        url:        baseUri    + uriPath    + serviceName + '.svc',
        SOAPAction: baseAction + actionPath + serviceName + '/' + methodName,
        data: parameters || {},
    
        success: function (soapResponse) {
            console.log(methodName + ' success');
            var response = soapResponse.toJSON();
            var data = response.Body[methodName + 'Response'][methodName + 'Result']; // unwrap [body, resp, res] to return data
            cb(null, data);
        },
        error: function (soapResponse) {
            console.log(methodName + ' failure');
            var response = soapResponse.toJSON();
            var err = response.Body.Fault; // unwrap [body, fault] to return soap fault
            cb(err, null);
       }
    });
};

//test
var api = new API();
api.IdentService.GetServerIdentities(function(err, idents) {
    if( err ) {
        console.log(err.faultcode.text + '|' + err.faultstring.text);
    } else {
        console.log(idents); 
    }
})


