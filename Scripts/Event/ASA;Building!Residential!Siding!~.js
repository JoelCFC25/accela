var feeSchedule = "BLD_RES_SIDING";
var feeQty = 1;
var propAge = getAppSpecific("Older than 1978", capId);
var ownerAffidavit = getAppSpecific("Agree", capId);
var feeInvoice = "N";
var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
if(capLicenseResult.getSuccess()){
  var capLicenseArr = capLicenseResult.getOutput();
  for(i in capLicenseArr){
    logDebug("License type: " + capLicenseArr[i].getLicenseType());
    if(capLicenseArr[i].getLicenseType() =="Contractor"){
      feeInvoice = "Y";
    }
  }
}
//add standard fees
addFee("SIDE_10", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("SIDE_20", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("SIDE_30", feeSchedule, "FINAL", feeQty, feeInvoice);
//add contractor license fee if no homeowner affidavit
if(ownerAffidavit!="CHECKED"){
addFee("SIDE_50", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Contractor license verification fee required");
}
//check if lead license needed
if(propAge=="Yes" || ownerAffidavit!="CHECKED"){
addFee("SIDE_40", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Lead license verification fee required");
}
