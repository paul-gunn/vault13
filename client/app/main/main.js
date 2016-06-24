angular.module('vaultly.main', [])

.controller('MainController', function ($scope, VaultAPI, ForgeAPI) {
    $scope.files = [];
    $scope.searchText = "";

    $scope.doSearch = function() {
        VaultAPI.DocService.FindFilesBySearchConditions($scope.searchText)
        .then(function(files) {
            $scope.files = files;     
        });
    };

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

}).directive('vaultFile', function () {
  return {
    template: "<li class='vaultfile' > \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='' ng-click='doView(file)'>View</a> \
    </li>"
  };
});
