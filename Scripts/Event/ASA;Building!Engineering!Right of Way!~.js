var feeSchedule = "ENG_ROW";
var holeQty = getAppSpecific("Number of Holes", capId);
var trenchQty = getAppSpecific("Trench", capId);
var boringQty = getAppSpecific("Boring", capId);
var aerialQty = getAppSpecific("Aerial Obstruction", capId);
var contQty = getAppSpecific("Roll-Off Containers", capId);
//add standard fees
if((trenchQty > 0 || boringQty > 0) && holeQty==null){
//now add $400 for a hole
logDebug("Single Hole Fee added");
addFee("ROW_025", feeSchedule, "FINAL", 1, "N");
}
if(holeQty > 0){
addFee("ROW_025", feeSchedule, "FINAL", 1, "N");
logDebug("Hole Fee (times user input) added");
}
if(aerialQty > 0){
addFee("ROW_050", feeSchedule, "FINAL", 1, "N");
logDebug("Aerial Obstruction fee added");
}
if(contQty > 0){
addFee("ROW_020", feeSchedule, "FINAL", 1, "N");
logDebug("Roll-Off Container fee added");
}
if(trenchQty > 0){
addFee("ROW_030", feeSchedule, "FINAL", 1, "N");
logDebug("Trench fee added");
}
if(boringQty > 0){
addFee("ROW_040", feeSchedule, "FINAL", 1, "N");
logDebug("Boring fee added");
}
