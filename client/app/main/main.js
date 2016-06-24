angular.module('vaultly.main', [])

.controller('MainController', function ($scope, VaultAPI) {
    $scope.dollar = {} 

    VaultAPI.DocService.FindFilesBySearchConditions("test")
    .then(function(files) {
        $scope.files = files.File;     
    });
}).directive('vaultFile', function () {
  return {
    template: "<li class='vaultfile' > \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='#' ng-click='view(file)'>View</a> \
    </li>"
  };
});
