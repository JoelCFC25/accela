var mtr58 = getAppSpecific("5/8\" Meter", capId);
var mtr34 = getAppSpecific("3/4\" Meter", capId);
var mtr1 = getAppSpecific("1\" Meter", capId);
var mtr15 = getAppSpecific("1.5\" Meter", capId);
var permitNum = capId.getCustomID();
if(inspType == "Plumbing Final" && inspResult == "Passed") {
  if(mtr58=="CHECKED" || mtr34=="CHECKED" || mtr1=="CHECKED" || mtr15=="CHECKED"){
    closeTask("Inspection","Final Inspection Complete (Meter Required)","Closed by inspection result","Note");
    email("meters@cityofroseville.com","permits@cityofroseville.com","Plumbing permit " +
          permitNum + " has passed its final inspection",
          "Plumbing permit " + permitNum + " has passed its final inspection. A water meter deposit was taken on this permit when issued. The new water meter can now be installed.")
  }
  else {
    closeTask("Inspection","Final Inspection Complete","Closed by inspection result","Note");
  }
}
