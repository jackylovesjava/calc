var express = require('express')
var port = process.env.PORT||8888
var app = express()
var path = require('path')
var mongoose = require('mongoose')
var Project = require('./models/project')
var PriceCall = require('./models/priceCall')
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段
var math = require("math")
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
        weight: 60,
        projectName: '',
        controlPrice:0,
        unCompetePrice:0
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
// delete project
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

// delete priceCall
app.get('/admin/pricecall/delete/:id',function(req,res){
  var id = req.params.id;
  PriceCall.findById(id,function(err,priceCall){
    if (id) {
        PriceCall.remove({_id:id},function (err, project) {
            if(err){
              console.log(err)
            }else{
              res.redirect('/project/'+priceCall.projectId);
            }

        });
    }
  })

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
            _project = _underscore.extend(Project, projectObj); // 用新对象里的字段替换老的字段
            _project.save(function (err, project) {
                if (err) {
                    console.log(err);
                }
                updateAllPriceCallsByProject(project,res)

            });
        });
    } else {  // 新加的项目
        _project = new Project({
            projectName: projectObj.projectName,
            weight: projectObj.weight,
            creator: 'admin',
            controlPrice:projectObj.controlPrice,
            unCompetePrice:projectObj.unCompetePrice
        });
        _project.save(function (err, project) {
            if (err) {
                console.log(err);
            }
            res.redirect('/project/' + project._id);
        });
    }
});

function updateAllPriceCallsByProject(project,res){

    var projectId = project._id;
    PriceCall.findByProjectId(projectId,function(err,priceCalls){

      priceCalls.forEach(function(pc){
        var newPrice = ((project.controlPrice-project.unCompetePrice)*(100-pc.discount)/100+project.unCompetePrice).toFixed(6)
        pc.price = newPrice;
        pc.save(function (err, priceCall) {
            if (err) {
                console.log(err);
            }

        });
      })
      res.redirect('/project/' + project._id);


    });


}

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
          caseMinusTwo:0,
          discount:priceCallObj.discount
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
  var priceCall = {companyName:'',price:'',discount:0}
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

  // result page
  app.get('/result/:id',function(req,res){
    var projectId = req.params.id
    Project.findById(id,function(err,project){
      var controlPrice = project.controlPrice
      var unCompetePrice = project.unCompetePrice
        PriceCall.findByProjectId(id,function(err,priceCalls){
          priceCalls=priceCalls
          var totalPrice = 0;
          var totalDiscount = 0;

          priceCalls.forEach(function(pc){
            totalPrice = totalPrice + pc.price
            totalDiscount = totalDiscount + pc.discount
          })
          var a = totalPrice/priceCalls.length//算术平均值A
          var ad = totalDiscount/priceCalls.length //平均下浮率

          project.averageDiscount = ad;
          project.save(function(err,pr){
            if (err) {
                console.log(err);
            }
          });

          priceCalls.forEach(function(pc){
            var cn = pc.price

            var c = 0;
            var alpha = 1//计算系数
            //===============计算当浮动系统为0的情况==============
            c = a
            if(cn<=c){//当报价小于等于基准值，则计算系数为1,否则为2
              alpha = 1
            }else{
              alpha = 2
            }
            var caseZero = ((1-alpha*math.abs(1-cn/c))*100)
            //===============计算当浮动系统为1的情况==============
            var casePlusOneDiscount = (ad - 1).toFixed(2);
            c = ((controlPrice - unCompetePrice)*(100-casePlusOneDiscount)/100+unCompetePrice).toFixed(6);
            if(cn<=c){//当报价小于等于基准值，则计算系数为1,否则为2
              alpha = 1
            }else{
              alpha = 2
            }
            var casePlusOne = ((1-alpha*math.abs(1-cn/c))*100)
            //===============计算当浮动系统为-1的情况==============
            var caseMinusOneDiscount = (ad + 1).toFixed(2);
            c = ((controlPrice - unCompetePrice)*(100-caseMinusOneDiscount)/100+unCompetePrice).toFixed(6);
            if(cn<=c){//当报价小于等于基准值，则计算系数为1,否则为2
              alpha = 1
            }else{
              alpha = 2
            }
            var caseMinusOne = ((1-alpha*math.abs(1-cn/c))*100)
            //===============计算当浮动系统为2的情况==============
            var casePlusTwoDiscount = (ad - 2 ).toFixed(2);
            c = ((controlPrice - unCompetePrice)*(100-casePlusTwoDiscount)/100+unCompetePrice).toFixed(6);
            if(cn<=c){//当报价小于等于基准值，则计算系数为1,否则为2
              alpha = 1
            }else{
              alpha = 2
            }
            var casePlusTwo = ((1-alpha*math.abs(1-cn/c))*100)
            //===============计算当浮动系统为-2的情况==============
            var caseMinusTwoDiscount = (ad + 2 ).toFixed(2);
            c = ((controlPrice - unCompetePrice)*(100-caseMinusTwoDiscount)/100+unCompetePrice).toFixed(6);
            if(cn<=c){//当报价小于等于基准值，则计算系数为1,否则为2
              alpha = 1
            }else{
              alpha = 2
            }
            var caseMinusTwo = ((1-alpha*math.abs(1-cn/c))*100)

            pc.caseZero = caseZero;
            pc.caseMinusOne = caseMinusOne;
            pc.caseMinusTwo = caseMinusTwo;
            pc.casePlusOne = casePlusOne;
            pc.casePlusTwo = casePlusTwo;

            pc.save(function (err, priceCall) {
                if (err) {
                    console.log(err);
                }

            });

          })
          res.redirect('/final/' + projectId);
        })
    })

  })
});

// index page
app.get('/final/:id',function(req,res){

  var projectId = req.params.id
  var project = null
  var caseZeroResults = []
  var casePlusOneResults = []
  var casePlusTwoResults = []
  var caseMinusOneResults = []
  var caseMinusTwoResults = []
  var caseZeroDiscount = 0;
  var caseZeroPrice = 0;
  var casePlusOneDiscount = 0;
  var casePlusOnePrice = 0;
  var casePlusTwoDiscount = 0;
  var casePlusTwoPrice = 0;
  var caseMinusOneDiscount = 0;
  var caseMinusOnePrice = 0;
  var caseMinusTwoDiscount = 0;
  var caseMinusTwoPrice = 0;
  Project.findById(projectId,function(err,project){
     project = project
     caseZeroDiscount = project.averageDiscount.toFixed(2);
     caseZeroPrice = ((project.controlPrice - project.unCompetePrice)*(100-caseZeroDiscount)/100+project.unCompetePrice).toFixed(6);

     casePlusOneDiscount = (project.averageDiscount - 1).toFixed(2);
     casePlusOnePrice = ((project.controlPrice - project.unCompetePrice)*(100-casePlusOneDiscount)/100+project.unCompetePrice).toFixed(6);

     casePlusTwoDiscount = (project.averageDiscount - 2).toFixed(2);
     casePlusTwoPrice = ((project.controlPrice - project.unCompetePrice)*(100-casePlusTwoDiscount)/100+project.unCompetePrice).toFixed(6);

     caseMinusOneDiscount = (project.averageDiscount+1).toFixed(2);
     caseMinusOnePrice = ((project.controlPrice - project.unCompetePrice)*(100-caseMinusOneDiscount)/100+project.unCompetePrice).toFixed(6);

     caseMinusTwoDiscount = (project.averageDiscount+2).toFixed(2);
     caseMinusTwoPrice = ((project.controlPrice - project.unCompetePrice)*(100-caseMinusTwoDiscount)/100+project.unCompetePrice).toFixed(6);

     PriceCall.findByProjectIdDesc(projectId,function(err,priceCalls0){
       if(err){
         console.log(err)
       }
       caseZeroResults = priceCalls0
       PriceCall.findByProjectIdDescCasePlusOne(projectId,function(err,priceCalls1){
         if(err){
           console.log(err)
         }
           casePlusOneResults = priceCalls1
         PriceCall.findByProjectIdDescCasePlusTwo(projectId,function(err,priceCalls2){
           if(err){
             console.log(err)
           }
             casePlusTwoResults = priceCalls2
           PriceCall.findByProjectIdDescCaseMinusOne(projectId,function(err,priceCalls3){
             if(err){
               console.log(err)
             }
               caseMinusOneResults = priceCalls3
             PriceCall.findByProjectIdDescCaseMinusTwo(projectId,function(err,priceCalls4){
               if(err){
                 console.log(err)
               }
                 caseMinusTwoResults = priceCalls4
                 res.render('final',{
                               title:'投标评分计算器-计算结果',
                               project:project,
                               caseZeroResults:caseZeroResults,
                               casePlusOneResults:casePlusOneResults,
                               casePlusTwoResults:casePlusTwoResults,
                               caseMinusOneResults:caseMinusOneResults,
                               caseMinusTwoResults:caseMinusTwoResults,
                               caseZeroDiscount:caseZeroDiscount,
                               caseZeroPrice:caseZeroPrice,
                               casePlusOneDiscount:casePlusOneDiscount,
                               casePlusOnePrice:casePlusOnePrice,
                               casePlusTwoDiscount:casePlusTwoDiscount,
                               casePlusTwoPrice:casePlusTwoPrice,
                               caseMinusOneDiscount:caseMinusOneDiscount,
                               caseMinusOnePrice:caseMinusOnePrice,
                               caseMinusTwoDiscount:caseMinusTwoDiscount,
                               caseMinusTwoPrice:caseMinusTwoPrice
                             })
             });
           });
         });
       });
     });
  });


  //
  // Project.findById(projectId,function(err,project){
  //
  //   project = project
  //   PriceCall.findByProjectIdDescCaseZero(projectId,function(err,priceCalls0){
  //     if(err){
  //       console.log(err)
  //     }
  //     caseZeroResults = priceCalls0;
  //
  //     PriceCall.findByProjectIdDescCasePlusOne(projectId,function(err,priceCalls1){
  //       if(err){
  //         console.log(err)
  //       }
  //       casePlusOneResults = priceCalls1;
  //       PriceCall.findByProjectIdDescCasePlusTwo(projectId,function(err,priceCalls2){
  //         if(err){
  //           console.log(err)
  //         }
  //         casePlusTwoResults = priceCalls2;
  //         PriceCall.findByProjectIdDescCaseMinusOne(projectId,function(err,priceCalls3){
  //           if(err){
  //             console.log(err)
  //           }
  //           caseMinusOneResults = priceCalls3;
  //           PriceCall.findByProjectIdDescCaseMinusTwo(projectId,function(err,priceCalls4){
  //             if(err){
  //               console.log(err)
  //             }
  //             caseMinusTwoResults = priceCalls4;
  //
  //             res.render('final',{
  //               title:'投标评分计算器-计算结果',
  //               project:project,
  //               caseZeroResults:caseZeroResults,
  //               casePlusOneResults:casePlusOneResults,
  //               casePlusTwoResults:casePlusTwoResults,
  //               caseMinusOneResults:caseMinusOneResults,
  //               caseMinusTwoResults:caseMinusTwoResults
  //             })
  //           })
  //         })
  //       })
  //     })
  //   })

  // })









})
