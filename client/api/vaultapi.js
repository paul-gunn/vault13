class VaultAPI {
    constructor(options) {
        this.IdentService = new IdentService();
        this.FilestoreVaultService = new FilestoreVaultService();
        this.FilestoreService = new FilestoreService();
        this.AuthService = new AuthService();
        this.DocService = new DocService();
        this.PropertyService = new PropertyService();
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
        return this._callAPI('GetAllKnowledgeVaults').then(_normalizeArrayResult);
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

class PropertyService extends ServiceBase {
    constructor() {
        super("PropertyService", 'v22/','Services/Property/2/3/2016/');
    };

    GetPropertyDef(entClass, sysName) {
      var data = { entityClassId: entClass};
      return this._callAPI('GetPropertyDefinitionsByEntityClassId', data).then(_normalizeArrayResult)
      .then(function(propDefs) {
          return _.find(propDefs, pd => pd.SysName === sysName);
      });
    };

    GetProperties(entClass, entIds, propdefIds) {
       var data =
        `<GetProperties xmlns="http://AutodeskDM/Services/Property/2/3/2016/"> \
        <entityClassId>${entClass}</entityClassId> \
        <entityIds>${_idArray(entIds)}</entityIds> \
        <propertyDefIds>${_idArray(propdefIds)}</propertyDefIds> \
        </GetProperties>`

       return this._callAPI('GetProperties', data).then(_normalizeArrayResult);
    }
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
        var data =
         `<GetDownloadTicketsByFileIds xmlns="http://AutodeskDM/Services/Document/2/3/2016/"> \
            <fileIds>${_idArray(files.map( file => file.Id ))}</fileIds> \
          </GetDownloadTicketsByFileIds>`
        return this._callAPI('GetDownloadTicketsByFileIds', data).then(_normalizeArrayResult)
        .then(function(tickets) {
            for(var i = 0; i < files.length; i++ ) {
                files[i].DownloadTicket = tickets[i].Bytes;
            }
            return files;
        });
    }

    GetFileDependencies(file) {
       var data = { fileMasterIds: { long: file.MasterId }, parentAssociationType: 'None', parentRecurse: false, childAssociationType: 'Dependency',
           childRecurse: true, includeRelatedDocuments: false, includeHidden: false, releasedBiased : false}
        return this._callAPI('GetLatestFileAssociationsByMasterIds', data)
        .then(function(results) {
            return _normalizeArrayResult(results.FileAssocArray.FileAssocs);
        })
    }
};

class FilestoreService extends ServiceBase {
    constructor() {
        super("FilestoreService", 'Filestore/v22/','Filestore/Filestore/2/3/2016/');
    };

    DownloadFile(file) {
       if( !file.DownloadTicket ) {
           throw new Error('must get download ticket before doing download');
       }
       
       var data = { downloadTicket: file.DownloadTicket, firstByte: 0, lastByte: file.FileSize, allowSync: true};
       return this._callAPI('DownloadFilePart', data);
    }
};

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

var _idArray = function(ids) {
  return ids.map( function(id) { return `<long>${id}</long>`;  }).join('');
};


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