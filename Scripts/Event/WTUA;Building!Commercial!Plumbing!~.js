var inspGroup = "BLD_PLM_C";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Plumbing Rough-In");
createPendingInspection(inspGroup,"Plumbing Final");
}
