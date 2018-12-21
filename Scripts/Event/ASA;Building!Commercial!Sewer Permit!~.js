var feeSchedule = "BLD_SWR";
var feeQty = 1;
var workType = getAppSpecific("Type of Work", capId);
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//add fees based on work type field
if(workType=="New Connection"){
  addFee("SWR_020", feeSchedule, "FINAL", feeQty, "Y");
  addFee("SWR_025", feeSchedule, "FINAL", feeQty, "Y");
  addStdCondition("Building Permit","Requires Right of Way Permit");
  logDebug("New Connection selected; fees added");
}
else if(workType=="Repair"){
  addFee("SWR_030", feeSchedule, "FINAL", feeQty, "Y");
  addFee("SWR_035", feeSchedule, "FINAL", feeQty, "Y");
  logDebug("Repair selected; fees added");
}
else {
  addFee("SWR_050", feeSchedule, "FINAL", feeQty, "Y");
  addFee("SWR_055", feeSchedule, "FINAL", feeQty, "Y");
  addStdCondition("Building Permit","Requires Right of Way Permit");
  logDebug("Disconnection selected; fees added");
}
addFee(feeCode, feeSchedule, "FINAL", feeQty, "Y");
//add bond verification
addFee("SWR_060", feeSchedule, "FINAL", feeQty, "Y");
//add $1 state surcharge
addFee("SWR_070", feeSchedule, "FINAL", feeQty, "Y");
//add processing fee
addFee("SWR_100", feeSchedule, "FINAL", feeQty, "Y");
