var mongoose = require('mongoose')
var PriceCallSchema = new mongoose.Schema({
  companyName:String,
  price:Number,
  projectId:String,
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    updateAt:{
      type:Date,
      default:Date.now()
    }
  },
  caseZero:Number,
  casePlusOne:Number,
  caseMinusOne:Number,
  casePlusTwo:Number,
  caseMinusTwo:Number
})

PriceCallSchema.pre('save',function(next){
  if(this.isNew){
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else{
    this.meta.updateAt = Date.now()
  }
  next()
})
PriceCallSchema.statics={
  fetch:function(cb){
    return this
      .find({})
      .sort('meta.updateAt').exec(cb)
  },
  findByProjectId:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort('meta.updateAt').exec(cb)
  },
  findById:function(id,cb){
    return this
      .findOne({_id:id}).exec(cb)
  }
}

module.exports = PriceCallSchema
