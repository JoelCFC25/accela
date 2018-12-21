var inspGroup = "BLD_RES_ALTR";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Electrical Rough-In");
createPendingInspection(inspGroup,"HVAC Rough-In");
createPendingInspection(inspGroup,"Framing");
createPendingInspection(inspGroup,"Insulation");
createPendingInspection(inspGroup,"Electrical Final");
createPendingInspection(inspGroup,"HVAC Final");
createPendingInspection(inspGroup,"Other");
createPendingInspection(inspGroup,"Final");
}
