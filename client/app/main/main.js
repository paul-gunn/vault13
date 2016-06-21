angular.module('vaultly.main', [])

.controller('MainController', function ($scope, VaultAPI) {
    $scope.dollar = {} 

    VaultAPI.DocService.GetFolderRoot()
    .then(function(folder) {
        $scope.dollar = folder;     
    });
});
