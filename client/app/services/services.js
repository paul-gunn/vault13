angular.module('vaultViewer.services', [])

.factory("VaultAPI", function() {
  return new VaultAPI();
})
.factory("ForgeAPI", function($http) {
  return new ForgeAPI($http);
})
.factory("ViewState", function() {
    var current_data = {}; 
    var defaults = {
      // also used as a generic property bag for maintaining state across view switches
      
      renderedFiles : {},

      setRenderedFile : function(file, urn) {
        this.renderedFiles[file.Id] = urn;
      },
      
      getRenderedFile(file) {
        return this.renderedFiles[file.Id] || null;
      },

      resetData: function() { 
        return current_data = angular.copy(defaults, current_data ); 
      }
    };

    defaults.resetData();
    return current_data;
})
.factory('Auth', function (VaultAPI, $location, ViewState) {
  var signin = function (user) {
    return VaultAPI.signIn(user.username, user.password, user.vault.Name); 
  };

  var isAuth = function () {
    return VaultAPI.isAuth();
  };

  var signout = function () {
    ViewState.resetData();
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
