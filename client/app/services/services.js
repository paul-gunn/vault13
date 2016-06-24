angular.module('vaultly.services', [])

.factory("VaultAPI", function() {
  return new VaultAPI();
})
.factory("ForgeAPI", function($http) {
  return new ForgeAPI($http);
})
.factory('Auth', function (VaultAPI, $location) {
  var signin = function (user) {
    return VaultAPI.signIn(user.username, user.password, user.vault.Name); 
  };

  var isAuth = function () {
    return VaultAPI.isAuth();
  };

  var signout = function () {
    VaultAPI.signOut();
    $location.path('/signin');
  };

  var getAllVaults = function() {
    return VaultAPI.FilestoreVaultService.GetAllKnowledgeVaults()
  }
  
  return {
    signin: signin,
    isAuth: isAuth,
    signout: signout,
    getAllVaults: getAllVaults
  };
});
