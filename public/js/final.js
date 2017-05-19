$(function(){

  $("#goIndexBtn").click(function(){

    window.location.href = "/"

  })

  $("#goToDetailBtn").click(function(){
    var projectId = $("#projectId").val()
    window.location.href = "/project/"+projectId

  })
  $("#goToPrint").click(function(){

    window.print();

  })


})
