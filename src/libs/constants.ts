exports = module.exports = {};

exports.constants = {
	DB_HOST: process.env.DB_HOST || "127.0.0.1",
	DB_USER: process.env.DB_USER || "root",
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_PORT: process.env.DB_PORT || 3306,
	DB_NAME: process.env.DB_NAME || 'wnt',
	WNT_MAIL_USER: process.env.WNT_MAIL_USER,
	WNT_MAIL_PWD: process.env.WNT_MAIL_PWD,
	WNT_DOMAIN: process.env.WNT_DOMAIN || "api.wnt.io",
	WNT_COOKIE_DOMAIN: process.env.WNT_COOKIE_DOMAIN || ".wnt.io",
};
