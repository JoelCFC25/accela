var feeCode;
var feeSchedule = "BLD_RES_ROOF";
var feeQty = 1;
var roofType = getAppSpecific("Type of Re-Roof", capId);
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
//set the feecode variable based on variance type field
if(roofType=="House"){
feeCode="ROOF_10";
logDebug("House Roof fee selected");
removeFee("ROOF_15","FINAL")
}
else{
feeCode="ROOF_15";
logDebug("Garage Roof fee selected");
removeFee("ROOF_10","FINAL")
}
if(ownerAffidavit!="CHECKED"){
addFee("ROOF_40", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Contractor license verification fee required");
}
//now add the proper feeCode
logDebug("Fee added");
addFee(feeCode, feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("ROOF_20", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("State Surcharge added");
addFee("ROOF_30", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Tech fee added");
