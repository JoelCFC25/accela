var inspGroup = "BLD_RES_DECK";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Deck Footing");
createPendingInspection(inspGroup,"Deck Framing");
createPendingInspection(inspGroup,"Deck Final");
}
