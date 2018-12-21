//change the wfstatus and wftask to whatever issues permits or licenses
if (wfTask == "Permit Issuance" && wfStatus == "Issued") {
  checkFeeExistForRecord(capId);
}
function checkFeeExistForRecord (pCapId) {
  try {
    logDebug("checkFeeExistForRecord start");
    var vFeeArrayResult = aa.finance.getFeeItemByCapID(pCapId);
    if (vFeeArrayResult && vFeeArrayResult.getSuccess()) {
      var vFeesCount = vFeeArrayResult.getOutput().length;
      logDebug("Fee Count:" + vFeesCount);
      if (vFeesCount < 1) {
        cancel = true;
        showMessage = true;
        comment("At least 1 fee must exist before the permit can be issued.");
      }
    }
  } catch (err) {
                  logDebug("Error** checkFeeExistForRecord()" + err.message);
  }
}
