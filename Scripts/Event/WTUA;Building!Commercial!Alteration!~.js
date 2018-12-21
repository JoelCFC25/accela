var inspGroup = "BLD_COMM_ALT";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Framing");
createPendingInspection(inspGroup,"Fire Final");
createPendingInspection(inspGroup,"Final");
}
if(wfTask == "Building Review" && wfStatus == "Approved" && isTaskActive("Engineering Review")){
  updateAppStatus("Awaiting Engineering","");
}
