angular.module('vaultViewer.main', [])

.controller('MainController', function ($scope, $location, VaultAPI, ViewState) {
    $scope.files = ViewState.searchFiles || [];
    $scope.searchText = ViewState.searchText ||"";

    $scope.doSearch = function() {
        VaultAPI.DocService.FindFilesBySearchConditions($scope.searchText)
        .then(function(files) {
            $scope.files = files;     
        });
    };

    $scope.doView = function(file) {
        ViewState.viewFile = file; 
        $location.path('/viewer');   
    };    

    $scope.$on("$destroy", function(){
        ViewState.searchFiles = $scope.files;
        ViewState.searchText = $scope.searchText; 
    });

}).directive('vaultFile', function () {
  return {
    template: "<li class='vaultfile' > \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='' ng-click='doView(file)'>View</a> \
    </li>"
  };
});
