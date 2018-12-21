var feeSchedule = "BLD_ELEC_H";
var feeQty = 1;
//add base electrical fees
addFee("ELEC_H_10", feeSchedule, "FINAL", feeQty, "Y");
//add state surcharge
addFee("ELEC_H_50", feeSchedule, "FINAL", feeQty, "Y");
//add tech fee
addFee("ELEC_H_40", feeSchedule, "FINAL", feeQty, "Y");
