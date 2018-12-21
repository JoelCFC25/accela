var feeCode;
var feeSchedule = "BLD_DRIVEWAY";
var feeQty = 1;
var workType = getAppSpecific("Work Type", capId);
//set the feecode variable based on work type field
if(workType=="Replacement"){
feeCode="DW_10";
logDebug("Driveway replacement fee selected");
}
else{
feeCode="DW_20";
logDebug("Driveway expansion fee selected");
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Driveway fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
if(workType=="Expansion"){
addFee("DW_40", "BLD_DRIVEWAY", "FINAL", 1, "N");
logDebug("Engineering fee added");
}
else{
logDebug("No Engineering fee");
}
//add tech fee
addFee("DW_30", "BLD_DRIVEWAY", "FINAL", 1, "N");
if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
addStdCondition("County Road","County Road");
}
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "External Improvement") {
addStdCondition("Assessment","Deferred Assessment");
}
if (AInfo['ParcelAttribute.ALERTS'] == "Driveway") {
addStdCondition("Building Permit","Stop Issuance");
}
