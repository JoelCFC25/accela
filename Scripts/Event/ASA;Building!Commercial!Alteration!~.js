var feeSchedule = "BLD_GENERAL";
var feeQty = 1;
var isRemodel = getAppSpecific("Tenant Remodel", capId);
//add standard fees
addFee("BLD_040", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building permit fee added");
addFee("BLD_030", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_045", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_035", feeSchedule, "FINAL", feeQty, "N");
logDebug("Building,Engineering,Fire plan review fees added");
addFee("BLD_100", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_075", feeSchedule, "FINAL", feeQty, "N");
addFee("BLD_020", feeSchedule, "FINAL", feeQty, "N");
logDebug("SAC admin, state surcharge, processing fees added");
//check for tenant remodel
if(isRemodel=="CHECKED"){
addFee("BLD_220", feeSchedule, "FINAL", feeQty, "N");
logDebug("Demolition fee for tenant remodel added");
}
