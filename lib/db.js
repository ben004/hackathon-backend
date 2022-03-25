'use strict';
const mysql = require('mysql');
const _ = require('lodash');
const { logError, log } = require('./common');
const moment = require("moment-timezone");
const max_execution_time = 5000;

exports.instantiateDB = async (dbOption = 'full_au_market_db') => {
    let connectionVariables = {};
    try {
        switch (dbOption) {
            case 'main_client_system_prod_db':
                log("Connecting to DB 2");
                connectionVariables = {
                    host: process.env.DB_HOST_2,
                    user: process.env.DB_USER_2,
                    password: process.env.DB_PASS_2,
                    database: process.env.DB_NAME_2,
                    multipleStatements: true,
                    connectionLimit: 1000,
                    connectTimeout: 60 * 60 * 1000,
                    acquireTimeout: 60 * 60 * 1000,
                    timeout: 60 * 60 * 1000,
                };
                break;
            case 'full_au_market_db':
            default:
                log("Connecting to DB 1 - default");
                connectionVariables = {
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME,
                    multipleStatements: true,
                    connectionLimit: 1000,
                    connectTimeout: 60 * 60 * 1000,
                    acquireTimeout: 60 * 60 * 1000,
                    timeout: 60 * 60 * 1000,
                };
                break;
        }
        const pool = mysql.createConnection(connectionVariables);
        return pool;
    } catch (error) {
        console.log("Error in connecting to db");
        console.log(error);
    }
};

exports.disconnectDb = async (dbPool) => {
    return new Promise((resolve, reject) => {
        closePool(dbPool, "WRITE pool")
            .then(() => resolve())
            .catch((error) => {
                console.log("Error disconnecting pool connection", error);
                resolve();
            });
    });
}

const handleDisconnect = async (dbOption = 'full_au_market_db') => {
    return new Promise(async (resolve, reject) => {
        const connection = await this.instantiateDB(dbOption) // Recreate the connection, since
        // the old one cannot be reused.

        connection.connect(err => { // The server is either down
            if (err) { // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect(dbOption), 2000); // We introduce a delay before attempting to reconnect,
            } else {
                return resolve(connection);
            } // to avoid a hot loop, and to allow our node script to
        }); // process asynchronous requests in the meantime.
        // If you're also serving http, display a 503 error.
        connection.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                handleDisconnect(dbOption); // lost due to either server restart, or a
            } else { // connnection idle timeout (the wait_timeout
                throw err; // server variable configures this)
            };
        })
    })
}

function closePool(dbPool, title) {
    return new Promise((resolve, reject) => {
        dbPool.end(function (error) {
            if (error) {
                reject(error);
            } else {
                console.log(`Destroyed MySQL connection ${title}`, !error);
                resolve();
            }
        });
    });
}

/**
 * 
 * @param {string} query - Query to be executed
 * @param {function} dbConnect - Default DB-1 will be connected. 
 */
exports.executeSelectQuery = async (dbConnect, query, dbOption = 'full_au_market_db') => {
    try {
        return new Promise(async (resolve, reject) => {
            const pre_query = new Date().getTime();
            dbConnect.query(query, async (error, results) => {
                const post_query = new Date().getTime();
                if (post_query - pre_query >= max_execution_time) {
                    logError({
                        'query': query,
                        'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                    });
                }
                if (error) {
                    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                        const connection = await handleDisconnect(dbOption)
                        return resolve(this.executeSelectQuery(connection, query))
                    }
                    logError({
                        'functionName': "executeSelectQuery",
                        'actualError': error,
                        dbConnect
                    });
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    } catch (err) {
        logError({
            err,
            dbConnect
        })
    }
};

exports.executeSelectOneQuery = async (dbConnect, query, dbOption = 'full_au_market_db') => {
    try {
        return new Promise(async (resolve, reject) => {
            const pre_query = new Date().getTime();

            dbConnect.query(query, async (error, results) => {
                const post_query = new Date().getTime();
                if (post_query - pre_query >= max_execution_time) {
                    logError({
                        'query': query,
                        'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                    });
                }
                if (error) {
                    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                        const connection = await handleDisconnect(dbOption)
                        return resolve(this.executeSelectQuery(connection, query))
                    }
                    logError({
                        'functionName': "executeSelectQuery",
                        'actualError': error,
                        dbConnect
                    });
                    reject(error);
                } else {
                    const response = _.get(results, '[0]', {})
                    resolve(response);
                }
            });
        });
    } catch (err) {
        logError({
            err,
            dbConnect
        })
    }
};
/**
 * 
 * @param {string} query - Query to be executed
 * @param {array} values - Values to be inserted
 * @param {function} dbConnect - Default DB-1 will be connected. 
 */

exports.executeInsertQuery = async (dbConnect, query, values, dbOption = 'full_au_market_db') => {
    return new Promise(async (resolve, reject) => {
        const pre_query = new Date().getTime();
        dbConnect.query(query, [values], async (error, results) => {
            const post_query = new Date().getTime();
            if (post_query - pre_query >= max_execution_time) {
                logError({
                    query,
                    values,
                    'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                });
            }
            if (error) {
                if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                    const connection = await handleDisconnect(dbOption)
                    return resolve(this.executeInsertQuery(connection, query, values))
                }
                logError({
                    'functionName': "executeInsertQuery",
                    'actualError': error
                });
                return reject(error);
            } else {
                return resolve(results);
            }
        });
    });
};

/**
 * 
 * @param {string} query - Query to be executed
 * @param {array} values - Values to be inserted
 * @param {function} dbConnect - Default DB-1 will be connected. 
 */
exports.executeUpdateQuery = async (dbConnect, query, values, dbOption = 'full_au_market_db') => {
    return new Promise(async (resolve, reject) => {
        const pre_query = new Date().getTime();
        dbConnect.query(query, values, async (error, results) => {
            const post_query = new Date().getTime();
            if (post_query - pre_query >= max_execution_time) {
                logError({
                    query,
                    values,
                    'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                });
            }
            if (error) {
                if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                    const connection = await handleDisconnect(dbOption)
                    return resolve(this.executeInsertQuery(connection, query, values))
                }
                logError({
                    'functionName': "executeInsertQuery",
                    'actualError': error
                });
                reject(error);
            } else {
                return resolve(results);
            }
        });
    });
};

const formatQuery = (query) => {
    return mysql.format(query.sql, query.values);
}

exports.executeDynamicUpdate = async (dbConnect, values, tableName, dbOption = 'full_au_market_db') => {
    return new Promise(async (resolve, reject) => {
        const condField = "id";
        if (_.size(values)) {
            let queries = "";
            _.each(values, (value) => {
                const query = {
                    sql: `UPDATE ?? SET ? WHERE ?? = ?`,
                    values: [tableName, value, condField, value[condField]],
                };
                queries += `${formatQuery(query)}; `;
            });
            const pre_query = new Date().getTime();
            dbConnect.query(queries, async(error, result) => {
                const post_query = new Date().getTime();
                if (post_query - pre_query >= max_execution_time) {
                    logError({
                        query: queries,
                        'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                    });
                }
                if (error) {
                    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                        const connection = await handleDisconnect(dbOption)
                        return resolve(this.executeDynamicUpdate(connection, values, tableName, dbOption))
                    }
                    logError({
                        'functionName': "executeDynamicUpdate",
                        'actualError': error,
                        dbConnect
                    });
                    reject(error);
                } else {
                    if (!Array.isArray(result) && _.has(result, "changedRows")) {
                        resolve(result.changedRows);
                    } else {
                        const updatedRows = result.reduce(
                            (acc, res) => acc + res.changedRows,
                            0
                        );
                        resolve(updatedRows);
                    }
                }
            });
        } else {
            resolve(0);
        }
    });
}

exports.executeDynamicInsert = (
    dbConnect,
    verses,
    tableName,
    dbOption = 'full_au_market_db',
    insertIgnore = false,
) => {
    return new Promise(async (resolve, reject) => {

        if (_.size(verses)) {
            let fields = _.keys(_.first(verses));
            let values = _.map(verses, (p) => _.values(p));
            const query = {
                sql: `INSERT ${insertIgnore ? "IGNORE" : ""} INTO ??(??) VALUES ?`,
                values: [tableName, fields, values],
            };
            const pre_query = new Date().getTime();
            dbConnect.query(query, async(error, result) => {
                const post_query = new Date().getTime();
                if (post_query - pre_query >= max_execution_time) {
                    logError({
                        query,
                        'execution time': moment.utc(post_query - pre_query).format("HH:mm:ss SSS"),
                    });
                }
                if (error) {
                    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                        const connection = await handleDisconnect(dbOption)
                        return resolve(this.executeDynamicInsert(connection, verses, tableName, dbOption, insertIgnore))
                    }
                    logError({
                        'functionName': "executeSelectQuery",
                        'actualError': error,
                        dbConnect
                    });
                    reject(error);
                } else {
                    resolve(result)
                }
            });
        } else {
            resolve([null, 0]);
        }
    });
}

exports.findOrCreateTable = async (db, tableName, scrapeRegion = 'UK') => {
  const timeZone = `${scrapeRegion == 'VND' ? 'ict' : 'utc'}`
  const query = `CREATE TABLE IF NOT EXISTS ${tableName} (
    id int NOT NULL AUTO_INCREMENT,
    created_at datetime DEFAULT NULL,
    original_id int DEFAULT NULL,
    listing_id int DEFAULT NULL,
    created_${timeZone}_date_at date DEFAULT NULL,
    is_copied tinyint DEFAULT 0,
    copied_${timeZone}_date_at date DEFAULT NULL,
    copied_checkInDate date DEFAULT NULL,   
    checkInDate date DEFAULT NULL,
    days_to int DEFAULT NULL,
    room_id varchar(40) DEFAULT NULL,
    ratePlanCode varchar(40) DEFAULT NULL,
    is_amenity_free_breakfast tinyint DEFAULT NULL,
    is_amenity_free_cancel tinyint DEFAULT NULL,
    price_lead decimal(11,2) DEFAULT NULL,
    price_lead_no_tax decimal(11,2) DEFAULT NULL,
    star_rating decimal(3,1) DEFAULT NULL,
    reviews_score_overall decimal(2,1) DEFAULT NULL,
    is_subsequent_addition tinyint DEFAULT 0,
    subsequent_addition_date_at date DEFAULT NULL,
    PRIMARY KEY (id),
    KEY created_ict_date_at (created_${timeZone}_date_at),
    KEY created_ict_date_at_2 (created_${timeZone}_date_at,checkInDate),
    KEY listing_id (listing_id,created_${timeZone}_date_at),
    KEY listing_id_2 (listing_id,created_${timeZone}_date_at,checkInDate)
  ) ENGINE=InnoDB AUTO_INCREMENT=1853303 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`
  return this.executeSelectQuery(db, query);
}