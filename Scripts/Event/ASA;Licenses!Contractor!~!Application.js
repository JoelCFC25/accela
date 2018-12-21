var feeSchedule = "LIC_CONTRACTOR_GENERAL";
var feeQty = 1;
if(publicUser) {
  addFee("LIC_020", feeSchedule, "FINAL", feeQty, "Y");
  addFee("LIC_035", feeSchedule, "FINAL", feeQty, "Y");
  logDebug("City Contractor License Fee and Tech Fee invoiced");
}
if !(publicUser) {
  updateTask("License Issuance", "Issued", "Licensed Issued on submission of Application", "");
  deactivateTask("License Issuance");
}
