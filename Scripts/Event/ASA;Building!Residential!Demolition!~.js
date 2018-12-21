var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var demoType = getAppSpecific("Demolition Type", capId);
//check demo types
if(demoType=="Interior Only"){
  addFee("BLD_220", feeSchedule, "FINAL", feeQty, "N");
  deactivateTask("Engineering Review");
  logDebug("Interior demo fee added");
}
else if(demoType=="Entire Structure (with Utility Disconnect)"){
  addFee("BLD_230", feeSchedule, "FINAL", feeQty, "N");
  addFee("BLD_045", feeSchedule, "FINAL", feeQty, "N");
  addStdCondition("Building Permit","Requires Sewer/Water Permits");
  logDebug("Structure demo and Engineering fees added");
}
else {
  addFee("BLD_250", feeSchedule, "FINAL", feeQty, "N");
  logDebug("Structure demo fee added, no utilities");
}
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("State surcharge and tech fee added");
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "External Improvement") {
  addStdCondition("Assessment","Deferred Assessment");
}
