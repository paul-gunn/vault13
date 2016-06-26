angular.module('vaultViewer.main', [])

.controller('MainController', function ($scope, $location, VaultAPI, ViewState, Renderer) {
    $scope.files = ViewState.searchFiles || [];
    $scope.searchText = ViewState.searchText ||"";

    $scope.doSearch = function() {
        VaultAPI.DocService.FindFilesBySearchConditions($scope.searchText)
        .then(function(files) {
            $scope.files = files;     
        });
    };

    $scope.doView = function(file) {
        var urn = Renderer.getRendering(file);
        if( urn) {
            $location.path('/view/' + urn);   
        } else {
           Renderer.renderFile(file); 
           $location.path('/render');   
         }
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
