showdebug = 3;
var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var workType = getAppSpecific("Work Type", capId);
//footing
if(workType=="Footing/Foundation"){
addFee("BLD_110", feeSchedule, "FINAL", feeQty, "N");
logDebug("Footing/Foundation fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
}
//pool
else if(workType=="Swimming Pool"){
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building Permit fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
}
else if(workType=="New Structure"){
//add new structure fees
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building Permit fee added");
addFee("BLD_030", feeSchedule, "FINAL", feeQty, "N");
logDebug("Plan Review fee added");
addFee("BLD_035", feeSchedule, "FINAL", feeQty, "N");
logDebug("Fire Inspection fee added");
addFee("BLD_045", feeSchedule, "FINAL", feeQty, "N");
logDebug("Engineering Review fee added");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
addFee("BLD_100", feeSchedule, "FINAL", feeQty, "N");
logDebug("SAC admin fee added");
addFee("BLD_090", feeSchedule, "FINAL", feeQty, "N");
logDebug("Certificate of Occupancy fee added");
addFee("BLD_200", feeSchedule, "FINAL", feeQty, "N");
logDebug("Construction deposit added");
}
else {
logDebug("Other: add fees manually");
}
//add tech fee
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Processing fee added");
if (AInfo['ParcelAttribute.STATE HIGHWAY'] == "Yes") {
addStdCondition("State Highway","Contact MnDOT");
}
if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
addStdCondition("County Road","County Road");
}
