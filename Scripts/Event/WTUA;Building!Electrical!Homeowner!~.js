var inspGroup = "BLD_ELE_R";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Rough-In");
createPendingInspection(inspGroup,"Electrical Final");
}
