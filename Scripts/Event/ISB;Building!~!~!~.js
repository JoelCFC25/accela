if (capStatus != "Issued" && capStatus != "Finaled" && capStatus != "Expired") {
  showMessage = true;
  cancel = true ;
  comment("Cannot schedule an inspection--permit has not been issued");
}
