const winston = require('winston');

export function configureLogger() {
	const log = winston.createLogger({
		transports: [
			new (winston.transports.Console)({
				colorize: true,
				timestamp: true,
				json : false,
				level: "debug"
			}),
			new (winston.transports.File)({
				filename: 'watermark-api.log',
				colorize: true,
				timestamp: true,
				json : false,
				level: "debug"				
			})
		]
	});
	return log;
}