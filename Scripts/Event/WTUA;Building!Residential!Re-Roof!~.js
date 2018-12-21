var inspGroup = "BLD_RES_RRF";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
editTaskComment("Permit Issuance","Tearoff and reroof. Final inspection only. Contractor to schedule inspection when roof is completed. Contractor to email photos of all areas of ice barrier installation to pics@cityofroseville.com *OR* print and leave attached to the permit card for review by inspector at final inspection.");
createPendingInspection(inspGroup,"Roof Final");
}
