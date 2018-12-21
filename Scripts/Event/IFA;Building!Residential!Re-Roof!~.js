var permitNum = capId.getCustomID();
updateAppStatus("Ready to Issue","Fees invoiced");
emailContact("Roseville ePermits: Notification of permit balance due","There is now a balance due of $" + balanceDue + " on permit " + permitNum + ". Visit the Roseville ePermits site at http://www.cityofroseville.com/ePermits to pay so the permit can be issued.");
