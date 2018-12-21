var inspGroup = "ENG_EROSION";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Initial");
createPendingInspection(inspGroup,"7 Day");
createPendingInspection(inspGroup,"Half-Inch Rainfall");
}
