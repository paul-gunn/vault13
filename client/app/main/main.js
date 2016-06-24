angular.module('vaultly.main', [])

.controller('MainController', function ($scope, VaultAPI) {
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
        .then(function(results) {
            console.log(atob(results));
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
