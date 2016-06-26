angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $routeParams, $location, ForgeAPI, ViewState) {
    var viewerLocation = 'viewer';
    var urn = $routeParams.urn;
    if( !urn ) {
        urn = ViewState.lastViewedUrn;
    }

    if( urn ) {  // TODO: check for rendering exists?
        ForgeAPI.signinAndView(viewerLocation, urn)
    } else {
        $location.path('/main');   
    }

    $scope.$on("$destroy", function(){
        ViewState.lastViewedUrn = urn;
    });    
});

