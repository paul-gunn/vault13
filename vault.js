var getSupportedProducts = function() {

	$.soap({
		url: 'https://localhost/autodeskdm/services/informationservice.svc',
		SOAPAction: "http://AutodeskDM/Services/InformationService/GetSupportedProducts",
		data: {},
	
		success: function (soapResponse) {
			
		console.log('success');
		console.log(soapResponse.toJSON());
		
		// do stuff with soapResponse
			// if you want to have the response as JSON use soapResponse.toJSON();
			// or soapResponse.toString() to get XML string
			// or soapResponse.toXML() to get XML DOM
		},
		error: function (SOAPResponse) {
		console.log('failure')
		}
	});
};

getSupportedProducts();