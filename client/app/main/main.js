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

}).directive('vaultFile', function () {
  return {
    template: "<li class='vaultfile' > \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='#' ng-click='view(file)'>View</a> \
    </li>"
  };
});
