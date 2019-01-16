var feeSchedule = "BLD_MECH";
var feeQty = 1;
var feeInvoice = "N";
var ownerAffidavit = getAppSpecific("Agree", capId);
var duct = getAppSpecific("Ductwork", capId);
var worktype = getAppSpecific("Type of Work", capId);
var acrepl = getAppSpecific("Air Conditioning Systems (Replacement)", capId);
var furrepl = getAppSpecific("Warm Air Furnaces (Replacement)", capId);
var boilrepl = getAppSpecific("Hot Water Boilers (Replacement)", capId);
var uhtr = getAppSpecific("Unit Heaters", capId);
var poolhtr = getAppSpecific("Swimming Pool Heaters", capId);
var gasfpl = getAppSpecific("Gas Fireplaces", capId);
var flrheat = getAppSpecific("In-Floor Heat Systems", capId);
var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
if(capLicenseResult.getSuccess()){
  var capLicenseArr = capLicenseResult.getOutput();
  for(i in capLicenseArr){
    logDebug("License type: " + capLicenseArr[i].getLicenseType());
    if(capLicenseArr[i].getLicenseType()=="City Contractor" ||
       capLicenseArr[i].getLicenseType()=="Plumbing" ||
       capLicenseArr[i].getLicenseType()=="Contractor"){
      feeInvoice = "Y";
    }
  }
}
removeAllFees(capId);
if(duct == "Yes" || worktype == "New Construction") {
  //valuation-based fees
  addFee("MECHV_05", "BLD_MECH_VAL", "FINAL", feeQty, feeInvoice);
  addFee("MECHV_10", "BLD_MECH_VAL", "FINAL", feeQty, feeInvoice);
  addFee("MECHV_20", "BLD_MECH_VAL", "FINAL", feeQty, feeInvoice);
  addFee("MECHV_30", "BLD_MECH_VAL", "FINAL", feeQty, feeInvoice);
  //add bond verification fee if no homeowner affidavit
  if(ownerAffidavit=="CHECKED" && feeInvoice=="N"){
  removeFee("MECHV_30");
  logDebug("Mechanical bond verification fee waived");
  }
  //add processing fee
  addFee("MECHV_40", "BLD_MECH_VAL", "FINAL", feeQty, feeInvoice);
}
else {
  if(acrepl > 0){
  addFee("MECH_020", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(furrepl > 0){
  addFee("MECH_040", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(boilrepl > 0){
  addFee("MECH_060", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(uhtr > 0){
  addFee("MECH_070", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(poolhtr > 0){
  addFee("MECH_080", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(gasfpl > 0){
  addFee("MECH_090", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  if(flrheat > 0){
  addFee("MECH_100", feeSchedule, "FINAL", feeQty, feeInvoice);
  }
  addFee("MECH_140", feeSchedule, "FINAL", feeQty, feeInvoice);
  //mech bond verification
  if(ownerAffidavit=="CHECKED" && feeInvoice=="N"){
  removeFee("MECH_140");
  }
  //add state surcharge
  addFee("MECH_130", feeSchedule, "FINAL", feeQty, feeInvoice);
  //add processing fee
  addFee("MECH_150", feeSchedule, "FINAL", feeQty, feeInvoice);
}
