
angular.module('vaultly.auth', [])

.controller('AuthController', function (vaults, $scope, $location, Auth, VaultAPI) {
  $scope.user = {};
  $scope.vaults = vaults;
  if( vaults.length ) {
    $scope.user.vault = vaults[0];
  }
  

  $scope.signin = function () {
    Auth.signin($scope.user)
      .then(function () {
        $location.path('/main');   
      })
      .catch(function (error) {
        console.error(error);
      });
  };


});
