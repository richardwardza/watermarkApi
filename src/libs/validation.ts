const Joi = require('joi');


export const validateObject = (object, schema, options = {}) => {
	const result = Joi.validate(object, schema, options);
	return { valid: result.error ? false : true, err: result.error };
}

const file = Joi.object().keys({
	fieldname: Joi.string().required(),
	mimetype: Joi.string().required(),
	size: Joi.number().integer(),
	originalname:Joi.string().required(),
	encoding:Joi.string().required(),
	destination:Joi.string().required(),
	filename:Joi.string().required(),
	path:Joi.string().required(),	
});

export const watermarkSchema = Joi.object().keys({
	line1: Joi.string().required(),
	line2: Joi.string(),
	file: file,
});
