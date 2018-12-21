var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var workType = getAppSpecific("Work Type", capId);
//footing
if(workType=="Footing/Foundation"){
addFee("BLD_120", feeSchedule, "FINAL", feeQty, "N");
logDebug("Footing/Foundation fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
}
else if(workType=="Moving a Structure (Over Public Streets)"){
addFee("BLD_270", feeSchedule, "FINAL", feeQty, "N");
logDebug("House moving fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
}
else if(workType=="Moving a Structure (Private Property)"){
addFee("BLD_280", feeSchedule, "FINAL", feeQty, "N");
logDebug("House moving fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
}
else if(workType=="New Dwelling"){
//add new house fees
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building Permit fee added");
addFee("BLD_030", feeSchedule, "FINAL", feeQty, "N");
logDebug("Plan Review fee added");
addFee("BLD_045", feeSchedule, "FINAL", feeQty, "N");
logDebug("Engineering Review fee added");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
addFee("BLD_095", feeSchedule, "FINAL", feeQty, "N");
logDebug("1 SAC charge added");
addFee("BLD_100", feeSchedule, "FINAL", feeQty, "N");
logDebug("SAC admin fee added");
addFee("BLD_090", feeSchedule, "FINAL", feeQty, "N");
logDebug("Certificate of Occupancy fee added");
addFee("BLD_210", feeSchedule, "FINAL", feeQty, "N");
logDebug("Construction deposit added");
}
else {
logDebug("Other: add fees manually");
}
//add tech fee
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Technology fee added");
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "New Construction") {
addStdCondition("Assessment","Deferred Assessment");
}
