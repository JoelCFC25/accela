var demoType = getAppSpecific("Demolition Type", capId);
if(demoType=="Interior Only"){
  if(wfTask=="Application Submittal" && wfStatus == "Accepted"){
    closeTask("Plans Distribution","Routed for Review","Building review only","")
    deactivateTask("Engineering Review");
  }
  if(wfTask=="Building Review" && wfStatus == "Approved"){
    closeTask("Plans Coordination","Ready to Issue","Building review only","")
  }
}
