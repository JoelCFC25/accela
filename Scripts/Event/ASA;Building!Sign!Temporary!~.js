var feeSchedule = "BLD_SIGN";
var feeQty = 1;
var annualSign = getAppSpecific("Annual Sign", capId);
var tempSign = getAppSpecific("Temporary Sign", capId);
var attnDevice = getAppSpecific("Temporary Attention Getting Device", capId);
//check tickboxes
if(annualSign=="CHECKED"){
addFee("SIGN_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("Annual Sign fee added");
}
else{
logDebug("No annual sign");
}
if(tempSign=="CHECKED"){
addFee("SIGN_030", feeSchedule, "FINAL", feeQty, "N");
logDebug("Temporary Sign fee added");
}
else{
logDebug("No temporary sign");
}
if(attnDevice=="CHECKED"){
addFee("SIGN_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Attention Getting Device fee added");
}
else{
logDebug("No attention getting device");
}
addFee("SIGN_050", feeSchedule, "FINAL", feeQty, "N");
logDebug("Tech fee added");
