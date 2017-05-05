var mongoose = require('mongoose')
var ProjectSchema = new mongoose.Schema({
  name:String,
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

ProjectSchema.pre('save',function(next){
  if(this.isNew){
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else{
    this.meta.updateAt = Date.now()
  }
  next()
})
ProjectSchema.statics={
  fetch:function(cb){
    return this
      .find({})
      .sort('meta.updateAt')
    exec(cb)
  },
  findById:function(cb){
    return this
      .findOne({_id:id})
        exec(cb)
  }
}

module.exports = ProjectSchema
