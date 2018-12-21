var permitNum = capId.getCustomID();
var toEmail = null;
var toContact = getContactObj(capId,"Applicant");
if (toContact) {
  toEmail = toContact["email"];
  }
if(toEmail) {
  logDebug("Email address exists for applicant");
  email(toEmail,"permits@cityofroseville.com","Balance due on permit",
        "There is now a balance due on permit " + permitNum ". Visit the Roseville ePermits site at http://www.cityofroseville.com/ePermits to pay so the permit can be issued.");
}
