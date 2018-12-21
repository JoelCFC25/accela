checkOrderForPayment(capId);
function checkOrderForPayment (pCapId) {
                try {
                                logDebug("checkOrderForPayment start");
                                var vFeeArrayResult = aa.finance.getFeeItemByCapID(pCapId);
                                var permitNum = capId.getCustomID();
                                if (vFeeArrayResult && vFeeArrayResult.getSuccess()){
                                   var vFeesArr = vFeeArrayResult.getOutput();
                                   for (i in vFeesArr){
                                     if (vFeesArr[i].getFeeDescription() == "Order for Payment (Electrical)"){
                                       ofp = true;
                                     }
                                   }
                                   if (ofp){
                                     email("petetokle@gmail.com","permits@cityofroseville.com","Electrical permit Order For Payment received",
                                           "A payment has been received on an outstanding Order for Payment on electrical permit " + permitNum + ".")
                                   }
                                }
                } catch (err) {
                                logDebug("Error** checkOrderForPayment()" + err.message);
                }
}
