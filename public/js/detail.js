$(function(){
    $("#newPriceCallBtn").click(function(){

      var inputCompanyName = $("#inputCompanyName").val()
      var inputPrice = $("#inputPrice").val()

      if(inputPrice===null){
        alert('报价不能为空')
        return false;
      }

      if(inputPrice==0){
        alert('报价不能为0')
        return false;
      }
      if(inputCompanyName===null||inputCompanyName.trim().length==0){
        alert('公司名称不能为空')
        return false;
      }

      $("#newPriceCallForm").submit()
    })

    $("#startCalcBtn").click(function(){

      var projectId = $("#projectId").val();
      window.location.href="/result/"+projectId;

    })

    $("#goIndexBtn").click(function(){

      window.location.href = "/"

    })
    $("#inputDiscount").blur(function(){
      var discount = $("#inputDiscount").val();
      var controlPrice = $("#controlPrice").val();
      var unCompetePrice = $("#unCompetePrice").val();
      var price=(parseFloat((controlPrice-unCompetePrice)*(100-discount)/100)+parseFloat(unCompetePrice)).toFixed(6);
      if(price>0){
        $("#inputPrice").val(price);
      }else {
        $("#inputPrice").val('');
      }
    })

})

function goToEditPriceCall(itemId){
  $("#inputId").val($(".priceCallId-"+itemId).val())
  $("#inputProjectId").val($(".priceCallProjectId-"+itemId).val())
  $("#inputCaseZero").val($(".priceCallCaseZero-"+itemId).val())
  $("#inputCasePlusTwo").val($(".priceCallCasePlusTwo-"+itemId).val())
  $("#inputCaseMinusTwo").val($(".priceCallCaseMinusTwo-"+itemId).val())
  $("#inputCasePlusOne").val($(".priceCallCasePlusOne-"+itemId).val())
  $("#inputCaseMinusOne").val($(".priceCallCaseMinusOne-"+itemId).val())
  $("#inputCompanyName").val($(".priceCallCompanyName-"+itemId).val())
  $("#inputPrice").val($(".priceCallPrice-"+itemId).val())
  $("#inputDiscount").val($(".priceCallDiscount-"+itemId).val())
}
