var feeSchedule = "FIRE_VALUATION";
var feeQty = 1;
var heads = getAppSpecific("Total Number of Heads", capId);
if(heads < 20){
removeAllFees(capId);
addFee("FIRE_010", feeSchedule, "FINAL", feeQty, "Y");
//add state surcharge
addFee("FIRE_030", feeSchedule, "FINAL", feeQty, "Y");
//add tech fee
addFee("FIRE_040", feeSchedule, "FINAL", feeQty, "Y");
logDebug("Fewer than 20 heads: Plan review fee dropped and all fees invoiced");
}
