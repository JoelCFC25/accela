var inspGroup = "BLD_RES_ADDN";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
  createPendingInspection(inspGroup,"Footing");
  createPendingInspection(inspGroup,"Foundation");
  createPendingInspection(inspGroup,"Electrical Rough-In");
  createPendingInspection(inspGroup,"HVAC Rough-In");
  createPendingInspection(inspGroup,"Framing");
  createPendingInspection(inspGroup,"Insulation");
  createPendingInspection(inspGroup,"Electrical Final");
  createPendingInspection(inspGroup,"HVAC Final");
  createPendingInspection(inspGroup,"Lath");
  createPendingInspection(inspGroup,"Other");
  createPendingInspection(inspGroup,"Final");
}
if(wfTask == "Planning Review" && wfStatus == "Approved"){
  removeCapCondition("Planning COA","Tree Preservation Required");
}
