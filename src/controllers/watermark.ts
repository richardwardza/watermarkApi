import { IWatermark } from "../models";
import { validateObject, watermarkSchema, serviceError, serviceResponse } from "../libs";
import { watermarkDocument } from './utils';
var fs = require("fs");

export function watermark(watermarkRequest: IWatermark, log) {

	const isValid = validateObject(watermarkRequest, watermarkSchema);
	if (!isValid.valid) {
		log.warn("Invalid parameters: ", JSON.stringify(isValid));
		return serviceResponse(400, serviceError(isValid.err));
	}
	log.info(`${watermarkRequest.file.path} - Received`);
	try {
		const pdf = watermarkDocument(watermarkRequest.file.path, watermarkRequest.line1, watermarkRequest.line2, log)
		log.info(`${watermarkRequest.file.path} - watermark completed`);
		return serviceResponse(200, pdf);
	} catch (e) {
		log.error(e);
		return serviceResponse(500, serviceError("Error generating watermark"));
	}

}