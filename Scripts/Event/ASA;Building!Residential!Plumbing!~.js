var feeSchedule = "BLD_PLUMB";
var feeQty = 1;
var feeInvoice = "N";
var ownerAffidavit = getAppSpecific("Agree", capId);
var backFlow = getAppSpecific("Backflow Prevention Device", capId);
var mtr58 = getAppSpecific("5/8\" Meter", capId);
var mtr34 = getAppSpecific("3/4\" Meter", capId);
var mtr1 = getAppSpecific("1\" Meter", capId);
var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
if(capLicenseResult.getSuccess()){
  var capLicenseArr = capLicenseResult.getOutput();
  for(i in capLicenseArr){

    logDebug("License type: " + capLicenseArr[i].getLicenseType());
    if(capLicenseArr[i].getLicenseType() =="Plumbing"){
      feeInvoice = "Y";
    }
  }
}
//add base plumbing fees
addFee("PLUMB_010", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("PLUMB_020", feeSchedule, "FINAL", feeQty, feeInvoice);
//add license verification and state surcharge
addFee("PLUMB_080", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("PLUMB_090", feeSchedule, "FINAL", feeQty, feeInvoice);
//contractor license verification
if(ownerAffidavit=="CHECKED"){
removeFee("PLUMB_090","FINAL")
logDebug("No contractor license check for homeowner performing work");
}
//check for backflow prevention
if(backFlow=="CHECKED"){
addFee("PLUMB_030", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Backflow device fee added");
}
else{
logDebug("No backflow device");
}
//check for meter deposits
if(mtr58=="CHECKED"){
addFee("PLUMB_040", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("5/8\" meter deposit added");
}
else if(mtr34=="CHECKED"){
addFee("PLUMB_050", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("3/4\" meter deposit added");
}
else if(mtr1=="CHECKED"){
addFee("PLUMB_060", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("1\" meter deposit added");
}
else{
logDebug("No meter deposit");
}
//add tech fee
addFee("PLUMB_100", feeSchedule, "FINAL", feeQty, feeInvoice);
