var mongoose = require('mongoose')
var ProjectSchema = require('../Schemas/project')
var Project = mongoose.model('Project',ProjectSchema)

module.exports = Project
