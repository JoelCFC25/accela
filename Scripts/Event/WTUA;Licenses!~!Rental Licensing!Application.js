if(wfTask == "License Issuance" && wfStatus == "Issued"){
  var newLic = null;
  var newLicId = null;
  var newLicIdString = null;
  var newLicenseType = "Rental";
  var monthsToInitialExpire = 12;
  newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);
  newLicIdString = newLicId.getCustomID();
  updateAppStatus("Active","Originally Issued",newLicId);
  editAppName(null,newLicId);
  tmpNewDate = dateAddMonths(null, monthsToInitialExpire);
  thisLic = new licenseObject(newLicIdString,newLicId);
  thisLic.setExpiration(dateAdd(tmpNewDate,0));
  thisLic.setStatus("Active");
  changeCapContactTypes("Property Owner","License Holder", newLicId);
  copyAppSpecific(newLicId);
}
