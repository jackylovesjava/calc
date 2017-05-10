$(function(){
    $("#newProjectSubmitBtn").click(function(){
      var weight = $("#inputWeight").val()
      var projectName = $("#inputProjectName").val()

      if(weight===null){
        alert('权重不能为空')
        return false;
      }
      if(weight>100){
        alert('权重不能大于100')
        return false;
      }
      if(weight==0){
        alert('权重不能为0')
        return false;
      }
      if(projectName===null||projectName.trim().length==0){
        alert('项目名称不能为空')
        return false;
      }

      $("#newProjectForm").submit()
    })


})
