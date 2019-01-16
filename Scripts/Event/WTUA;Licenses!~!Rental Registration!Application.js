if(wfTask == "Registration Review" && wfStatus == "Registered"){
  var newLic = null;
  var newLicId = null;
  var newLicIdString = null;
  var monthsToInitialExpire = 12;
  newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "Registration",null);
  newLicIdString = newLicId.getCustomID();
  updateAppStatus("Active","Originally Issued",newLicId);
  editAppName(null,newLicId);
  tmpNewDate = dateAddMonths(null, monthsToInitialExpire);
  thisLic = new licenseObject(newLicIdString,newLicId);
  thisLic.setExpiration(dateAdd(tmpNewDate,0));
  thisLic.setStatus("Active");
  changeCapContactTypes("Property Owner","Registration Holder", newLicId);
  copyAppSpecific(newLicId);
}
if(wfTask == "Registration Review" && wfStatus == "Exempt"){
  var newLic = null;
  var newLicId = null;
  var newLicIdString = null;
  var monthsToInitialExpire = 12;
  newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "Registration",null);
  newLicIdString = newLicId.getCustomID();
  updateAppStatus("Exempt","Originally Issued",newLicId);
  editAppName(null,newLicId);
  tmpNewDate = dateAddMonths(null, monthsToInitialExpire);
  thisLic = new licenseObject(newLicIdString,newLicId);
  thisLic.setExpiration(dateAdd(tmpNewDate,0));
  thisLic.setStatus("Active");
  changeCapContactTypes("Property Owner","Registration Holder", newLicId);
  copyAppSpecific(newLicId);
}
