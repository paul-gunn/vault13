var callVaultApi = function(serviceName, methodName, parameters, cb) {
	var baseUri = 'http://localhost/autodeskdm/Services/';
    var baseAction = 'http://AutodeskDM/Services/'
	$.soap({
		url: baseUri + serviceName + '.svc',
		SOAPAction: baseAction + serviceName + '/' + methodName,
		data: parameters || {},
	
		success: function (soapResponse) {
			
		console.log('success');
		var response = soapResponse.toJSON();
		var data = response.Body[methodName + 'Response'][methodName + 'Result'];
		cb(data);
		},
		error: function (SOAPResponse) {
		console.log('failure')
		}
	});
};

var products = callVaultApi('InformationService', 'GetSupportedProducts', {}, function(products) {
	console.log(products);
});
