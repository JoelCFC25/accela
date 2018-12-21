var inspGroup = "BLD_SEWER";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Underground");
createPendingInspection(inspGroup,"Sewer Final");
}
