const databaseOptions = require('./database-options')

const Sequelize = require('sequelize')

const sequelize = new Sequelize(databaseOptions.database, databaseOptions.user, databaseOptions.password, {
    host: databaseOptions.host,
    dialect: "mysql"
})

module.exports = sequelize