var inspGroup = "BLD_COMM";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Footings");
createPendingInspection(inspGroup,"Foundation");
createPendingInspection(inspGroup,"Gas Air Test");
createPendingInspection(inspGroup,"Fireplace");
createPendingInspection(inspGroup,"Framing");
createPendingInspection(inspGroup,"Fire Wall");
createPendingInspection(inspGroup,"Insulation");
createPendingInspection(inspGroup,"Special Inspections");
createPendingInspection(inspGroup,"Final");
}
if(wfTask == "Application Submittal" && wfStatus == "Accepted - Plan Review Req"){
  if (AInfo['ParcelAttribute.STATE HIGHWAY'] == "Yes") {
    addStdCondition("State Highway","Contact MnDOT");
    sendCityEngineer_MNDOTNotification();
  }
  if (AInfo['ParcelAttribute.COUNTY ROAD'] == "Yes") {
    addStdCondition("County Road","County Road");
    sendCityEngineer_CountyNotification();
  }
}
if(wfTask == "Building Review" && wfStatus == "Approved" && isTaskActive("Engineering Review")){
  updateAppStatus("Awaiting Engineering","");
}
if(wfTask == "Engineering Review"){
  var engStaff = null;
  var engPhone = null;
  var engEmail = null;
  if(wfStaffUserID=="DTURNER"){
    engStaff = "Dan Turner";
    engPhone = "651-792-7045";
    engEmail = "dan.turner@cityofroseville.com";
  } else if (wfStaffUserID=="KJONES"){
    engStaff = "Engineering Department";
    engPhone = "651-792-7004";
    engEmail = "engineering@cityofroseville.com";
  } else if (wfStaffUserID=="AALQUDAH"){
    engStaff = "Abe Al-Qudah";
    engPhone = "651-792-7046";
    engEmail = "abe.al-qudah@cityofroseville.com";
  } else if (wfStaffUserID=="DSTEVENS"){
    engStaff = "Dana Stevens";
    engPhone = "651-792-7047";
    engEmail = "dana.stevens@cityofroseville.com";
  }
  sendEngineeringReviewNotification(engStaff,engPhone,engEmail);
}
