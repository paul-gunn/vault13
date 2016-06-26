angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $routeParams, ForgeAPI, ViewState) {
    var viewerLocation = 'viewer';
    var urn = $routeParams.urn;
    if( !urn ) {
        urn = ViewState.lastViewedUrn;
    }

    if( urn ) {  // TODO: check for rendering exists?
        ForgeAPI.signinAndView(viewerLocation, urn)
    } 

    $scope.$on("$destroy", function(){
        ViewState.lastViewedUrn = urn;
    });    
});

