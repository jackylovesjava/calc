var mongoose = require('mongoose')
var PriceCallSchema = require('../schemas/priceCall')
var PriceCall = mongoose.model('PriceCall',PriceCallSchema)

module.exports = PriceCall
