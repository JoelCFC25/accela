var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var demoType = getAppSpecific("Demolition Type", capId);
//check demo types
if(demoType=="Interior Only"){
addFee("BLD_220", feeSchedule, "FINAL", feeQty, "N");
logDebug("Interior demo fee added");
}
else if(demoType=="Entire Structure (with Utility Disconnect)"){
addFee("BLD_240", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_045", feeSchedule, "FINAL", feeQty, "N");
logDebug("Structure demo and Engineering fees added");
}
else {
addFee("BLD_250", feeSchedule, "FINAL", feeQty, "N");
logDebug("Structure demo fee added, no utilities");
}
addFee("BLD_100", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("SAC admin, state surcharge, and processing fees added");
