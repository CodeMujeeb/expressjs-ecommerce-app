const env = process.env;
module.exports = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 12000000, // interval to frequent check expired sessions 
    expiration: env.SESSION_EXPIRY || 10800000, // session expiry set to 3hr
}