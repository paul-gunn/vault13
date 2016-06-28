angular.module('vaultViewer.main', [])

.controller('MainController', function ($scope, $location, VaultAPI, ViewState, Renderer) {
    $scope.files = ViewState.searchFiles || [];
    $scope.searchText = ViewState.searchText ||"";

    var loadThumbnails = function() {
        thumbnailDef.then(function(def) {
            return VaultAPI.PropertyService.GetProperties('FILE', $scope.files.map( file => file.Id), [def.Id])
        })
        .then(function(props) {
            var dictionary = _thumbnailDictionary(props);
            _.each( $scope.files, function(file) {
                if( dictionary[file.Id] ) {
                    file.url = 'data:image/gif;base64,' + dictionary[file.Id];
                }
            });
        });
    }

    $scope.doSearch = function() {
        VaultAPI.DocService.FindFilesBySearchConditions($scope.searchText)
        .then(function(files) {
            $scope.files = files.map( file => _.defaults(file, { url: "./assets/default.jpg"  }));     
            loadThumbnails();
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

    var thumbnailDef = VaultAPI.PropertyService.GetPropertyDef('FILE', 'Thumbnail')

}).directive('vaultFile', function () {
  return {
    template: "<li class='vaultfile' > \
      <img class='thumbnail' src='{{file.url}}' />    \
      <span class='filename' >{{file.Name}}</span> \
      <a class='fileview' href='' ng-click='doView(file)'>View</a> \
    </li>"
  };
});

var _thumbnailDictionary = function(props) {
    var result = {};

    _.each(props, function(current) {
        result[current.EntityId] = current.Val;
    })

    return result;
}