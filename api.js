const request = require('request');

exports.getCashIn = (callback) => {
	request('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in', { json: true }, (err, res, body ) => {
		if (err) { 
			return console.log('err', err); 
		}
		callback(body); 
	});
}

exports.getCashOut = (data , callback) => {
	
	request('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/'+ data, { json: true }, (err, res, body ) => {
		if (err) { 
			return console.log('err', err); 
		}
		callback(body); 
	});
}
