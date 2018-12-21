var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
//add solar fee
addFee("BLD_055", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Solar permit fee added");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "Y");
logDebug("State surcharge added");
addFee("BLD_160", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Contractor license verification fee added");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Tech fee added");
