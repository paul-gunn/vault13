angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $routeParams, $location, ForgeAPI, ViewState) {
    var viewerLocation = 'viewer';
    var urn = $routeParams.urn;
    if( !urn ) {
        if( ViewState.lastViewedUrn ) {
           $location.path('/view/' + ViewState.lastViewedUrn);   
        } else {
           $location.path('/main');   
        }
    }

    ForgeAPI.signinAndView(viewerLocation, urn) // TODO: check for rendering still exists?
    
    $scope.$on("$destroy", function(){
        ViewState.lastViewedUrn = urn;
    });    
});

