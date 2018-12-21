var feeSchedule = "FIRE_VALUATION";
var feeQty = 1;
addFee("FIRE_010", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Fire Permit fee added");
addFee("FIRE_020", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Fire Plan Review fee added");
addFee("FIRE_030", feeSchedule, "FINAL", feeQty, "Y");
logDebug("State Surcharge added");
//add tech fee
addFee("FIRE_040", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Technology fee added");
