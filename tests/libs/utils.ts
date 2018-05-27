var request = require('request');

export function queryEndpoint(url, body = {}, headers = {}, method = "POST") {
	const requestParams = {
		url,
		method,
		headers,
		body
	};
	return new Promise(function (resolve, reject) {
		request(requestParams, function (error, res, body) {
			if (!error && res.statusCode == 200) {
				resolve(body);
			} else {
				reject(error);
			}
		});
	});
}