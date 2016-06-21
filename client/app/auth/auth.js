
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
        $scope.$apply()   // force location above to be used (???)     
      })
      .catch(function (error) {
        console.error(error);
      });
  };


});
