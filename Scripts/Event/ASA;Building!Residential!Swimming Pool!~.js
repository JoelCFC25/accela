var feeCode;
var feeSchedule = "BLD_POOL";
var feeQty = 1;
var poolType = getAppSpecific("Pool Type", capId);
//set the feecode variable based on work type field
if(poolType=="Seasonal"){
feeCode="POOL_30";
logDebug("Seasonal pool selected");
}
else{
feeCode="POOL_10";
logDebug("In-Ground pool selected");
if (AInfo['ParcelAttribute.DEFERRED ASSESSMENT'] == "External Improvement") {
addStdCondition("Assessment","Deferred Assessment");
}
if (AInfo['ParcelAttribute.Shoreland District'] == "Yes") {
addStdCondition("Shoreland","Shoreland District");
}
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Pool fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
if(poolType=="In-Ground"){
addFee("POOL_40", "BLD_POOL", "FINAL", 1, "N");
logDebug("Engineering fee added");
}
else{
logDebug("No Engineering fee");
}
//add tech fee
addFee("POOL_20", "BLD_POOL", "FINAL", 1, "N");
