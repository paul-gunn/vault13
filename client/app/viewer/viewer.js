angular.module('vaultViewer.viewer', [])

.controller('ViewerController', function ($scope, VaultAPI, ForgeAPI) {
  
      $scope.doView = function(file) {
        console.log(file);

        VaultAPI.DocService.GetDownloadTickets([file])
        .then(function(results) {
            console.log(results);
            return VaultAPI.FilestoreService.DownloadFile(file);
        })
        .then(function(base64data) {
            return ForgeAPI.uploadFile(base64data);
        })
        .then(function(results) {
            console.log(results);
         });

    };    

})