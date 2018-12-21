var feeSchedule = "BLD_MECH_VAL";
var feeQty = 1;
var valuation = getAppSpecific("Valuation", capId);
//add base mechanical fees
addFee("MECHV_05", feeSchedule, "FINAL", feeQty, "N");
addFee("MECHV_10", feeSchedule, "FINAL", feeQty, "N");
//add bond verification
addFee("MECHV_30", feeSchedule, "FINAL", feeQty, "N");
//add state surcharge
addFee("MECHV_20", feeSchedule, "FINAL", feeQty, "N");
//add tech fee
addFee("MECHV_40", feeSchedule, "FINAL", feeQty, "N");
