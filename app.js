var express = require('express')
var port = process.env.PORT||8888
var app = express()
var path = require('path')
var mongoose = require('mongoose')
var Project = require('./models/project')
var PriceCall = require('./models/priceCall')
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段
app.locals.moment = require('moment'); // 载入moment模块，格式化日期
mongoose.connect('mongodb://localhost/gscalc')

app.set('views','./views/pages')
app.set('view engine','jade')

var bodyParser = require('body-parser');
// 因为后台录入页有提交表单的步骤，故加载此模块方法（bodyParser模块来做文件解析），将表单里的数据进行格式化
app.use(bodyParser.urlencoded({extended: true}));

var serveStatic = require('serve-static');  // 静态文件处理
app.use(serveStatic('public')); // 路径：public
app.listen(port)

console.log('server running')

// index page
app.get('/',function(req,res){
  Project.fetch(function(err,projects){
    if(err){
      console.log(err)
    }
    res.render('index',{
      title:'投标评分计算器-项目列表',
      projects:projects
    })

  })

})
// new page
app.get('/new',function(req,res){

    res.render('new',{
      title:'投标评分计算器-新增项目',
      project:{
        weight: 70,
        projectName: ''
      }

    })

})
// new page
app.get('/admin/project/edit/:id',function(req,res){
  var id = req.params.id;
  if (id) {
      Project.findById(id, function (err, project) {
          res.render('new', {
              title: '投标评分计算器-修改项目',
              project: project
          });
      });
  }
})
// new page
app.get('/admin/project/delete/:id',function(req,res){
  var id = req.params.id;
  if (id) {
      Project.remove({_id:id},function (err, project) {
          if(err){
            console.log(err)
          }else{
            res.redirect('/');
          }

      });
  }
})

// admin post project 后台录入提交项目
app.post('/admin/project/new', function (req, res) {
    var id = req.body.project._id;
    var projectObj = req.body.project;
    var _project = null;

    if (id!== 'undefined') { // 已经存在的数据

        Project.findById(id, function (err, Project) {
            if (err) {
                console.log(err);
            }
            _project = _underscore.extend(Project, movieObj); // 用新对象里的字段替换老的字段
            _project.save(function (err, project) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/project/' + project._id);
            });
        });
    } else {  // 新加的项目
        _project = new Project({
            projectName: projectObj.projectName,
            weight: projectObj.weight,
            creator: 'admin'
        });
        _project.save(function (err, project) {
            if (err) {
                console.log(err);
            }
            res.redirect('/project/' + project._id);
        });
    }
});

// admin post priceCall 后台录入提交报价
app.post('/admin/pricecall/new', function (req, res) {
    var id = req.body.priceCall._id;
    var priceCallObj = req.body.priceCall;
    var _priceCall = null;

    if (id!== 'undefined') { // 已经存在的数据

        PriceCall.findById(id, function (err, priceCall) {
            if (err) {
                console.log(err);
            }
            _priceCall = _underscore.extend(priceCall, priceCallObj); // 用新对象里的字段替换老的字段
                console.log(_priceCall);
            _priceCall.save(function (err, priceCall) {
                if (err) {
                    // console.log(err);
                }
                res.redirect('/project/' + priceCall.projectId);
            });
        });
    } else {  // 新加的项目
        _priceCall = new PriceCall({
          companyName:priceCallObj.companyName,
          price:priceCallObj.price,
          projectId:priceCallObj.projectId,
          caseZero:0,
          casePlusOne:0,
          caseMinusOne:0,
          casePlusTwo:0,
          caseMinusTwo:0
        });
        _priceCall.save(function (err, priceCall) {
            if (err) {
                console.log(err);
            }
            res.redirect('/project/' + priceCall.projectId);
        });
    }
});

// detail page
app.get('/project/:id',function(req,res){

  var id = req.params.id
  var priceCalls = []
  var priceCall = {companyName:'',price:''}
  var project = null
  Project.findById(id,function(err,project){
    project = project
    if(project!=null){
      PriceCall.findByProjectId(id,function(err,priceCalls){
        priceCalls=priceCalls
        res.render('detail',{
          title:'投标评分计算器-项目详情',
          project:project,
          priceCalls:priceCalls,
          priceCall:priceCall
        })
      })
    }else{
      res.render('detail',{
        title:'投标评分计算器-项目详情',
        project:project,
        priceCalls:priceCalls,
        priceCall:priceCall
      })
    }
  })

});
