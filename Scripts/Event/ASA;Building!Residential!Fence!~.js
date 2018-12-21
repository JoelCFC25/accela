var feeCode = "FNC_30";
var feeSchedule = "BLD_FENCE";
var feeQty = 0;
var vcity = false;
removeFee(feeCode,"FINAL")
		var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
		if(capLicenseResult.getSuccess()){
			var capLicenseArr = capLicenseResult.getOutput();
			for(i in capLicenseArr){

				logDebug("License type: " + capLicenseArr[i].getLicenseType());
				if(capLicenseArr[i].getLicenseType() !="City Contractor"){
					vcity = true;
					feeQty++;
				}
			}
			if(vcity){
				addFee(feeCode, feeSchedule, "FINAL", feeQty, "N");
			}
		}
