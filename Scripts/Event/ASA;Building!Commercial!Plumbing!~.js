var feeSchedule = "BLD_PLUMB";
var feeQty = 1;
var feeInvoice = "N";
var backFlow = getAppSpecific("Backflow Prevention Device", capId);
var mtr58 = getAppSpecific("5/8\" Meter", capId);
var mtr34 = getAppSpecific("3/4\" Meter", capId);
var mtr1 = getAppSpecific("1\" Meter", capId);
var mtr15 = getAppSpecific("1.5\" Meter", capId);
var mtr2 = getAppSpecific("2\" Meter", capId);
var comp2 = getAppSpecific("Compound 2\"", capId);
var comp3 = getAppSpecific("Compound 3\"", capId);
//add base plumbing fees
addFee("PLUMB_010", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("PLUMB_015", feeSchedule, "FINAL", feeQty, feeInvoice);
//add license verification and state surcharge
addFee("PLUMB_080", feeSchedule, "FINAL", feeQty, feeInvoice);
addFee("PLUMB_090", feeSchedule, "FINAL", feeQty, feeInvoice);
//check for backflow prevention
if(backFlow=="CHECKED"){
addFee("PLUMB_030", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Backflow device fee added");
}
else{
logDebug("No backflow device");
}
//check for meter deposits
if(mtr58=="CHECKED"){
addFee("PLUMB_040", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("5/8\" meter deposit added");
}
else if(mtr34=="CHECKED"){
addFee("PLUMB_050", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("3/4\" meter deposit added");
}
else if(mtr1=="CHECKED"){
addFee("PLUMB_060", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("1\" meter deposit added");
}
else if(mtr15=="CHECKED"){
addFee("PLUMB_070", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("1.5\" meter deposit added");
}
else if(mtr2=="CHECKED"){
addFee("PLUMB_072", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("2\" meter deposit added");
}
else if(comp2=="CHECKED"){
addFee("PLUMB_074", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Compound 2\" meter deposit added");
}
else if(comp3=="CHECKED"){
addFee("PLUMB_076", feeSchedule, "FINAL", feeQty, feeInvoice);
logDebug("Compound 3\" meter deposit added");
}
else{
logDebug("No meter deposit");
}
//add processing fee
addFee("PLUMB_100", feeSchedule, "FINAL", feeQty, feeInvoice);
