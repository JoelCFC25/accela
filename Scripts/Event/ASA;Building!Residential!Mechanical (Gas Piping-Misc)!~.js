var feeSchedule = "BLD_MECH_VAL";
var feeQty = 1;
var feeInvoice = "N";
var workVal = getAppSpecific("Valuation", capId);
var ownerAffidavit = getAppSpecific("Agree", capId);
var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
if(capLicenseResult.getSuccess()){
  var capLicenseArr = capLicenseResult.getOutput();
  for(i in capLicenseArr){

    logDebug("License type: " + capLicenseArr[i].getLicenseType());
    if(capLicenseArr[i].getLicenseType() =="City Contractor"){
      feeInvoice = "Y";
    }
  }
}
//add standard fees
addFee("MECHV_10", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("MECHV_20", feeSchedule, "FINAL", feeQty, feeInvoice);
//add bond verification fee if no homeowner affidavit
if(ownerAffidavit!="CHECKED"){
addFee("MECHV_30", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Mechanical bond verification fee required");
}
//add tech fee
addFee("MECHV_40", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Technology fee added");
