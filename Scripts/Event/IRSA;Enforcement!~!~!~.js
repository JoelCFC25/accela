if(inspResult=="Compliant" || inspResult=="Compliant After 1st Action"){
  updateAppStatus("Closed","Compliant inspection: Case closed");
  updateTask("Case Status","Closed","Closed due to inspection result","")
}
if(inspResult=="Non-Compliant"){
  updateAppStatus("In Violation","Failed inspection");
}
if(inspResult=="Letter Sent"){
  updateTask("Case Status","Letter","","Updated by inspection result")
}
