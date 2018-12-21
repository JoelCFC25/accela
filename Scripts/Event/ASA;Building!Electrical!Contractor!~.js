var feeSchedule = "BLD_ELEC_C";
var feeQty = 1;
var feeInvoice = "N";
var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
if(capLicenseResult.getSuccess()){
  var capLicenseArr = capLicenseResult.getOutput();
  for(i in capLicenseArr){

    logDebug("License type: " + capLicenseArr[i].getLicenseType());
    if(capLicenseArr[i].getLicenseType() =="Electrical"){
      feeInvoice = "Y";
    }
  }
}
removeAllFees(capId);
//copy Tokle Inspections as additional contact
var sourceCap = getApplication("ELEC-INSP01");
copyContacts(sourceCap);
//add base electrical fee
addFee("ELEC_C_10", feeSchedule, "FINAL", feeQty, feeInvoice);
//add license verification and state surcharge
addFee("ELEC_C_40", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("ELEC_C_60", feeSchedule, "FINAL", feeQty, feeInvoice);
//add tech fee
addFee("ELEC_C_50", feeSchedule, "FINAL", feeQty, feeInvoice);
