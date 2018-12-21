var hasTent = getAppSpecific("Tent", capId);
var hasElec = getAppSpecific("Electric", capId);
if(hasTent=="Yes") {
  createChild("Building","Commercial","Temporary Structure","NA","");
  logDebug("Created Temp Structure building permit");
}
if(hasElec=="Yes") {
  createChild("Building","Electrical","Contractor","NA","");
  logDebug("Created electrical permit");
}
