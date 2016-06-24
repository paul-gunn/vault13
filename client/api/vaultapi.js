class VaultAPI {
    constructor(options) {
        this.IdentService = new IdentService();
        this.FilestoreVaultService = new FilestoreVaultService();
        this.AuthService = new AuthService();
        this.DocService = new DocService();
    };

    signIn(userName, password, vaultName) {
        return this.IdentService.GetServerIdentities()
        .then(function(identities) {
          return this.AuthService.SignIn(identities.DataServer, userName, password, vaultName);
        }.bind(this))
        .then(function(securityHeader) {
            for( var service in this ) {
                this[service]._securityHeader = securityHeader;
            }
        }.bind(this));
    };

    signOut() { //TODO: real signout call
        for( var service in this ) {
            delete this[service]._securityHeader;
        }

    };

    isAuth() {
        return !!this.AuthService._securityHeader;
    };
};

class ServiceBase {
    constructor(serviceName, uriPath, actionPath) {
        this._serviceName = serviceName;
        this._uriPath = uriPath;
        this._actionPath = actionPath;
    };

    _callAPI(methodName, data, unwrapResponse = true) {
        data = data || {}
        var soapHeader = this._securityHeader ? {SecurityHeader:this._securityHeader} : null;

        return new Promise(function(resolve, reject) {
            _soap(this._uriPath, this._actionPath, this._serviceName, 
                methodName, data, soapHeader, unwrapResponse, function(err, result) {
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
    };

    GetServerIdentities() {
        return this._callAPI('GetServerIdentities');	
    };
};

class FilestoreVaultService extends ServiceBase {
    constructor() {
        super("FilestoreVaultService", 'Filestore/v22/','Filestore/FilestoreVault/2/3/2016/');
    };

    GetAllKnowledgeVaults() {
        return this._callAPI('GetAllKnowledgeVaults')
        .then(function(vaults) {
            return vaults.KnowledgeVault;  // unwrap  
      });	
    };
};

class AuthService extends ServiceBase {
    constructor() {
        super("AuthService", 'Filestore/v22/','Filestore/Auth/2/3/2016/');
    };

    SignIn(dataServer, userName, userPassword, knowledgeVault) {
        var data = { dataServer: dataServer, userName: userName, userPassword: userPassword, knowledgeVault: knowledgeVault}
        return this._callAPI('SignIn', data, false) // don't unwrap response
        .then(function(soapResponse) {
            return soapResponse.Header.SecurityHeader;
      });	
    };
};

class DocService extends ServiceBase {
    constructor() {
        super("DocumentService", 'v22/','Services/Document/2/3/2016/');
    };

    GetFolderRoot() {
        return this._callAPI('GetFolderRoot');
    };

    FindFilesBySearchConditions(searchText) {  // assumes we are just searching all properties
        var data =
         `<FindFilesBySearchConditions xmlns="http://AutodeskDM/Services/Document/2/3/2016/"> \
            <conditions><SrchCond PropDefId="0" SrchOper="1" SrchTxt="${searchText}" PropTyp="AllProperties" SrchRule="Must"/></conditions> \
            <latestOnly>true</latestOnly> \
          </FindFilesBySearchConditions>`
        return this._callAPI('FindFilesBySearchConditions', data).then(_normalizeArrayResult);
    };

    GetDownloadTickets(files) {
        var ids = files.map( function(file) {
          return `<long>${file.Id}</long>`;
        }).join('');
        
        var data =
         `<GetDownloadTicketsByFileIds xmlns="http://AutodeskDM/Services/Document/2/3/2016/"> \
            <fileIds>${ids}</fileIds> \
          </GetDownloadTicketsByFileIds>`
        return this._callAPI('GetDownloadTicketsByFileIds', data).then(_normalizeArrayResult);
    }
};

class FilestoreService extends ServiceBase {
    constructor() {
        super("FilestoreService", 'Filestore/v22/','Filestore/Filestore/2/3/2016/');
    };

    // GetAllKnowledgeVaults() {
    //     return this._callAPI('GetAllKnowledgeVaults')
    //     .then(function(vaults) {
    //         return vaults.KnowledgeVault;  // unwrap  
    //   });	
    // };
};


//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
 //<s:Header><CompressionHeader xmlns="http://AutodeskDM/Filestore/Filestore/2/3/2016/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 //<Supported>None</Supported></CompressionHeader></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
   //<DownloadFilePart xmlns="http://AutodeskDM/Filestore/Filestore/2/3/2016/">
     //<downloadTicket>SvcAWDxwn9Io+aL3T+YTzmfJnstDwshY7kwyI8QMol0MW3qnCz9iJie50yrnGCY+/X/kKp06gj6cm3a06uIk4OvYsmTdsLIxeJLwfF3I6RPJqzLNijliK4mtXM3H/15ww2WuP5xyk3LXAUsYHR4NfvC8OR3XRlmxv+Su3kM8dA4TQ7r+1641W2WwyTIj2MMt3QeUBPw8U6V77Ixll6tie/5Y2PNpb5m6NHAH89lzlWU6paKRoqx1jPw8/8phHwz6G72pcYtbt7cv9Oeh/b+9jESOQE7I3cuX5fymnMg0+BhpV7i1O8OcWTWmkT7P3w+6SXPTe4DMcziE9IV8Yaef4IvClZ6rz3o67/SYlm6/M/W40UhvxhY2NsV8Dcc86399KYuP61RToAPLtpNSLbgh30CnpJCte4vYM/y2SASBnRI4CMkGiaGqBBlTbU5zLlzYdFR+hTkkfhKOW/hVmLKV6z8dZynXh5KiVw2N+Ex94r0=</downloadTicket>
   //  <firstByte>0</firstByte><lastByte>52418559</lastByte><allowSync>true</allowSync></DownloadFilePart>


//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><SecurityHeader xmlns="http://AutodeskDM/Services" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  //<Ticket>85c079bc-b8aa-464d-b2e8-0450b07475c0</Ticket><UserId>2</UserId></SecurityHeader></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  //<FindFilesBySearchConditions xmlns="http://AutodeskDM/Services/Document/2/3/2016/">
    //<conditions><SrchCond PropDefId="0" SrchOper="1" SrchTxt="test" PropTyp="AllProperties" SrchRule="Must"/><SrchCond PropDefId="19" SrchOper="10" SrchTxt="1" PropTyp="SingleProperty" SrchRule="Must"/></conditions><sortConditions>
    //<SrchSort PropDefId="13" SortAsc="false"/></sortConditions>
    //<folderIds/>
    //<recurseFolders>true</recurseFolders>
    //<latestOnly>true</latestOnly>
    //<bookmark/>
 //</FindFilesBySearchConditions>
//</s:Body></s:Envelope>


// <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
//  <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
//   <SignIn xmlns="http://AutodeskDM/Filestore/Auth/2/3/2016/">
//    <dataServer>http://site1/</dataServer><userName>administrator</userName><userPassword/><knowledgeVault>Vault</knowledgeVault></SignIn>
// </s:Body>
// </s:Envelope>

var _normalizeArrayResult = function(result) {
    if( result == null ) {
        return [];
    }
    
    if( Object.keys(result).length !== 1) {
        throw Error('unexpected data');
    }

    var key = Object.keys(result)[0];
    
    if (Array.isArray(result[key])) {
        return result[key];
    } else {
        return [result[key]];
    }
}

var _soap = function(uriPath, actionPath, serviceName, methodName, parameters, soapHeader, unwrapResponse, cb) {
    var baseUri = 'http://localhost/autodeskdm/Services/';
    var baseAction = 'http://AutodeskDM/'
    $.soap({
        url:        baseUri    + uriPath    + serviceName + '.svc',
        SOAPAction: baseAction + actionPath + serviceName + '/' + methodName,
        data: parameters || {},
        appendMethodToURL: false,
        method: methodName,
        namespaceURL: baseAction + actionPath,
        SOAPHeader: soapHeader,

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