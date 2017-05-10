var mongoose = require('mongoose')
var PriceCallSchema = require('../Schemas/priceCall')
var PriceCall = mongoose.model('PriceCall',PriceCallSchema)

module.exports = PriceCall
