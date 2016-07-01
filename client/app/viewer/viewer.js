angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $routeParams, $location, $httpParamSerializer, ForgeAPI, ViewState, Slack) {
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

    $scope.slackRedirect = function() {
         var querystring = $httpParamSerializer({
            'client_id' : '2778138625.56134296180',
            'scope' : 'chat:write:user',
            'redirect_uri' : Slack.createSlackRedirect(urn)
       });
 
        location.href = 'https://slack.com/oauth/authorize?' + querystring;
      };
});

