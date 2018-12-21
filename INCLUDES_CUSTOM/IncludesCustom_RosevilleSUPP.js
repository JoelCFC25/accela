/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be
	    available to all master scripts
|
| Notes   : createRefLicProf - override to default the state if one is not provided
|
|         : createRefContactsFromCapContactsAndLink - testing new ability to link public users to new ref contacts
/------------------------------------------------------------------------------------------------------*/

/*************************************************************************************************/

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

function getPrimaryAddress() {
  var primaryAddressObj = aa.address.getPrimaryAddressByCapID(capId,"Y").getOutput();
	if (primaryAddressObj) {
		var primaryAddress = primaryAddressObj.getAddressModel();
	  return primaryAddress;
	}
}

function runReportTest(aaReportName)
{
x = "test param"
currentUserID = "ADMIN";
setCode = "X";
       var bReport = false;
       var reportName=aaReportName;
       report = aa.reportManager.getReportModelByName(reportName);
       report = report.getOutput();
       var permit = aa.reportManager.hasPermission(reportName,currentUserID);
       if (permit.getOutput().booleanValue())
       {
              var parameters = aa.util.newHashMap();
              parameters.put("BatchNumber", setCode);
              //report.setReportParameters(parameters);
              var msg = aa.reportManager.runReport(parameters,report);
              aa.env.setValue("ScriptReturnCode", "0");
              aa.env.setValue("ScriptReturnMessage", msg.getOutput());
       }
}

function createRefLicProf(rlpId,rlpType,pContactType)
	{
	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess())
		{ conArr = capContResult.getOutput();  }
	else
		{
		logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
		}

	if (!conArr.length)
		{
		logDebug ("**WARNING: No contact available");
		return false;
		}

	var newLic = getRefLicenseProf(rlpId)

	if (newLic)
		{
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
		}
	else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//get contact record
	if (pContactType==null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else
		{
		var contFound = false;
		for (yy in conArr)
			{
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
				{
				cont = conArr[yy];
				contFound = true;
				break;
				}
			}
		if (!contFound)
			{
			logDebug ("**WARNING: No Contact found of type: "+pContactType);
			return false;
			}
		}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState(addr.getState());
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"]) 		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"]) 		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"]) 	newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"]) 			newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"]) 	newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if(addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("MN"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
		{
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		return true;
		}
	else
		{
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		return false;
		}
	}


function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];

	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();

	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());

	   if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   	{
	   	if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
		}

	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}

	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;

	   var refContactType = "";

	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}

	   var refContactNum = con.getCapContactModel().getRefContactNumber();

	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);

	   						var a = p.getAttributes();

							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}

	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());

			if (!r.getSuccess())
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}

	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}

				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);

				// Need to link to an existing public user.

			    var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
			    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			        var userModel = getUserResult.getOutput();
			        logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

					if (refPeopleId)	{
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
						}
					}
				}

			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

		    ccm.setRefContactNumber(refPeopleId);
		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact
	}  // end for each CAP contact
} // end function

function reversePayment() { logDebug("hello") }


  function addToASITable(tableName,tableValues) // optional capId
  	{
	//  tableName is the name of the ASI table
	//  tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
  	itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)

	if (!tssmResult.getSuccess())
		{ logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var col = tsm.getColumns();
	var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
	var coli = col.iterator();

	while (coli.hasNext())
		{
		colname = coli.next();

		if (!tableValues[colname.getColumnName()]) {
			logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
			tableValues[colname.getColumnName()] = "";
			}

		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
			{
			fld.add(tableValues[colname.getColumnName()].fieldValue);
			fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
			}
		else // we are passed a string
			{
			fld.add(tableValues[colname.getColumnName()]);
			fld_readonly.add(null);
			}
		}

	tsm.setTableField(fld);
	tsm.setReadonlyField(fld_readonly); // set readonly field

	addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
	if (!addResult .getSuccess())
		{ logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
	else
		logDebug("Successfully added record to ASI Table: " + tableName);
	}

function addASITable(tableName, tableValueArray) // optional capId
{
	//  tableName is the name of the ASI table
	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
	var itemCap = capId
		if (arguments.length > 2)
			itemCap = arguments[2]; // use cap ID specified in args

		var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

		if (!tssmResult.getSuccess()) {
			logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
			return false
		}

	var tssm = tssmResult.getOutput();
	var tsm = tssm.getAppSpecificTableModel();
	var fld = tsm.getTableField();
	var fld_readonly = tsm.getReadonlyField(); // get Readonly field

	for (thisrow in tableValueArray) {

		var col = tsm.getColumns()
			var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();

			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof(tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") // we are passed an asiTablVal Obj
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				//fld_readonly.add(null);
			} else // we are passed a string
			{
				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
				fld_readonly.add(null);
			}
		}

		tsm.setTableField(fld);

		tsm.setReadonlyField(fld_readonly);

	}

	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

	if (!addResult.getSuccess()) {
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
		return false
	} else
		logDebug("Successfully added record to ASI Table: " + tableName);

}


function getLatestScheduledDate() {
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess()) {
		inspList = inspResultObj.getOutput();
		var array = new Array();
		var j = 0;
		for (i in inspList) {
			if (inspList[i].getInspectionStatus().equals("Scheduled")) {
				array[j++] = aa.util.parseDate(inspList[i].getInspection().getScheduledDate());
			}
		}

		var latestScheduledDate = array[0];
		for (k = 0; k < array.length; k++) {
			temp = array[k];
			logDebug("----------array.k---------->" + array[k]);
			if (temp.after(latestScheduledDate)) {
				latestScheduledDate = temp;
			}
		}
		return latestScheduledDate;
	}
	return false;
}


function copyContactsWithAddress(pFromCapId, pToCapId)
{
   // Copies all contacts from pFromCapId to pToCapId and includes Contact Address objects
   //
   if (pToCapId == null)
   var vToCapId = capId;
   else
   var vToCapId = pToCapId;

   var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
   var copied = 0;
   if (capContactResult.getSuccess())
   {
      var Contacts = capContactResult.getOutput();
      for (yy in Contacts)
      {
         var newContact = Contacts[yy].getCapContactModel();

         var newPeople = newContact.getPeople();
         // aa.print("Seq " + newPeople.getContactSeqNumber());

         var addressList = aa.address.getContactAddressListByCapContact(newContact).getOutput();
         newContact.setCapID(vToCapId);
         aa.people.createCapContact(newContact);
         newerPeople = newContact.getPeople();
         // contact address copying
         if (addressList)
         {
            for (add in addressList)
            {
               var transactionAddress = false;
               contactAddressModel = addressList[add].getContactAddressModel();

			   logDebug("contactAddressModel.getEntityType():" + contactAddressModel.getEntityType());

               if (contactAddressModel.getEntityType() == "CAP_CONTACT")
               {
                  transactionAddress = true;
                  contactAddressModel.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
               }
               // Commit if transaction contact address
               if(transactionAddress)
               {
                  var newPK = new com.accela.orm.model.address.ContactAddressPKModel();
                  contactAddressModel.setContactAddressPK(newPK);
                  aa.address.createCapContactAddress(vToCapId, contactAddressModel);
               }
               // Commit if reference contact address
               else
               {
                  // build model
                  var Xref = aa.address.createXRefContactAddressModel().getOutput();
                  Xref.setContactAddressModel(contactAddressModel);
                  Xref.setAddressID(addressList[add].getAddressID());
                  Xref.setEntityID(parseInt(newerPeople.getContactSeqNumber()));
                  Xref.setEntityType(contactAddressModel.getEntityType());
                  Xref.setCapID(vToCapId);
                  // commit address
                  commitAddress = aa.address.createXRefContactAddress(Xref.getXRefContactAddressModel());
				  if(commitAddress.getSuccess())
				  {
					commitAddress.getOutput();
					logDebug("Copied contact address");
				  }
               }
            }
         }
         // end if
         copied ++ ;
         logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
      }
   }
   else
   {
      logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
      return false;
   }
   return copied;
}


function changeCapContactTypes(origType, newType)
{
   // Renames all contacts of type origType to contact type of newType and includes Contact Address objects
   //
	var vCapId = capId;
	if (arguments.length == 3)
		vCapId = arguments[2];

   var capContactResult = aa.people.getCapContactByCapID(vCapId);
   var renamed = 0;
   if (capContactResult.getSuccess())
   {
      var Contacts = capContactResult.getOutput();
      for (yy in Contacts)
      {
         var contact = Contacts[yy].getCapContactModel();

         var people = contact.getPeople();
		 var contactType = people.getContactType();
          aa.print("Contact Type " + contactType);

		if(contactType==origType)
		{

			var contactNbr = people.getContactSeqNumber();
			var editContact = aa.people.getCapContactByPK(vCapId, contactNbr).getOutput();
			editContact.getCapContactModel().setContactType(newType)

			aa.print("Set to: " + people.getContactType());
        	 renamed ++ ;

			var updContactResult = aa.people.editCapContact(editContact.getCapContactModel());
			logDebug("contact " + updContactResult);
			logDebug("contact.getSuccess() " + updContactResult.getSuccess());
			logDebug("contact.getOutput() " + updContactResult.getOutput());
			updContactResult.getOutput();
			logDebug("Renamed contact from " + origType + " to " + newType);
		}
      }
   }
   else
   {
      logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
      return false;
   }
   return renamed;
}

function checkWorkflowTaskAndStatus(capId, workflowTask, taskStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: "+wfObj );
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		var status = fTask.getDisposition();
		var taskDesc = fTask.getTaskDescription();

		if(status != null && taskDesc != null && taskDesc.equals(workflowTask) && status.equals(taskStatus))
			return true;
	}

	return false;
}


function associatedRefContactWithRefLicProf(capIdStr,refLicProfSeq,servProvCode,auditID)
{
	var contact = getLicenseHolderByLicenseNumber(capIdStr);
	if(contact && contact.getRefContactNumber())
	{
		linkRefContactWithRefLicProf(parseInt(contact.getRefContactNumber()),refLicProfSeq,servProvCode,auditID)
	}
	else
	{
		logMessage("**ERROR:cannot find license holder of license");
	}
}

function linkRefContactWithRefLicProf(refContactSeq,refLicProfSeq,servProvCode,auditID)
	{

		if(refContactSeq&&refLicProfSeq&&servProvCode&&auditID)
		{
			var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
			xRefContactEntity.setServiceProviderCode(servProvCode);
			xRefContactEntity.setContactSeqNumber(refContactSeq);
			xRefContactEntity.setEntityType("PROFESSIONAL");
			xRefContactEntity.setEntityID1(refLicProfSeq);
			var auditModel = xRefContactEntity.getAuditModel();
			auditModel.setAuditDate(new Date());
			auditModel.setAuditID(auditID);
			auditModel.setAuditStatus("A")
			xRefContactEntity.setAuditModel(auditModel);
			var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
			var existedModel = xRefContactEntityBusiness.getXRefContactEntityByUIX(xRefContactEntity);
			if(existedModel.getContactSeqNumber())
			{
				//aa.print("The professional license have already linked to contact.");
				logMessage("License professional link to reference contact successfully.");
			}
			else
			{
				var XRefContactEntityCreatedResult = xRefContactEntityBusiness.createXRefContactEntity(xRefContactEntity);
				if (XRefContactEntityCreatedResult)
				{
					//aa.print("License professional link to reference contact successfully.");
					logMessage("License professional link to reference contact successfully.");
				}
				else
				{
					//aa.print("**ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
					logMessage("**ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
				}
			}
		}
		else
		{
			//aa.print("**ERROR:Some Parameters are empty");
			logMessage("**ERROR:Some Parameters are empty");
		}

	}


function getConatctAddreeByID(contactID, vAddressType)
 {
	var conArr = new Array();
	var capContResult = aa.people.getCapContactByContactID(contactID);

	if (capContResult.getSuccess())
	{
		conArr = capContResult.getOutput();
		for(contact in conArr)
		{
			cont = conArr[contact];

			return getContactAddressByContact(cont.getCapContactModel(),vAddressType);
		}
	}
 }

 function getContactAddressByContact(contactModel,vAddressType)
 {
	var xrefContactAddressBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.XRefContactAddressBusiness").getOutput();
	var contactAddressArray = xrefContactAddressBusiness.getContactAddressListByCapContact(contactModel);
	for(i=0;i<contactAddressArray.size();i++)
	{
		var contactAddress = contactAddressArray.get(i);
		if(vAddressType.equals(contactAddress.getAddressType()))
		{
			return contactAddress;
		}
	}
 }

function copyContactAddressToLicProf(contactAddress, licProf)
 {
	 if(contactAddress&&licProf)
	 {
		licProf.setAddress1(contactAddress.getAddressLine1());
		licProf.setAddress2(contactAddress.getAddressLine2());
		licProf.setAddress3(contactAddress.getAddressLine3());
		licProf.setCity(contactAddress.getCity());
		licProf.setState(contactAddress.getState());
		licProf.setZip(contactAddress.getZip());
		licProf.getLicenseModel().setCountryCode(contactAddress.getCountryCode());	 }
 }

function associatedLicensedProfessionalWithPublicUser(licnumber, publicUserID)
{
    var mylicense = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licnumber);
    var puser = aa.publicUser.getPublicUserByPUser(publicUserID);
    if(puser.getSuccess())
        aa.licenseScript.associateLpWithPublicUser(puser.getOutput(),mylicense.getOutput());
}

function taskCloseAllAdjustBranchtaskExcept(e, t) {
	var n = new Array;
	var r = false;
	if (arguments.length > 2) {
		for (var i = 2; i < arguments.length; i++)
			n.push(arguments[i])
	} else
		r = true;
	var s = aa.workflow.getTasks(capId);
	if (s.getSuccess())
		var o = s.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s.getErrorMessage());
		return false
	}
	var u;
	var a;
	var f;
	var l = aa.date.getCurrentDate();
	var c = " ";
	var h;
	for (i in o) {
		u = o[i];
		h = u.getTaskDescription();
		a = u.getStepNumber();
		if (r) {
			aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
			logMessage("Closing Workflow Task " + h + " with status " + e);
			logDebug("Closing Workflow Task " + h + " with status " + e)
		} else {
			if (!exists(h, n)) {
				aa.workflow.handleDisposition(capId, a, e, l, c, t, systemUserObj, "B");
				logMessage("Closing Workflow Task " + h + " with status " + e);
				logDebug("Closing Workflow Task " + h + " with status " + e)
			}
		}
	}
}

function getLicenseHolderByLicenseNumber(capIdStr)
{
  var capContactResult = aa.people.getCapContactByCapID(capIdStr);
  if (capContactResult.getSuccess())
    {
    var Contacts = capContactResult.getOutput();
    for (yy in Contacts)
    {
  var contact = Contacts[yy].getCapContactModel();
  var contactType = contact.getContactType();
  if(contactType.toUpperCase().equals("LICENSE HOLDER") && contact.getRefContactNumber()) {
    return contact;
  }
    }
     }
}

function taskCloseAllExcept(pStatus,pComment)
	{
	// Closes all tasks in CAP with specified status and comment
	// Optional task names to exclude
	// 06SSP-00152
	//
	var taskArray = new Array();
	var closeAll = false;
	if (arguments.length > 2) //Check for task names to exclude
		{
		for (var i=2; i<arguments.length; i++)
			taskArray.push(arguments[i]);
		}
	else
		closeAll = true;

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  else
  	{
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
		}

	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;

	for (i in wfObj)
		{
   	fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
		//processID = fTask.getProcessID();
		if (closeAll)
			{
			aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
			logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
			logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
			}
		else
			{
			if (!exists(wftask,taskArray))
				{
				aa.workflow.handleDisposition(capId,stepnumber,pStatus,dispositionDate,wfnote,pComment,systemUserObj,"Y");
				logMessage("Closing Workflow Task " + wftask + " with status " + pStatus);
				logDebug("Closing Workflow Task " + wftask + " with status " + pStatus);
				}
			}
		}
	}


function getNextAvailableExpDate(fixedDates,permitIssuedDate){
    if(fixedDates!=undefined && fixedDates!=null && fixedDates!="null"){
        var issuedDate = new Date(permitIssuedDate);
        //remove empty elements
        var fixedDates = fixedDates.split(";").filter(function(e){return e});
        var permitIssuedDate = issuedDate.getMonth()+1
                            +"/"+issuedDate.getDate();

        fixedDates.push(permitIssuedDate);
        //sort dates
        fixedDates.sort(function(a,b){
            var aMonth = a.split("/")[0];
            var bMonth = b.split("/")[0];
            var aDay = a.split("/")[1];
            var bDay = b.split("/")[1];
            if(aMonth!=bMonth)
                return aMonth-bMonth;
            else
                return aDay-bDay;
        });
        for(i in fixedDates){
            aa.print(fixedDates[i]);
        }

        var lastIndex = fixedDates.lastIndexOf(permitIssuedDate)+1;
        if(lastIndex<fixedDates.length){
            return fixedDates[lastIndex]+"/"+issuedDate.getFullYear();
        } else if(lastIndex=fixedDates.length){
            return fixedDates[0]+"/"+(issuedDate.getFullYear()+1);
        }
    }

    return null;
}

function dateAddMonths(pDate, pMonths) {
    // Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
    // If pDate is null, uses current date
    // pMonths can be positive (to add) or negative (to subtract) integer
    // If pDate is on the last day of the month, the new date will also be end of month.
    // If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, in which case the new date will be on the last day of the month
    //
    if (!pDate)
        baseDate = new Date();
    else
        baseDate = new Date(pDate);

    //change pMonths to integer (any decimal values are removed)
    if (parseInt(pMonths) >= 0)
        var vMonths = Math.floor(parseInt(pMonths));
    else
        var vMonths = Math.ceil(parseInt(pMonths));

    var baseMM = baseDate.getMonth() + 1;
    var baseDD = baseDate.getDate();
    var baseYY = baseDate.getFullYear();

    //Determine if pDate is last day of month
    var monthEnd = false;
    if ((baseMM == 1 || baseMM == 3 || baseMM == 5 || baseMM == 7 || baseMM == 8 || baseMM == 10 || baseMM == 12) && baseDD == 31 ||
        (baseMM == 4 || baseMM == 6 || baseMM == 9 || baseMM == 11) && baseDD == 30 ||
        baseMM == 2) {
        if (baseMM != 2)
            monthEnd = true;
        else {
            if (baseYY % 4 == 0 && baseDD == 29) //leap year
                monthEnd = true;
            if (baseYY % 4 != 0 && baseDD == 28)
                monthEnd = true;
        }
    }

    var totMonths = baseMM + vMonths;
    if (totMonths > 0) {
        //calc new year
        var addYears = (totMonths == 12 ? 0 : Math.floor((totMonths - 1) / 12));
        var newYY = baseYY + addYears;
        //calc new month
        var newMM = (totMonths % 12 == 0 ? 12 : totMonths % 12);
    } else {
        //calc new year
        var addYears = (Math.ceil(totMonths / 12) - 1);
        var newYY = baseYY + addYears;
        //calc new month
        var newMM = totMonths % 12 + 12;
    }
    //calc new date (dd)
    if (newMM == 1 || newMM == 3 || newMM == 5 || newMM == 7 || newMM == 8 || newMM == 10 || newMM == 12) {
        if (monthEnd)
            var newDD = 31;
        else
            var newDD = baseDD;
    } else if (newMM == 4 || newMM == 6 || newMM == 9 || newMM == 11) {
        if (monthEnd)
            var newDD = 30;
        else
            var newDD = (baseDD > 30 ? 30 : baseDD);
    } else if (newYY % 4 == 0) //Feb of leap year
    {
        if (monthEnd)
            var newDD = 29;
        else
            var newDD = (baseDD > 29 ? 29 : baseDD);
    } else //Feb of non-leap year
    {
        if (monthEnd)
            var newDD = 28;
        else
            var newDD = (baseDD > 28 ? 28 : baseDD);
    }
    var newDate = "" + newMM + "/" + newDD + "/" + newYY;
    logDebug("New Date is "+newDate);
    return newDate;
}

function scheduleInspectionBasedOnRisk(permitID, permitIssueDate, risk){

	var inspRes = aa.person.getUser(currentUserID);
	if (inspRes.getSuccess())
		var inspectorObj = inspRes.getOutput();
	var DaysAhead = 0;

	if(risk==1){
		DaysAhead = Math.round(( new Date(dateAddMonths(permitIssueDate, 12))- new Date())/(1000*60*60*24) + 1);
	}else if(risk==2){
		DaysAhead = Math.round(( new Date(dateAddMonths(permitIssueDate, 6))- new Date())/(1000*60*60*24) + 1);
	}else if(risk==3){
		DaysAhead = Math.round(( new Date(dateAddMonths(permitIssueDate, 4))- new Date())/(1000*60*60*24) + 1);
	}else if(risk==4){
		DaysAhead = Math.round(( new Date(dateAddMonths(permitIssueDate, 3))- new Date())/(1000*60*60*24) + 1);
	}

	var schedRes = aa.inspection.scheduleInspection(permitID, inspectorObj, aa.date.parseDate(dateAdd(null, DaysAhead)), null, "Routine Inspection", "Scheduled via Script");
	if (schedRes.getSuccess())
			logDebug("Successfully scheduled inspection : Routine Inspection for " + dateAdd(null, DaysAhead));
		else
			logDebug("**ERROR: adding  inspection (Routine Inspection): " + schedRes.getErrorMessage());
}

function getParentCapIDForReview(capid)
{
	if (capid == null || aa.util.instanceOfString(capid))
	{
		return null;
	}
	//1. Get parent license for review
	var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete");
    if(result.getSuccess())
	{
		projectScriptModels = result.getOutput();
		if (projectScriptModels == null || projectScriptModels.length == 0)
		{
			aa.print("ERROR: Failed to get parent CAP with CAPID(" + capid + ") for review");
			return null;
		}
		//2. return parent CAPID.
		projectScriptModel = projectScriptModels[0];
		return projectScriptModel.getProjectID();
	}
    else
    {
      aa.print("ERROR: Failed to get parent CAP by child CAP(" + capid + ") for review: " + result.getErrorMessage());
      return null;
    }
}

function getRenewalCapByParentCapIDForIncomplete(parentCapid)
{
   if (parentCapid == null || aa.util.instanceOfString(parentCapid))
   {
       return null;
   }
   //1. Get parent license for review
   var result = aa.cap.getProjectByMasterID(parentCapid, "Renewal", "Incomplete");
   if(result.getSuccess())
   {
       projectScriptModels = result.getOutput();
       if (projectScriptModels == null || projectScriptModels.length == 0)
       {
           aa.print("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");
           return null;
       }
       //2. return parent CAPID.
       projectScriptModel = projectScriptModels[0];
       return projectScriptModel;
   }
   else
   {
     aa.print("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());
     return null;
   }
}

function emailContact(mSubj,mText) {
  // optional: Contact Type, default Applicant
	var replyTo = "permits@cityofroseville.com";
	var contactType = "Applicant"
	var emailAddress = "";

	if (arguments.length == 3) contactType = arguments[2]; // use contact type specified

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				if (Contacts[yy].getEmail() != null)
					emailAddress = "" + Contacts[yy].getEmail();
		}

	if (emailAddress.indexOf("@") > 0)
		{
		aa.sendMail(replyTo, emailAddress, "", mSubj, mText);
		logDebug("Successfully sent email to " + contactType);
		}
	else
		logDebug("Couldn't send email to " + contactType + ", no valid email address");
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;

    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();

    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);

       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function getRecordParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$capName$$", capName);
	addParameter(params, "$$capStatus$$", capStatus);
	addParameter(params, "$$fileDate$$", fileDate);
	addParameter(params, "$$workDesc$$", workDescGet(capId));
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
	addParameter(params, "$$capTypeAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
	if (wfComment != null) {
		addParameter(params, "$$wfComment$$", wfComment);
	}
	return params;
}

function getACARecordParam4Notification(params,acaUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

	return params;
}

function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
	addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);

	return params;
}

function getACADocDownloadParam4Notification(params,acaUrl,docModel) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));

	return params;
}

function getContactParams4Notification(params,conType) {
        // pass in a hashtable and it will add the additional parameters to the table
        // pass in contact type to retrieve

        contactArray = getContactArray();

        for(ca in contactArray) {

          thisContact = contactArray[ca];

          if (thisContact["contactType"] == conType) {

            conType = conType.toLowerCase();

            addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
            addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
            addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
            addParameter(params, "$$" + conType + "BusinessName$$", thisContact["businessName"]);
            addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
            addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
            addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
            addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
            addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
            addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
            addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
            addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
            addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
            addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
            addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
            addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
            addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
            addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
            addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);
          }
        }

        return params;
}

function getPrimaryAddressLineParam4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

    var addressLine = "";

	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");

	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();

		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
	}

	return params;
}

function getACADocumentDownloadUrl(acaUrl,documentModel) {

  //returns the ACA URL for supplied document model

	var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);
	if(acaUrlResult.getSuccess())
	{
		acaDocUrl = acaUrlResult.getOutput();
		return acaDocUrl;
	}
	else
	{
		logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
		return false;
	}
}


function getACARecordURL(acaUrl) {

	var acaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

  acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";
	acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

   	return acaRecordUrl;
}

function getDeepLinkUrl(acaUrl, appType, module) {
	var acaDeepLinkUrl = "";

	acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
	acaDeepLinkUrl += appType;
	acaDeepLinkUrl += "&Module=" + module;

	return acaDeepLinkUrl;
}

function getInspectionResultParams4Notification(params) {

  // pass in a hashtable and it will add the additional parameters to the table
  // This should be called from InspectionResultAfter Event

  if (inspId) addParameter(params, "$$inspId$$", inspId);
  if (inspResult) addParameter(params, "$$inspResult$$", inspResult);
  if (inspComment) addParameter(params, "$$inspComment$$", inspComment);
  else addParameter(params, "$$inspResultComment$$", inspResultComment);

  if (inspResultDate) addParameter(params, "$$inspResultDate$$", inspResultDate);
  if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);
  if (inspType) addParameter(params, "$$inspType$$", inspType);
  if (inspSchedDate) addParameter(params, "$$inspSchedDate$$", inspSchedDate);

  return params;
}

function getPaymentReceivedParams4Notification (params)  {

  if (PaymentDate) addParameter(params, "$$PaymentDate$$", PaymentDate);
  if (PaymentTotalPaidAmount) addParameter(params, "$$PaymentTotalPaidAmount$$", PaymentTotalPaidAmount);

  return params;
}

function getInspectionScheduleParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table
	// This should be called from InspectionScheduleAfter Event

	if (inspId) addParameter(params, "$$inspId$$", inspId);
	if (InspectorFirstName) addParameter(params, "$$InspectorFirstName$$", InspectorFirstName);
	if (InspectorMiddleName) addParameter(params, "$$InspectorMiddleName$$", InspectorMiddleName);
	if (InspectorLastName) addParameter(params, "$$InspectorLastName$$", InspectorLastName);
	if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);
	if (inspType) addParameter(params, "$$InspectionType$$", inspType);
	if (inspSchedDate != null) addParameter(params, "$$InspectionDate$$", inspSchedDate);
	if (InspectionTime) addParameter(params, "$$InspectionTime$$", InspectionTime);
  if (inspAMPM) addParameter(params, "$$InspectionAMPM$$", inspAMPM);

	return params;
}

/*******************************************************************************************************/

function getWorkflowTaskUpdateAfterforNotification(params) {

	// pass in a hashtable and it will add the additional parameters to the table
	// This should be called from WorkflowTaskUpdateAfter Event

	if (wfTask) addParameter(params, "$$wfTask$$", wfTask);
	if (wfStatus) addParameter(params, "$$wfStatus$$", wfStatus);
	if (wfStaffUserID) addParameter(params, "$$wfStaffUserID$$", wfStaffUserID);
	if (wfDate) addParameter(params, "$$wfDate$$", wfDate);
	if (wfComment) addParameter(params, "$$wfComment$$", wfComment);
	  else addParameter(params, "$$wfComment$$", "");

	return params;
}


/*
 * add parameter to a hashtable, for use with notifications.
 */
function addParameter(parameters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		parameters.put(key, value);
	}
}

/*
 * Send notification
 */
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

/*------------------------------------------------------------------------------------------------------/
| Custom email notification section
/------------------------------------------------------------------------------------------------------*/

function sendMeterInstall_Notification(){
  var notificationTemplate = "RV_METER_INSTALL";
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var report = null;
  var params = aa.util.newHashtable();

	getRecordParams4Notification(params);
  getContactParams4Notification(params,"Applicant");
	getACARecordParam4Notification(params,acaURL);
	getWorkflowTaskUpdateAfterforNotification(params);
	getPrimaryAddressLineParam4Notification(params);
	sendNotification("permits@cityofroseville.com","","",notificationTemplate ,params,(report));
}

function sendEngineeringAppAcceptance(){
  var notificationTemplate = "RV_ENGINEERING_ACCEPT";
  var report = null;
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var contactTypesArray = new Array("Applicant");
  var params = aa.util.newHashtable();
  var iCon = null;
  var contactArray = getContactArray();

  for (iCon in contactArray) {
    if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

      tContact = contactArray[iCon];
      logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
      if (!isEmpty(tContact["email"])) {

        getRecordParams4Notification(params);
        getACARecordParam4Notification(params,acaURL);
        getContactParams4Notification(params,"Applicant");
        getWorkflowTaskUpdateAfterforNotification(params);
        getPrimaryAddressLineParam4Notification(params);
        logDebug("Contact Email: " + tContact["email"]);
        sendNotification("engineering@cityofroseville.com",tContact["email"],"",notificationTemplate,params,(report));
      }
    }
  }
}

function sendEngineeringReviewNotification(staff,staffPhone,staffEmail){
  var notificationTemplate = "RV_ENGINEERING_REVIEW";
  var report = null;
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var contactTypesArray = new Array("Applicant");
  var params = aa.util.newHashtable();
  var iCon = null;
  var contactArray = getContactArray();

  for (iCon in contactArray) {
    if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

      tContact = contactArray[iCon];
      logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
      if (!isEmpty(tContact["email"])) {

        getRecordParams4Notification(params);
        getACARecordParam4Notification(params,acaURL);
        getContactParams4Notification(params,"Applicant");
        getWorkflowTaskUpdateAfterforNotification(params);
        if (staff) addParameter(params, "$$StaffReviewer$$", staff);
        if (staffPhone) addParameter(params, "$$StaffPhone$$", staffPhone);
        if (staffEmail) addParameter(params, "$$StaffEmail$$", staffEmail);
        getPrimaryAddressLineParam4Notification(params);
        logDebug("Contact Email: " + tContact["email"]);
        sendNotification("engineering@cityofroseville.com",tContact["email"],"",notificationTemplate,params,(report));
      }
    }
  }
}

function sendEngineeringFinalInspectionNotification(){
  var notificationTemplate = "RV_ENGINEERING_FINAL_INSPECTION";
  var report = null;
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var contactTypesArray = new Array("Applicant");
  var params = aa.util.newHashtable();
  var iCon = null;
  var contactArray = getContactArray();

  for (iCon in contactArray) {
    if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

      tContact = contactArray[iCon];
      logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
      if (!isEmpty(tContact["email"])) {

        getRecordParams4Notification(params);
        getACARecordParam4Notification(params,acaURL);
        getContactParams4Notification(params,"Applicant");
        getWorkflowTaskUpdateAfterforNotification(params);
        getPrimaryAddressLineParam4Notification(params);
        logDebug("Contact Email: " + tContact["email"]);
        sendNotification("engineering@cityofroseville.com",tContact["email"],"",notificationTemplate,params,(report));
      }
    }
  }
}


function sendCityEngineer_Notification(){
  var notificationTemplate = "RV_ENGINEER_MNDOT_NOTIFY";
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var report = null;
  var params = aa.util.newHashtable();

	getRecordParams4Notification(params);
	getACARecordParam4Notification(params,acaURL);
	getPrimaryAddressLineParam4Notification(params);
	sendNotification("sally.ricard@cityofroseville.com","","",notificationTemplate ,params,(report));
}

function sendOnlineInspectionRequest_Notification(){
  var notificationTemplate = "RV_ACA_INSPECTION_REQUEST";
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var report = null;
  var params = aa.util.newHashtable();

	getRecordParams4Notification(params);
	getACARecordParam4Notification(params,acaURL);
  getInspectionScheduleParams4Notification(params);
	getPrimaryAddressLineParam4Notification(params);
	sendNotification("joel.koepp@cityofroseville.com","","",notificationTemplate ,params,(report));
}

function sendBLDGInspectionScheduleNotification(){
   var notificationTemplate = "RV_BLDG_INSPECTION_SCHEDULED";
   var report = null;
   var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
   var contactTypesArray = new Array("Applicant");
   var params = aa.util.newHashtable();
   var iCon = null;
   var contactArray = getContactArray();

   for (iCon in contactArray) {
     if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

       tContact = contactArray[iCon];
       logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
       if (!isEmpty(tContact["email"])) {

         getRecordParams4Notification(params);
         getACARecordParam4Notification(params,acaURL);
         getContactParams4Notification(params,"Applicant");
         getInspectionScheduleParams4Notification(params);
         getPrimaryAddressLineParam4Notification(params);
         logDebug("Contact Email: " + tContact["email"]);
         sendNotification("permits@cityofroseville.com",tContact["email"],"",notificationTemplate,params,(report));
       }
     }
   }
 }

function sendBLDGInspectionResultApplNotification(){
  var notificationTemplate = "RV_BLDG_INSPECTION_RESULT";
  var report = null;
  var acaURL = "acasupp3.accela.com/ROSEVILLE_MN/";
  var contactTypesArray = new Array("Applicant");
  var params = aa.util.newHashtable();
  var iCon = null;
  var contactArray = getContactArray();

  for (iCon in contactArray) {
    if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

  		tContact = contactArray[iCon];
  		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
  		if (!isEmpty(tContact["email"])) {

  			getRecordParams4Notification(params);
  			getACARecordParam4Notification(params,acaURL);
  			getInspectionResultParams4Notification(params);
  			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
  			getPrimaryAddressLineParam4Notification(params);
  			logDebug("Contact Email: " + tContact["email"]);
  			sendNotification("permits@cityofroseville.com",tContact["email"],"",notificationTemplate ,params,(report));
  		}
    }
  }
}
