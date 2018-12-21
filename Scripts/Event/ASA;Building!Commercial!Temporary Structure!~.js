var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
addFee("BLD_105", feeSchedule, "FINAL", feeQty, "Y");
logDebug("One hour review fee added");
addFee("BLD_070", feeSchedule, "FINAL", feeQty, "Y");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "Y");
logDebug("State surcharge and Processing fee added");
