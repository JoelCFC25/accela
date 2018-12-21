var inspGroup = "BLD_MECH_R";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Mechanical Rough-In");
createPendingInspection(inspGroup,"Gas Air Test");
createPendingInspection(inspGroup,"Mechanical Final");
}
