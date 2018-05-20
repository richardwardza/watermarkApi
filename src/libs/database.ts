const constants = require('./constants').constants;
const mysql = require('mysql');

export function configureDB(log) {
	const dbConfig = {
		connectionLimit: 150,
		waitForConnections: true,
		queueLimit: 100000,
		acquireTimeout: 600000,
		multipleStatements: true,
		host: constants.DB_HOST,
		user: constants.DB_USER,
		password: constants.DB_PASSWORD,
		port: constants.DB_PORT,
		database: constants.DB_NAME,
		timezone: 'Z'
	};
	log.info('setting pooled DB connection', dbConfig.host);

	const dbAggPool = mysql.createPool(dbConfig);

	const connection = {
		dbAggPool: dbAggPool,
		dbConfig: dbConfig,

		query: function (query, params) {
			return new Promise((resolve, reject) => {
				dbAggPool.getConnection((err, connection) => {
					if (err) {
						if (err.code === 'PROTOCOL_CONNECTION_LOST') {
							log.error('Database connection was closed.')
						}
						if (err.code === 'ER_CON_COUNT_ERROR') {
							log.error('Database has too many connections.')
						}
						if (err.code === 'ECONNREFUSED') {
							log.error('Database connection was refused.')
						}
						else {
							log.error("DB Error - ", err);
						}
						reject(err);
					}

					connection.query(query, params, (err2, rows) => {
						log.debug(this.sql);
						connection.release();
						if (err2) {
							log.error(err2);
							reject(err2);
						} else {
							resolve(rows);
						};
					});
				});
			})
		},

		escape: mysql.escape,
		escapeId: mysql.escapeId
	}
	return connection;
}