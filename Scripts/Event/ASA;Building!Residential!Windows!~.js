var feeSchedule = "BLD_RES_WINDOW";
var feeQty = 1;
var propAge = getAppSpecific("Older than 1978", capId);
var header = getAppSpecific("Enlarging header?", capId);
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
addFee("WIN_010", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("WIN_020", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("WIN_030", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("WIN_050", feeSchedule, "FINAL", feeQty, feeInvoice);
//remove contractor license fee if no license and homeowner affidavit
if(ownerAffidavit=="CHECKED" && feeInvoice=="N"){
removeFee("WIN_050");
}
//check if lead license needed
if(propAge=="Yes" && feeInvoice=="Y"){
addFee("WIN_040", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Lead license verification fee required");
}

if(header=="No"){
  closeTask("Application Submittal","Accepted - Plan Review Not Req","Can be issued immediately","");
  deactivateTask("Building Review");
  activateTask("Permit Issuance");
}
else{
  closeTask("Application Submittal","Accepted - Plan Review Req","Building review required","");
}
