showdebug = 3;
var feeCode;
var feeSchedule = "BLD_SHED";
var feeQty = 1;
var shedSize = getAppSpecific("Shed Size", capId);
//set the feecode variable based on work type field
if(shedSize <= 120){
feeCode="SHED_10";
logDebug("Small shed fee selected");
}
else{
feeCode="SHED_20";
logDebug("Large shed fee selected (plan review required)");
}
if (AInfo['ParcelAttribute.Shoreland District'] == "Yes") {
addStdCondition("Shoreland","Shoreland District");
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Shed fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
if(shedSize > 120){
addFee("SHED_40", "BLD_SHED", "FINAL", 1, "N");
addFee("SHED_50", "BLD_SHED", "FINAL", 1, "N");
logDebug("Plan Review and Engineering fees added");
}
//add tech fee
addFee("SHED_30", "BLD_SHED", "FINAL", 1, "N");
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "External Improvement") {
addStdCondition("Assessment","Deferred Assessment");
}
