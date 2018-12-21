var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var ownerAffidavit = getAppSpecific("Agree", capId);
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building Permit fee added");
addFee("BLD_030", feeSchedule, "FINAL", feeQty, "N");
logDebug("Plan Review fee added");
if(ownerAffidavit!="CHECKED"){
addFee("BLD_160", feeSchedule, "FINAL", feeQty, "N");
logDebug("Contractor license verification fee required");
addFee("BLD_180", feeSchedule, "FINAL", feeQty, "N");
logDebug("Lead license verification fee added");
}
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge added");
//add tech fee
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Technology fee added");
if (AInfo['ParcelAttribute.SHORELAND DISTRICT'] == "Yes") {
addStdCondition("Shoreland","Shoreland District");
}
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "External Improvement") {
addStdCondition("Assessment","Deferred Assessment");
}
