var strucType = getAppSpecific("Tent", capId);
if(strucType=="No"){
  if(wfTask=="Application Submittal" && wfStatus == "Accepted"){
    closeTask("Plans Distribution","Routed for Review","Building review only","")
    deactivateTask("Fire Review");
  }
  if(wfTask=="Building Review" && wfStatus == "Approved"){
    closeTask("Plans Coordination","Ready to Issue","Building review only","")
  }
}
