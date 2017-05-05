var mongoose = require('mongoose')
var CompanySchema = require('../Schemas/company')
var Company = mongoose.model('Company',CompanySchema)

module.exports = Company
