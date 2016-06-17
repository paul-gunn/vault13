
//test
var api = new VaultAPI();
var idents;
var allvaults;


 api.signIn("Administrator", "", "vault")
.then(function() {
    return api.DocService.GetFolderRoot();
})
.then(function(folder) {
    console.log(folder);

})
.catch(function(err) {
   console.log(err.faultcode.text + '|' + err.faultstring.text);
});


