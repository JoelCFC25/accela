var feeSchedule = "FIRE_TANK";
var feeQty = 1;
addFee("TANK_10", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Tank Fees added (based on user input)");
addFee("TANK_40", feeSchedule, "FINAL", feeQty, "Y");
logDebug("State Surcharge added");
addFee("TANK_30", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Technology fee added");
