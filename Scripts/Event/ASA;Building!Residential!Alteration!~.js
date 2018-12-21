showdebug = 3;
var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var propAge = getAppSpecific("Older than 1978", capId);
var ownerAffidavit = getAppSpecific("Agree", capId);
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building Permit fee added");
addFee("BLD_030", feeSchedule, "FINAL", feeQty, "N");
logDebug("Plan Review fee added");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
if(ownerAffidavit!="CHECKED"){
  addFee("BLD_160", feeSchedule, "FINAL", feeQty, "N");
  logDebug("State Contractor license verification fee added");
}
//check if lead license needed
if(propAge=="Yes" || ownerAffidavit!="CHECKED"){
  addFee("BLD_180", feeSchedule, "FINAL", feeQty, "N");
  logDebug("Lead license verification fee added");
}
//add tech fee
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Technology fee added");
