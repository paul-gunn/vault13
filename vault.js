
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
   return api.AuthService.SignIn(idents.DataServer, "Administrator", "", allvaults[1].Name);
})
.then(function(securityHeader) {
    console.log(idents);
    console.log(allvaults);
    console.log(securityHeader)
})
.catch(function(err) {
   console.log(err.faultcode.text + '|' + err.faultstring.text);
});


