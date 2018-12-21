var inspGroup = "BLD_WTR_CONN";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Underground");
createPendingInspection(inspGroup,"Hydrostatic/Conductivity");
createPendingInspection(inspGroup,"Fire Marshal");
createPendingInspection(inspGroup,"Water Final");
}
