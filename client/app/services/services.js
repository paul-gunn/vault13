angular.module('vaultViewer.services', [])

.factory("VaultAPI", function() {
  return new VaultAPI();
})
.factory("ForgeAPI", function($http) {
  return new ForgeAPI($http);
})
.factory("Renderer", function(VaultAPI, ForgeAPI) {
  return new Renderer(VaultAPI, ForgeAPI);
})
.factory("ViewState", function() {
    var current_data = {}; 
    var defaults = { //  used as a generic property bag for maintaining state across view switches
      resetData: function() { 
        return current_data = angular.copy(defaults, current_data ); 
      }
    };

    defaults.resetData();
    return current_data;
})
.factory('Auth', function (VaultAPI, $location, ViewState, Renderer) {
  var signin = function (user) {
    return VaultAPI.signIn(user.username, user.password, user.vault.Name); 
  };

  var isAuth = function () {
    return VaultAPI.isAuth();
  };

  var signout = function () {
    ViewState.resetData();
    Renderer.resetData();
    VaultAPI.signOut();
    $location.path('/signin');
  };
  
  return {
    signin: signin,
    isAuth: isAuth,
    signout: signout,
  };
});
