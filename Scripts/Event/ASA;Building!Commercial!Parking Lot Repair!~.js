var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var workType = getAppSpecific("Work Type", capId);
//add standard fees
addFee("PARK_10", feeSchedule, "FINAL", feeQty, "Y");
addFee("PARK_20", feeSchedule, "FINAL", feeQty, "Y");
addFee("PARK_30", feeSchedule, "FINAL", feeQty, "Y");
if(workType=="Repair / Mill and Overlay"){
  closeTask("Application Submittal","Accepted - Plan Review Not Req","Can be issued immediately","");
  deactivateTask("Engineering Review");
  deactivateTask("Planning Review");
  deactivateTask("Plans Coordination");
  activateTask("Permit Issuance");
}
else{
  closeTask("Application Submittal","Accepted - Plan Review Req","Engineering and Planning review required","");
  if (AInfo['ParcelAttribute.STATE HIGHWAY'] == "Yes") {
  addStdCondition("State Highway","Contact MnDOT");
  }
  if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
  addStdCondition("County Road","County Road");
  }
}
