var inspGroup = "BLD_RES_GAR";
if(wfTask == "Permit Issuance" && wfStatus == "Issued"){
createPendingInspection(inspGroup,"Garage Foundation");
createPendingInspection(inspGroup,"Electrical Rough-In");
createPendingInspection(inspGroup,"Framing");
createPendingInspection(inspGroup,"Electrical Final");
createPendingInspection(inspGroup,"Garage Final");
}
if(wfTask == "Engineering Review"){
  var engStaff = null;
  var engPhone = null;
  var engEmail = null;
  if(wfStaffUserID=="DTURNER"){
    engStaff = "Dan Turner";
    engPhone = "651-792-7045";
    engEmail = "dan.turner@cityofroseville.com";
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
