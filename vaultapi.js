class API {
    constructor(options) {
        this.IdentService = new IdentService();
        this.FilestoreVaultService = new FilestoreVaultService();
        this.AuthService = new AuthService();
    }
};

class ServiceBase {
    constructor(serviceName, uriPath, actionPath) {
        this._serviceName = serviceName;
        this._uriPath = uriPath;
        this._actionPath = actionPath;
    };

    _callAPI(methodName, data, unwrapResponse = true) {
        data = data || {}

        return new Promise(function(resolve, reject) {
            _soap(this._uriPath, this._actionPath, this._serviceName, methodName, data, unwrapResponse, function(err, result) {
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

    GetAllKnowledgeVaults() {
        return this._callAPI('GetAllKnowledgeVaults')
        .then(function(vaults) {
            return vaults.KnowledgeVault;  // unwrap  
      });	
    }
};

class AuthService extends ServiceBase {
    constructor() {
        super("AuthService", 'Filestore/v22/','Filestore/Auth/2/3/2016/');
    }

    SignIn(dataServer, userName, userPassword, knowledgeVault) {
        var data = { dataServer: dataServer, userName: userName, userPassword: userPassword, knowledgeVault: knowledgeVault}
        return this._callAPI('SignIn', data, false) // don't unwrap response
        .then(function(soapResponse) {
            return soapResponse.Header.SecurityHeader;
      });	
    }
};

// <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
//  <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
//   <SignIn xmlns="http://AutodeskDM/Filestore/Auth/2/3/2016/">
//    <dataServer>http://site1/</dataServer><userName>administrator</userName><userPassword/><knowledgeVault>Vault</knowledgeVault></SignIn>
// </s:Body>
// </s:Envelope>



var _soap = function(uriPath, actionPath, serviceName, methodName, parameters, unwrapResponse, cb) {
    var baseUri = 'http://localhost/autodeskdm/Services/';
    var baseAction = 'http://AutodeskDM/'
    $.soap({
        url:        baseUri    + uriPath    + serviceName + '.svc',
        SOAPAction: baseAction + actionPath + serviceName + '/' + methodName,
        data: parameters || {},
        appendMethodToURL: false,
        method: methodName,
        namespaceURL: baseAction + actionPath,

        success: function (soapResponse) {
            console.log(methodName + ' success');
            var response = soapResponse.toJSON();
            if (unwrapResponse) {
               response = response.Body[methodName + 'Response'][methodName + 'Result']; // unwrap [body, resp, res] to return data
            }
            cb(null, response);
        },
        error: function (soapResponse) {
            console.log(methodName + ' failure');
            var response = soapResponse.toJSON();
            var err = response.Body.Fault; // unwrap [body, fault] to return soap fault
            cb(err, null);
       }
    });
};