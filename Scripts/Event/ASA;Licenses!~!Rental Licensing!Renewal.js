var feeSchedule = "LIC_RENTAL_GENERAL";
var feeQty = 1;
removeAllFees(capId);
addFee("LIC_040", feeSchedule, "FINAL", feeQty, "Y");
addFee("LIC_045", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Rental License Fee and Unit Fee invoiced");
addFee("LIC_100", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Processing Fee invoiced");
