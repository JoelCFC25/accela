var feeSchedule = "BLD_SIGN";
var feeQty = 1;
//add permanent sign fee
addFee("SIGN_010", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Permanent sign fee added");
addFee("SIGN_050", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Tech fee added");
