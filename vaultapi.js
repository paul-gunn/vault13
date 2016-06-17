class API {
    constructor(options) {
        this.IdentService = new IdentService();
        this.FilestoreVaultService = new FilestoreVaultService();
    }
};

class ServiceBase {
    constructor(serviceName, uriPath, actionPath) {
        this._serviceName = serviceName;
        this._uriPath = uriPath;
        this._actionPath = actionPath;
    };

    _callAPI(methodName, data) {
        data = data || {}

        return new Promise(function(resolve, reject) {
            _soap(this._uriPath, this._actionPath, this._serviceName, methodName, data, function(err, result) {
                if( !err ) { 
                    resolve(result);
                } else { 
                    reject(err);
                }
            });
        }.bind(this));
    };

};

class IdentService extends ServiceBase {
    constructor() {
        super("IdentificationService", 'Filestore/v22/', 'Filestore/Identification/2/3/2016/');
    }

    GetServerIdentities() {
        return this._callAPI('GetServerIdentities');	
    }
};

class FilestoreVaultService extends ServiceBase {
    constructor() {
        super("FilestoreVaultService", 'Filestore/v22/','Filestore/FilestoreVault/2/3/2016/');
    }

    GetAllKnowledgeVaults(cb) {
        return this._callAPI('GetAllKnowledgeVaults')
        .then(function(vaults) {
            return vaults.KnowledgeVault;  // unwrap  
      });	
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