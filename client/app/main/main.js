angular.module('vaultViewer.main', [])

.controller('MainController', function ($scope, $location, VaultAPI, ViewState, Renderer) {
    $scope.files = ViewState.searchFiles || [];
    $scope.searchText = ViewState.searchText ||"";

    $scope.doSearch = function() {
        VaultAPI.DocService.FindFilesBySearchConditions($scope.searchText)
        .then(function(files) {
            $scope.files = files.map( file => _.defaults(file, { url: "./assets/default.jpg"  }));     
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
      <img class='thumbnail' src='{{file.url}}' />    \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='' ng-click='doView(file)'>View</a> \
    </li>"
  };
});
