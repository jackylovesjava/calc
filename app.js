var express = require('express')
var port = process.env.PORT||8888
var app = express()
var path = require('path')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var Project = require('./models/project')
var Company = require('./models/company')
mongoose.connect('mongodb://localhost/gscalc')

app.set('views','./views/pages')
app.set('view engine','jade')

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'bower_components')))
app.listen(port)

console.log(path.join(__dirname,'bower_components'))

// index page
app.get('/',function(req,res){
  Project.fetch(function(err,projects){
    if(err){
      console.log(err)
    }
    res.render('index',{
      title:'投标评分计算器',
      projects:projects
    })

  })

})

// detail page
app.get('/project/:id',function(req,res){
  var id = req.params.id
  var companies = null
  var project = null
  Project.findById(id,function(err,project)){
    project = project
    if(project!=null){
    Company.findByProjectId(project._id,function(err,companies){
      res.render('detail',{
        title:'投标评分计算器-项目详情',
        project:project,
        companies:companies
      })
    })
    }
  }
 })
