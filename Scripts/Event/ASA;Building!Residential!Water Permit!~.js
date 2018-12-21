var feeSchedule = "BLD_WTR";
var feeQty = 1;
var workType = getAppSpecific("Type of Work", capId);
//remove all fees first in case the user has toggled options
removeAllFees(capId);
//add fees based on work type field
if(workType=="New Connection"){
  addFee("WTR_010", feeSchedule, "FINAL", feeQty, "Y");
  addFee("WTR_015", feeSchedule, "FINAL", feeQty, "Y");
  logDebug("New Connection selected; fees added");
  addStdCondition("Building Permit","Requires Right of Way Permit");
  if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "Water") {
    addStdCondition("Assessment","Deferred Assessment");
  }
}
else if(workType=="Repair"){
  addFee("WTR_030", feeSchedule, "FINAL", feeQty, "Y");
  addFee("WTR_035", feeSchedule, "FINAL", feeQty, "Y");
  logDebug("Repair selected; fees added");
}
else {
  addFee("WTR_040", feeSchedule, "FINAL", feeQty, "Y");
  addFee("WTR_045", feeSchedule, "FINAL", feeQty, "Y");
  addStdCondition("Building Permit","Requires Right of Way Permit");
  logDebug("Disconnection selected; fees added");
}
//add bond verification
addFee("WTR_060", feeSchedule, "FINAL", feeQty, "Y");
//add $1 state surcharge
addFee("WTR_070", feeSchedule, "FINAL", feeQty, "Y");
//add processing fee
addFee("WTR_100", feeSchedule, "FINAL", feeQty, "Y");
