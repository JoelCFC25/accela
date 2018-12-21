var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
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
addFee("BLD_200", feeSchedule, "FINAL", feeQty, "N");
logDebug("Construction deposit added");
//add tech fee
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Processing fee added");
if (AInfo['ParcelAttribute.STATE HIGHWAY'] == "Yes") {
addStdCondition("State Highway","Contact MnDOT");
}
if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
addStdCondition("County Road","County Road");
}
