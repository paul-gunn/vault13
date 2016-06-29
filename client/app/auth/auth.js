
angular.module('vaultViewer.auth', [])

.controller('AuthController', function ($scope, $location, Auth, VaultAPI) {
  $scope.user = {};
  $scope.vaults = [];
 $scope.connectionstatus = 'connection-none'

  $scope.contactServer = function() {
      if(!$scope.user.server) {
        return;
      }
      
      $scope.connectionstatus = 'connection-testing'
      VaultAPI.setHostUri($scope.user.server)
      .then(function(identities) {
        $scope.connectionstatus = 'connection-ok'
        return loadVaults();
      })
      .catch(function(err) {
        $scope.connectionstatus = 'connection-error'
        $scope.vaults = [];
      });

   };

  $scope.signin = function () {
    Auth.signin($scope.user)
      .then(function () {
        $location.path('/main');   
      })
      .catch(function (error) {
        console.error(error);
      });
  };
 
  var loadVaults = function() {
    return VaultAPI.FilestoreVaultService.GetAllKnowledgeVaults()
      .then(function(vaults) {
          $scope.vaults = vaults;
          if( vaults.length ) {
            $scope.user.vault = vaults[0];
          }
      }); 
  }

});
