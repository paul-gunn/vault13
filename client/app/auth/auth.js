
angular.module('vaultViewer.auth', [])

.controller('AuthController', function ($scope, $location, Auth, VaultAPI) {
  $scope.user = {};
  $scope.vaults = [];

  $scope.contactServer = function() {
      VaultAPI.setHostUri($scope.user.server)
      .then(function(identities) {
        // indicate success
        return loadVaults();
      })
      .catch(function(err) {
        console.log(err);
        $scope.vaults = [];
        // indicate error
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
