var feeSchedule = "LIC_RENTAL_GENERAL";
var feeQty = 1;
var rentalStatus = getAppSpecific("Rental Status", capId);
if(rentalStatus == "Rented") {
  addFee("LIC_020", feeSchedule, "FINAL", feeQty, "Y");
  logDebug("Rental Registration Renewal Fee and Tech Fee invoiced");
}
