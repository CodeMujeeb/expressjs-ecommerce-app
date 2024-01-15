const Sequelize = require('sequelize')

const sequelize = new Sequelize('express_ecommerce_app', 'valet', 'cc', {
    host: "localhost",
    dialect: "mysql"
})

module.exports = sequelize