showdebug = 3;
var feeCode;
var feeSchedule = "PLN_VARIANCE";
var feeQty = 1;
var varianceType = getAppSpecific("Variance Type", capId);
//set the feecode variable based on variance type field
if(varianceType=="Residential"){
feeCode="VAR_010";
logDebug("residential fee selected");
}
else{
feeCode="VAR_020";
logDebug("building fee selected");
}
//remove all fees first incase the user has toggled options
removeAllFees(capId);
//now add the proper feeCode
logDebug("Fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
