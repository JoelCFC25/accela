showdebug = 3;
var permitNum = capId.getCustomID();
var inspObj = aa.inspection.getInspection(capId, inspId).getOutput();
if (publicUser) {
  if(inspObj) {
    var inspComment = inspObj.getInspectionComments();
    email("joel.koepp@cityofroseville.com","permits@cityofroseville.com","Online inspection request received",
          "An inspection request has been made online for permit " + permitNum + ": " + inspComment)
  }
}
