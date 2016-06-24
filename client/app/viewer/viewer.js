angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $timeout, VaultAPI, ForgeAPI, ViewState) {
  
    console.log(ViewState.viewFile)

    var transferFile = function(file) {
        return VaultAPI.DocService.GetDownloadTickets([file])
        .then(function(results) {
            console.log(results);
            return VaultAPI.FilestoreService.DownloadFile(file);
        })
        .then(function(base64data) {
            return ForgeAPI.uploadFile(file, base64data);
        })
        .then(function(result) {
            return result.urn;
        });
    };

    var awaitRender = function(urn) {
        return ForgeAPI.getViewStatus(urn)
        .then( function(result) {
            console.log('awaiting render')
            console.log(result.progress);
            if(result.progress && result.progress !== 'complete' ) {
                return $timeout(awaitRender.bind(this, urn), 1000);
            } else {
                return urn;    
            }
        });
    };

    var renderView = function(urn) {
        return ForgeAPI.registerView(urn)
        .then(function(result) { 
            return awaitRender(urn);
        });
    };

    var doView = function(file) {
        return transferFile(file)
        .then(function(urn) {
            return renderView(urn);
        })
        .then(function(urn) {
            return ForgeAPI.signinAndView('viewer', urn)
        })
    };

    // TODO: cache rendered view urns in viewstate
    if( ViewState.viewFile ) {
        doView(ViewState.viewFile);
    }
});

