angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, $routeParams, $location, $http, $httpParamSerializer, ForgeAPI, ViewState, Slack) {
    var viewerLocation = 'viewer';
    $scope.slack = { message : "", channel : "" };

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
        $http.get('/slack/clientId')
        .then(function(resp) {
            var querystring = $httpParamSerializer({
                'client_id' : resp.data.clientId,
                'scope' : 'chat:write:user',
                'redirect_uri' : Slack.createSlackRedirect(urn, $scope.slack.message, $scope.slack.channel)
            });
        
         location.href = 'https://slack.com/oauth/authorize?' + querystring;
        });

    };
});

