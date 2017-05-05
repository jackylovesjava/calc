var mongoose = require('mongoose')
var CompanySchema = new mongoose.Schema({
  name:String,
  price:Number,
  projectId:Number,
  meta:{
    createAt:{
      type:Date,
      default:Date.now()
    },
    updateAt:{
      type:Date,
      default:Date.now()
    }
  }
})

CompanySchema.pre('save',function(next){
  if(this.isNew){
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else{
    this.meta.updateAt = Date.now()
  }
  next()
})
CompanySchema.statics={
  fetch:function(cb){
    return this
      .find({})
      .sort('meta.updateAt')
    exec(cb)
  },
  findByProjectId:function(projectId,cb){
    return this
      .find({projectId:projectId})
      .sort('meta.updateAt')
    exec(cb)
  },
  findById:function(id,cb){
    return this
      .findOne({_id:id})
        exec(cb)
  }
}

module.exports = CompanySchema
