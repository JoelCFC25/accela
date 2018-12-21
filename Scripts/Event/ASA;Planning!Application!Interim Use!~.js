showdebug = 3;
var feeCode;
var feeSchedule = "PLN_INT_USE";
var feeQty = 1;
var intuseType = getAppSpecific("Interim Use Type", capId);
//set the feecode variable based on interim use type field
if(intuseType=="New Interim Use"){
feeCode="INTUSE_010";
logDebug("New interim use fee chosen");
}
else{
feeCode="INTUSE_020";
logDebug("Extension of existing interim use fee chosen");
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Interim Use fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
