var feeCode;
var feeSchedule = "PLN_COND_USE";
var feeQty = 1;
var conduseType = getAppSpecific("Application Type", capId);
//set the feecode variable based on application type field
if(conduseType=="Residential"){
feeCode="COND_010";
logDebug("Residential fee chosen");
}
else{
feeCode="COND_020";
logDebug("Commercial fee chosen");
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Conditional Use fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
