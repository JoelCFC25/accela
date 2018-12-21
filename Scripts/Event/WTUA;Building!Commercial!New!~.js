var inspGroup = "BLD_COMM";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Footings");
createPendingInspection(inspGroup,"Foundation");
createPendingInspection(inspGroup,"Gas Air Test");
createPendingInspection(inspGroup,"Fireplace");
createPendingInspection(inspGroup,"Framing");
createPendingInspection(inspGroup,"Fire Wall");
createPendingInspection(inspGroup,"Insulation");
createPendingInspection(inspGroup,"Special Inspections");
createPendingInspection(inspGroup,"Engineering Final");
createPendingInspection(inspGroup,"Fire Final");
createPendingInspection(inspGroup,"Building Final");
}
if(wfTask == "Application Submittal" && wfStatus == "Accepted - Plan Review Req"){
  if (AInfo['ParcelAttribute.STATE HIGHWAY'] == "Yes") {
  addStdCondition("State Highway","Contact MnDOT");
  }
  if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
  addStdCondition("County Road","County Road");
  }
}
