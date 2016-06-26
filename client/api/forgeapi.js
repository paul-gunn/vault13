class ForgeAPI {
    constructor($http) {
        this.$http = $http;
    };

    uploadFile(file, base64) {
        var ext = file.Name.split('.').pop()
        var data = new FormData();
        data.append('fileupload', _base64toBlob(base64));

        return this.$http({
                url: '/api/upload',
                method: 'POST',
                data: data,
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined, 'x-file-ext': ext }
             }).then(_extractData);
     };

    registerView(urn) {
        return this.$http.post('/api/register', { urn: urn } ).then(_extractData);
    };

    getViewStatus(urn) {
        return this.$http.get('/api/viewStatus', 
           { params: { urn: urn } } ).then(_extractData)
             .then(function(result) {
                return result ? JSON.parse(result) : {};
             });
    };

    signinAndView(viewLocation, urn) {
        return this.$http.post('/api/signin').then(_extractData)
        .then(function(authToken) {
            this.runViewer(viewLocation, authToken.access_token, 'urn:' + urn);
        }.bind(this));  
    };

    runViewer(viewLocation, token, urn) {
        var viewerApp;
        var options = {
            env: 'AutodeskDevelopment',
            accessToken: token
        };
        Autodesk.Viewing.Initializer(options, function onInitialized(){
            viewerApp = new Autodesk.A360ViewingApplication(viewLocation);
            viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
            viewerApp.loadDocumentWithItemAndObject(urn);
        });
    };    
};


var _extractData = function(response) {
console.log(response);
return response.data;
};

var _base64toBlob = function(base64Data) {
    var sliceSize = 1024;
var byteCharacters = atob(base64Data);
var bytesLength = byteCharacters.length;
var slicesCount = Math.ceil(bytesLength / sliceSize);
var byteArrays = new Array(slicesCount);

for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize;
    var end = Math.min(begin + sliceSize, bytesLength);

    var bytes = new Array(end - begin);
    for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
}
return new Blob(byteArrays);
}
