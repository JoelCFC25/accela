try {

if (wfStatus == 'Approved') {
	saveId = capId;
	parentLicenseCAPID = getParentCapIDForReview(capId);
	var rentalStatus = getAppSpecific("Rental Status", capId);
	comment('ParentLic CapID: ' + parentLicenseCAPID);
	capId = parentLicenseCAPID;
	if (parentLicenseCAPID) {
		pCapIdSplit = String(parentLicenseCAPID).split('-');
		pCapIdObj = aa.cap.getCapID(pCapIdSplit[0], pCapIdSplit[1], pCapIdSplit[2]).getOutput();
		pCapIdCustomId = pCapIdObj.getCustomID();
	}
	if (parentLicenseCAPID) {
		comment('Parent Custom ID: ' + pCapIdCustomId);
	}
	if (rentalStatus == "Rented"){
		updateAppStatus('Active', 'Renewal approved by: ' + capIDString, parentLicenseCAPID);
	}
	if (rentalStatus == "Exempt"){
		updateAppStatus('Exempt', 'Renewal approved by: ' + capIDString, parentLicenseCAPID);
	}
	updateAppStatus('Renewed', 'Renewal Approved', saveId);

  // Figure out new EXPIRATION Date
	lic = new licenseObject(null, capId); comment("Get License Object");
	lic.setStatus('Active'); comment("Set Reg Exp Status to Active");
        b1ExpResult = aa.expiration.getLicensesByCapID(parentLicenseCAPID);
        this.b1Exp = b1ExpResult.getOutput();
        tmpDate = this.b1Exp.getExpDate();
        if (tmpDate){
             this.b1ExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
             comment("This Registration expires on " + this.b1ExpDate);

	     //default to 12 months from today
             numberOfMonths = 12; // 0 months because the EXP Code bumps it up 12 months
             // if Semi, change to 6 months form today
             newExpDate = dateAddMonths(this.b1ExpDate,numberOfMonths);
	           comment("newExpDate = "+newExpDate);
             lic.setExpiration(newExpDate);
        }
	capId = saveId;

  //Set renewal to complete, used to prevent more than one renewal record for the same cycle
	renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentLicenseCAPID);
	if (renewalCapProject != null) {
	  renewalCapProject.setStatus("Complete");
	  aa.cap.updateProject(renewalCapProject);
  }
  logDebug('Running WTUA4Renewal');
	aa.runScript('WORKFLOWTASKUPDATEAFTER4RENEW');
	logDebug('Messages in WTUA4Renewal:<br>' + aa.env.getValue('ScriptReturnMessage'));
}

  if (wfStatus == 'Denied') {
  	saveId = capId;
  	parentLicenseCAPID = getParentCapIDForReview(capId);
  	comment('ParentLic CapID: ' + parentLicenseCAPID);
  	capId = parentLicenseCAPID;
  	if (parentLicenseCAPID) {
  		pCapIdSplit = String(parentLicenseCAPID).split('-');
  		pCapIdObj = aa.cap.getCapID(pCapIdSplit[0], pCapIdSplit[1], pCapIdSplit[2]).getOutput();
  		pCapIdCustomId = pCapIdObj.getCustomID();
  	}
  	if (parentLicenseCAPID) {
  		comment('Parent Custom ID: ' + pCapIdCustomId);
  	}
  	updateAppStatus('Denied', 'Renewal denied by: ' + capIDString, parentLicenseCAPID);
  }
}
catch (err) {
	logDebug("A JavaScript error occured: " + err.message + " at line " + err.lineNumber);
}
