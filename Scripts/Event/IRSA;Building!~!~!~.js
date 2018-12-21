//extend permit expiration by 6 months when inspection occurs
editAppSpecific("Permit Expiration Date", dateAdd(null,180));
licEditExpInfo(null,dateAdd(null,180));
if(inspType == "Final" && inspResult == "Passed" && capStatus=="Expired"){
  updateAppStatus("Finaled","Updated by inspection result");
}
