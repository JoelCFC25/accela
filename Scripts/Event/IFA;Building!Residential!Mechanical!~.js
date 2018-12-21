var conArray = getContactArray(capId);
var permitNum = capId.getCustomID();
for (thisCon in conArray) {
  conEmail = null;
  b3Contact = conArray[thisCon];
  if (exists(b3Contact["contactType"],"Applicant"))
  conEmail = b3Contact["email"];

if (conEmail) {
  email(conEmail,"permits@cityofroseville.com","Roseville ePermits: Notification of balance due","There is now a balance due on permit " + permitNum + ". Visit the Roseville ePermits site at http://www.cityofroseville.com/ePermits to pay so the permit can be issued.");
  }
}
