// Begin script to complete the renewal
if (wfTask == "License Issuance" && wfStatus == "Approved" && balanceDue == 0) {
	var vLicenseID;
	var vLicNum;
	var renewalCapProject;
	var vExpDate;
	var vNewExpDate;
	var vLicenseObj;

	//Get the parent license
	vLicenseID = getParentLicenseCapID(capId);
	vLicNum = vLicenseID.getCustomID();

	if (vLicenseID != null) {
		//get current expiration date.
		vLicenseObj = new licenseObject(null, vLicenseID);
		vExpDate = vLicenseObj.b1ExpDate;
		vExpDate = new Date(vExpDate);
		// Extend license expiration by 1 year
		vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
		// Update license expiration date
		logDebug("Updating Expiration Date to: " + vNewExpDate);
		vLicenseObj.setExpiration(dateAdd(vNewExpDate,0));
		//set license record expiration to active
		vLicenseObj.setStatus("Active");

		//Set renewal to complete, used to prevent more than one renewal record for the same cycle
		renewalCapProject = getRenewalCapByParentCapIDForIncomplete(vLicenseID);
		if (renewalCapProject != null) {
			renewalCapProject.setStatus("Complete");
			aa.cap.updateProject(renewalCapProject);
		}

		var refLic = getRefLicenseProf(vLicNum) // Load the reference License Professional

		// update LP record expiration date

		if (refLic) {
			refLic.setLicenseExpirationDate(aa.date.parseDate(vNewExpDate));
			aa.licenseScript.editRefLicenseProf(refLic);
			logDebug(vLicNum + ": updated License Professional record expiration to " + vNewExpDate);
		}
	}
}
// End script to complete the renewal
