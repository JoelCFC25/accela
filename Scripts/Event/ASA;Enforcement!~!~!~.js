var ircStatus = getAppSpecific("IRC", capId);
var suspRental = getAppSpecific("Suspected Rental", capId);
if(ircStatus=="CHECKED") {
  updateAppStatus("Closed", "IRC: Automatically closed");
  logDebug("Immediate Response Case closed");
}
if(suspRental=="CHECKED") {
  createChild("Enforcement","Suspected Rental","NA","NA","");
  logDebug("Created Suspected Rental case");
}
var inspGroup = "ENF_GEN";
createPendingInspection(inspGroup,"Initial Investigation");
createPendingInspection(inspGroup,"Follow-Up Investigation");
createPendingInspection(inspGroup,"Follow-Up Investigation");
createPendingInspection(inspGroup,"Follow-Up Investigation");
createPendingInspection(inspGroup,"Follow-Up Investigation");
createPendingInspection(inspGroup,"Correspondence");
createPendingInspection(inspGroup,"Correspondence");
createPendingInspection(inspGroup,"Correspondence");
createPendingInspection(inspGroup,"Correspondence");
createPendingInspection(inspGroup,"Posting");
