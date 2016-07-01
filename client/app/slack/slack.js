angular.module('vaultViewer.slack', [])

.controller('SlackController', function ($scope, $location, $http, Slack) {
    var queryParams = $location.search();
    if( !queryParams.code || !queryParams.urn ) { 
        $location.path = "/view";  // insufficient data to post to slack
    }

    $scope.message = "";
    $scope.viewurl = window.location.origin + '/#/view/' +  queryParams.urn;

    
    $http.post('/slack/signin', { code: queryParams.code, redirect: Slack.createSlackRedirect(queryParams.urn) } )
    .then(function(creds) {
        return $http.post('/slack/sendMessage', { token: creds.data.access_token, channel:  '#vault-grey', 
        message: "this is a test: " + $scope.viewurl } )
    }).then(function(resp) {
        $scope.message = JSON.parse(resp.data.body).message.text;
    });


});

