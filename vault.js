
//test
var api = new API();
var idents;
var allvaults;


api.IdentService.GetServerIdentities()
.then(function(identities) {
   idents = identities;  
   return api.FilestoreVaultService.GetAllKnowledgeVaults();
})
.then(function(vaults) {
   allvaults = vaults;
})
.then(function() {
    console.log(idents);
    console.log(allvaults);
})
.catch(function(err) {
   console.log(err.faultcode.text + '|' + err.faultstring.text);
});


