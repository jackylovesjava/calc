var mongoose = require('mongoose')
var PriceCallSchema = new mongoose.Schema({
  companyName:String,
  price:Number,
  discount:Number,
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
  },
  findByProjectIdDesc:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort({'caseZero':-1}).exec(cb)
  },
  findByProjectIdDescCasePlusOne:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort({'casePlusOne':-1}).exec(cb)
  },
  findByProjectIdDescCasePlusTwo:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort({'casePlusTwo':-1}).exec(cb)
  },
  findByProjectIdDescCaseMinusOne:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort({'caseMinusOne':-1}).exec(cb)
  },
  findByProjectIdDescCaseMinusTwo:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort({'caseMinusTwo':-1}).exec(cb)
  }
}

module.exports = PriceCallSchema
