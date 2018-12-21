var inspGroup = "BLD_MECH_C";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Mechanical Rough-In");
createPendingInspection(inspGroup,"Gas Air Test");
createPendingInspection(inspGroup,"Mechanical Final");
}
