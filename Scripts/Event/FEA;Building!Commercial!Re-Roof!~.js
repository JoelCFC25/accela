var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
//add standard fees
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building permit fee added");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("State Surcharge and Tech Fee added");
