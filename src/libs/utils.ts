interface IServiceError {
	error?: string;
	object?: object;
	errorDetail?: string;
}

export function serviceError(error = "", object = {}, errorDetail = "") {
	let serviceError: IServiceError = {};
	if (error) {
		serviceError.error = error;
	}
	if (object) {
		serviceError.object = object;
	}
	if (errorDetail) {
		serviceError.errorDetail = errorDetail;
	}
	return serviceError;
}

export function serviceResponse(code, response) {
	return { code, response };
}