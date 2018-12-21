 /*------------------------------------------------------------------------------------------------------/PROD
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be
|	    available to all master scripts
|
|
| 7-18-18  Keith Added Function createChildLic
| 7-18-18  Keith Added Function copyDetailedDescription
| 7-18-18  Keith Added function getParentCapIDForReview
| 7-22-18  Keith Added Function getCapWorkDesModel

/------------------------------------------------------------------------------------------------------*/


//date format function
function getOraFormattedDate(input) {
    var pattern = /(.*?)\/(.*?)\/(.*?)$/;
    var result = input.replace(pattern,function(match,p1,p2,p3){
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return (p2<10?"0"+p2:p2) + " " + months[(p1-1)] + " " + p3;
    });

    return result;
}



function getPrimaryAddress()
		{
                var primaryAddressObj = aa.address.getPrimaryAddressByCapID(capId,"Y").getOutput();
				if (primaryAddressObj)
	 			{
					var primaryAddress = primaryAddressObj.getAddressModel();
				        return primaryAddress;
				}
		}

function getInspResult()
	{
	return inspResult;
	}

function getPrimaryEmail(contArray)
{
	var primaryContactEmail = "";
	for (x in contArray)
	{
		if(contArray[x]["contactType"] =="Notice Recipient")
		{
			primaryContactEmail = contArray[x]["email"];
		}
	}
	return primaryContactEmail;

}
function emailContact(mSubj,mText)   // optional: Contact Type, default Applicant
	{
	var replyTo = "accela_maildev@rochestermn.gov";
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
	function endBranch() {
	// stop execution of the current std choice
	stopBranch = true;
	}
	function executeASITable(tableArray)
	{
	// Executes an ASI table as if it were script commands
	// No capability for else or continuation statements
	// Assumes that there are at least three columns named "Enabled", "Criteria", "Action"
	// Will replace tokens in the controls

	//var thisDate = new Date();
	//var thisTime = thisDate.getTime();
	//logDebug("Executing ASI Table, Elapsed Time: "  + ((thisTime - startTime) / 1000) + " Seconds")

	for (xx in tableArray)
		{

		var doTableObj = tableArray[xx];
		var myCriteria = doTableObj["Criteria"]; aa.print("cri: " + myCriteria)
		var myAction = doTableObj["Action"];  aa.print("act: " + myAction)
		aa.print("enabled: " + doTableObj["Enabled"])

		if (doTableObj["Enabled"] == "Yes")
			if (eval(token(myCriteria)))
				eval(token(myAction));

		} // next action
	//var thisDate = new Date();
	//var thisTime = thisDate.getTime();
	//logDebug("Finished executing ASI Table, Elapsed Time: "  + ((thisTime - startTime) / 1000) + " Seconds")
	}

//
// exists:  return true if Value is in Array
//
function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}
function checkUser(firstName)
{
var staffFirstNameArray = aa.env.getValue("StaffFirstNameArray");
if(null != staffFirstNameArray && staffFirstNameArray.length > 0)
{
for(var i = 0;i < staffFirstNameArray.length;i++)
{
if(firstName == staffFirstNameArray[i])
{
return true;
}
}
}
return false;
}
function runReportAttach(itemCapId,aaReportName)
                {
                // optional parameters are report parameter pairs
                // for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");


                var reportName = aaReportName;

                reportResult = aa.reportManager.getReportInfoModelByName(reportName);

                if (!reportResult.getSuccess())
                                { logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

                var report = reportResult.getOutput();

                var itemCap = aa.cap.getCap(itemCapId).getOutput();
                appTypeResult = itemCap.getCapType();
                appTypeString = appTypeResult.toString();
                appTypeArray = appTypeString.split("/");

                report.setModule(appTypeArray[0]);
                report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3());
                report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

                var parameters = aa.util.newHashMap();

                for (var i = 2; i < arguments.length ; i = i+2)
                                {
                                parameters.put(arguments[i],arguments[i+1]);
                                logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
                                }

                report.setReportParameters(parameters);

                var permit = aa.reportManager.hasPermission(reportName,currentUserID);
                if(permit.getOutput().booleanValue())
                                {
                                var reportResult = aa.reportManager.getReportResult(report);

                                logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());

                                }
                else
                                logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
}
function comparePeopleRochester(peop)
                {

                /*

                                this function will be passed as a parameter to the createRefContactsFromCapContactsAndLink function.
                                takes a single peopleModel as a parameter, and will return the sequence number of the first G6Contact result
                                returns null if there are no matches

                                Best Practice Template Version uses the following algorithm:

                                1.  Match on SSN/FEIN if either exist
                                2.  else, match on Email Address if it exists
                                3.  else, match on First, Middle, Last Name
                                4.  else compare on Full Name

                                This function can use attributes if desired
                */


                if (peop.getSocialSecurityNumber() || peop.getFein())
                                {
                                var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

                                logDebug("we have a SSN " + peop.getSocialSecurityNumber() + " or FEIN, checking on that");
                                qryPeople.setSocialSecurityNumber(peop.getSocialSecurityNumber());
                                qryPeople.setFein(peop.getFein());

                                var r = aa.people.getPeopleByPeopleModel(qryPeople);

                                if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

                                var peopResult = r.getOutput();

                                if (peopResult.length > 0)
                                                {
                                                logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
                                                return peopResult[0].getContactSeqNumber();
                                                }
                                }

                if (peop.getEmail())
                                {
                                var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();

                                qryPeople.setServiceProviderCode(aa.getServiceProviderCode());

                                logDebug("we have an email, checking on that");
                                qryPeople.setEmail(peop.getEmail());

                                var r = aa.people.getPeopleByPeopleModel(qryPeople);

                                if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

                                var peopResult = r.getOutput();

                                if (peopResult.length > 0)
                                                {
                                                logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
                                                return peopResult[0].getContactSeqNumber();
                                                }
                                }

                if (peop.getLastName() && peop.getFirstName() && peop.getMiddleName())
                                {
                                var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
                                qryPeople.setLastName(peop.getLastName());
                                qryPeople.setFirstName(peop.getFirstName());
                                qryPeople.setMiddleName(peop.getMiddleName());

                                var r = aa.people.getPeopleByPeopleModel(qryPeople);

                                if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

                                var peopResult = r.getOutput();

                                if (peopResult.length > 0)
                                                {
                                                logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
                                                return peopResult[0].getContactSeqNumber();
                                                }
                                }

                if (peop.getFullName())
                                {
                                var qryPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
                                qryPeople.setFullName(peop.getFullName());

                                var r = aa.people.getPeopleByPeopleModel(qryPeople);

                                if (!r.getSuccess())  { logDebug("WARNING: error searching for people : " + r.getErrorMessage()); return false; }

                                var peopResult = r.getOutput();

                                if (peopResult.length > 0)
                                                {
                                                logDebug("Searched for a REF Contact, " + peopResult.length + " matches found! returning the first match : " + peopResult[0].getContactSeqNumber() );
                                                return peopResult[0].getContactSeqNumber();
                                                }
                                }

                logDebug("ComparePeople did not find a match");
                                return false;
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

                                                                                if (refPeopleId) {
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
}
function getContactObjsByCap(itemCap) // optional typeToLoad, optional return only one instead of Array?

{

                var typesToLoad = false;

                if (arguments.length == 2) typesToLoad = arguments[1];

                var capContactArray = null;

                var cArray = new Array();



                var capContactArray = cap.getContactsGroup().toArray() ;



                if (capContactArray) {

                                for (var yy in capContactArray)  {

                                                if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {

                                                                cArray.push(new contactObj(capContactArray[yy]));

                                                }

                                }

                }



                logDebug("getContactObj returned " + cArray.length + " contactObj(s)");

                return cArray;



}
function getContactObjs(itemCap) // optional typeToLoad, optional return only one instead of Array?
{
    var typesToLoad = false;
    if (arguments.length == 2) typesToLoad = arguments[1];
    var capContactArray = new Array();
    var cArray = new Array();
    //if (itemCap.getClass().toString().equals("com.accela.aa.aamain.cap.CapModel"))   { // page flow script
    if (!cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") {

        if (cap.getApplicantModel()) {
            capContactArray[0] = cap.getApplicantModel();
        }

        if (cap.getContactsGroup().size() > 0) {
            var capContactAddArray = cap.getContactsGroup().toArray();
            for (ccaa in capContactAddArray)
                capContactArray.push(capContactAddArray[ccaa]);
        }
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {
                cArray.push(new contactObj(capContactArray[yy]));
            }
        }
    }

    logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;

}
 function getContactObjsBySeqNbr(itemCap,seqNbr) {
                /*var result = aa.people.getCapContactByPK(itemCap,seqNbr);

    if (result.getSuccess()) {
                                var csm = result.getOutput();
                                return new contactObj(csm);
                }*/
                var capContactArray = null;

                var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
        var capContactArray = capContactResult.getOutput();
    }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (String(capContactArray[yy].getPeople().contactSeqNumber).equals(String(seqNbr))) {
                logDebug("getContactObjsBySeqNbr returned the contact on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }

}
function getContactObj(itemCap,typeToLoad)
{
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel")   { // page flow script
        var capContactArray = cap.getContactsGroup().toArray() ;
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }

    logDebug("getContactObj could not find a contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
    return false;

}
function contactObj(ccsm)  {

    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
    this.validAttrs = false;

    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
            if (this.people.getAttributes() != null) {
                this.asiObj = this.people.getAttributes().toArray();
                if (this.asiObj != null) {
                    for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1];
                    this.validAttrs = true;
                }
            }
        }

        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
        else {
            pmcal = this.people.getContactAddressList();
            if (pmcal) {
                this.addresses = pmcal.toArray();
            }
        }
    }
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }

        this.getEmailTemplateParams = function (params) {
            addParameter(params, "$$LastName$$", this.people.getLastName());
            addParameter(params, "$$FirstName$$", this.people.getFirstName());
            addParameter(params, "$$MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$BusinesName$$", this.people.getBusinessName());
            addParameter(params, "$$ContactSeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$Relation$$", this.relation);
            addParameter(params, "$$Phone1$$", this.people.getPhone1());
            addParameter(params, "$$Phone2$$", this.people.getPhone2());
            addParameter(params, "$$Email$$", this.people.getEmail());
            addParameter(params, "$$AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$Fax$$", this.people.getFax());
            addParameter(params, "$$Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$FullName$$", this.people.getFullName());
            return params;
            }

        this.replace = function(targetCapId) { // send to another record, optional new contact type

            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            if (!String(this.people.getBusinessName()).equals(String(t.people.getBusinessName()))) { return false; }
            return  true;
        }

        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }

        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            this.capContact.setPeople(this.people);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }

        //get method for Attributes
        this.getAttribute = function (vAttributeName){
            var retVal = null;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null)
                    retVal = tmpVal.getAttributeValue();
            }
            return retVal;
        }

        //Set method for Attributes
        this.setAttribute = function(vAttributeName,vAttributeValue){
            var retVal = false;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null){
                    tmpVal.setAttributeValue(vAttributeValue);
                    retVal = true;
                }
            }
            return retVal;
        }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.isSingleAddressPerType = function() {
            if (this.addresses.length > 1)
                {

                var addrTypeCount = new Array();
                for (y in this.addresses)
                    {
                    thisAddr = this.addresses[y];
                    addrTypeCount[thisAddr.addressType] = 0;
                    }

                for (yy in this.addresses)
                    {
                    thisAddr = this.addresses[yy];
                    addrTypeCount[thisAddr.addressType] += 1;
                    }

                for (z in addrTypeCount)
                    {
                    if (addrTypeCount[z] > 1)
                        return false;
                    }
                }
            else
                {
                return true;
                }

            return true;

            }

        this.getAddressTypeCounts = function() { //returns an associative array of how many adddresses are attached.

            var addrTypeCount = new Array();

            for (y in this.addresses)
                {
                thisAddr = this.addresses[y];
                addrTypeCount[thisAddr.addressType] = 0;
                }

            for (yy in this.addresses)
                {
                thisAddr = this.addresses[yy];
                addrTypeCount[thisAddr.addressType] += 1;
                }

            return addrTypeCount;

            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }

            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail());
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendHyperlinkActivateEmail(userModel);

                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }

            }

        //  Now that we have a public user let's connect to the reference contact

        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }


        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter


            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel();
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput();
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ;
                pm.setContactSeqNumber(this.refSeqNumber);

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();

                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
            }

        return resultArray;
        }

        this.getRelatedContactObjs = function() { // option record type filter

            if (this.refSeqNumber) {
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel();
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput();
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ;
                pm.setContactSeqNumber(this.refSeqNumber);

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();

                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        var ccsm = aa.people.getCapContactByPK(thisCapId, cList[j].getPeople().contactSeqNumber).getOutput();
                        var newContactObj = new contactObj(ccsm);
                        resultArray.push(newContactObj)
                        }
                    }
            }

        return resultArray;
        }



        this.createRefLicProf = function(licNum,rlpType,addressType,licenseState) {

            // optional 3rd parameter serv_prov_code
            var updating = false;
            var serv_prov_code_4_lp = aa.getServiceProviderCode();
            if (arguments.length == 5) {
                serv_prov_code_4_lp = arguments[4];
                aa.setDelegateAgencyCode(serv_prov_code_4_lp);
                }

            // addressType = one of the contact address types, or null to pull from the standard contact fields.
            var newLic = getRefLicenseProf(licNum);

            if (newLic) {
                updating = true;
                logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
                }
            else {
                var newLic = aa.licenseScript.createLicenseScriptModel();
                }

            peop = this.people;
            cont = this.capContact;
            if (cont.getFirstName() != null) newLic.setContactFirstName(cont.getFirstName());
            if (peop.getMiddleName() != null) newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
            if (cont.getLastName() != null) if (peop.getNamesuffix() != null) newLic.setContactLastName(cont.getLastName() + " " + peop.getNamesuffix()); else newLic.setContactLastName(cont.getLastName());
            if (peop.getBusinessName() != null) newLic.setBusinessName(peop.getBusinessName());
            if (peop.getPhone1() != null) newLic.setPhone1(peop.getPhone1());
            if (peop.getPhone2() != null) newLic.setPhone2(peop.getPhone2());
            if (peop.getEmail() != null) newLic.setEMailAddress(peop.getEmail());
            if (peop.getFax() != null) newLic.setFax(peop.getFax());
            newLic.setAgencyCode(serv_prov_code_4_lp);
            newLic.setAuditDate(sysDate);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setStateLicense(licNum);
            newLic.setLicState(licenseState);
            //setting this field for a future enhancement to filter license types by the licensing board field. (this will be populated with agency names)
            var agencyLong = lookup("CONTACT_ACROSS_AGENCIES",servProvCode);
            if (!matches(agencyLong,undefined,null,"")) newLic.setLicenseBoard(agencyLong); else newLic.setLicenseBoard("");

            var addr = null;

            if (addressType) {
                for (var i in this.addresses) {
                    cAddr = this.addresses[i];
                    if (addressType.equals(cAddr.getAddressType())) {
                        addr = cAddr;
                    }
                }
            }

            if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address

            if (addr.getAddressLine1() != null) newLic.setAddress1(addr.getAddressLine1());
            if (addr.getAddressLine2() != null) newLic.setAddress2(addr.getAddressLine2());
            if (addr.getAddressLine3() != null) newLic.getLicenseModel().setTitle(addr.getAddressLine3());
            if (addr.getCity() != null) newLic.setCity(addr.getCity());
            if (addr.getState() != null) newLic.setState(addr.getState());
            if (addr.getZip() != null) newLic.setZip(addr.getZip());
            if (addr.getCountryCode() != null) newLic.getLicenseModel().setCountryCode(addr.getCountryCode());

            if (updating)
                myResult = aa.licenseScript.editRefLicenseProf(newLic);
            else
                myResult = aa.licenseScript.createRefLicenseProf(newLic);

            if (arguments.length == 5) {
                aa.resetDelegateAgencyCode();
            }

            if (myResult.getSuccess())
                {
                logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
                return true;
                }
            else
                {
                logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
                }
        }

        this.getAKA = function() {
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            if (this.refSeqNumber) {
                return aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber)).toArray();
                }
            else {
                logDebug("contactObj: Cannot get AKA names for a non-reference contact");
                return false;
                }
            }

        this.addAKA = function(firstName,middleName,lastName,fullName,startDate,endDate) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot add AKA name for non-reference contact");
                return false;
                }

            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var args = new Array();
            var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel",args).getOutput();
            var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();

            var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            akaModel.setServiceProviderCode(aa.getServiceProviderCode());
            akaModel.setContactNumber(parseInt(this.refSeqNumber));
            akaModel.setFirstName(firstName);
            akaModel.setMiddleName(middleName);
            akaModel.setLastName(lastName);
            akaModel.setFullName(fullName);
            akaModel.setStartDate(startDate);
            akaModel.setEndDate(endDate);
            auditModel.setAuditDate(new Date());
            auditModel.setAuditStatus("A");
            auditModel.setAuditID("ADMIN");
            akaModel.setAuditModel(auditModel);
            a.add(akaModel);

            aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, a);
            }

        this.removeAKA = function(firstName,middleName,lastName) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot remove AKA name for non-reference contact");
                return false;
                }

            var removed = false;
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var l = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));

            var i = l.iterator();
            while (i.hasNext()) {
                var thisAKA = i.next();
                if ((!thisAKA.getFirstName() || thisAKA.getFirstName().equals(firstName)) && (!thisAKA.getMiddleName() || thisAKA.getMiddleName().equals(middleName)) && (!thisAKA.getLastName() || thisAKA.getLastName().equals(lastName))) {
                    i.remove();
                    logDebug("contactObj: removed AKA Name : " + firstName + " " + middleName + " " + lastName);
                    removed = true;
                    }
                }

            if (removed)
                aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, l);
            }

        this.hasPublicUser = function() {
            if (this.refSeqNumber == null) return false;
            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(this.refSeqNumber));

            if (s_publicUserResult.getSuccess()) {
                var fpublicUsers = s_publicUserResult.getOutput();
                if (fpublicUsers == null || fpublicUsers.size() == 0) {
                    logDebug("The contact("+this.refSeqNumber+") is not associated with any public user.");
                    return false;
                } else {
                    logDebug("The contact("+this.refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                    return true;
                }
            } else { logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage()); return false; }
        }

        this.linkToPublicUser = function(pUserId) {

            if (pUserId != null) {
                var pSeqNumber = pUserId.replace('PUBLICUSER','');

                var s_publicUserResult = aa.publicUser.getPublicUser(aa.util.parseLong(pSeqNumber));

                if (s_publicUserResult.getSuccess()) {
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(pSeqNumber, this.refSeqNumber);

                    if (linkResult.getSuccess()) {
                        logDebug("Successfully linked public user " + pSeqNumber + " to contact " + this.refSeqNumber);
                    } else {
                        logDebug("Failed to link contact to public user");
                        return false;
                    }
                } else {
                    logDebug("Could not find a public user with the seq number: " + pSeqNumber);
                    return false;
                }


            } else {
                logDebug("No public user id provided");
                return false;
            }
        }

        this.sendCreateAndLinkNotification = function() {
            //for the scenario in AA where a paper application has been submitted
            var toEmail = this.people.getEmail();

            if (toEmail) {
                var params = aa.util.newHashtable();
                getACARecordParam4Notification(params,acaUrl);
                addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
                addParameter(params,"$$altID$$",capIDString);
                var notificationName;

                if (this.people.getContactTypeFlag() == "individual") {
                    notificationName = this.people.getFirstName() + " " + this.people.getLastName();
                } else {
                    notificationName = this.people.getBusinessName();
                }

                if (notificationName)
                    addParameter(params,"$$notificationName$$",notificationName);
                if (this.refSeqNumber) {
                    var v = new verhoeff();
                    var pinCode = v.compute(String(this.refSeqNumber));
                    addParameter(params,"$$pinCode$$",pinCode);

                    sendNotification(sysFromEmail,toEmail,"","PUBLICUSER CREATE AND LINK",params,null);
                }


            }

        }

        this.getRelatedRefContacts = function() { //Optional relationship types array

            var relTypes;
            if (arguments.length > 0) relTypes = arguments[0];

            var relConsArray = new Array();

            if (matches(this.refSeqNumber,null,undefined,"")) return relConsArray;

            //check as the source
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setContactSeqNumber(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);


            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getEntityID1());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            //check as the target
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setEntityID1(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);

            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getContactSeqNumber());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            return relConsArray;
        }
    }


function createPublicUserFromRefContact(rcsm)
{
                // Accepts a Reference Contact Script Model or PeopleModel
    var contact;
    var refContactNum;
    var userModel;


    if (!rcsm)
    { logDebug("Couldn't create public user , no contact exists"); return false; }

    if (!rcsm.getEmail())
    { logDebug("Couldn't create public user for " + rcsm.getLastName() + ", " + rcsm.getLastName() +", no email address"); return false; }

                if (rcsm.getContactTypeFlag().equals("organization"))
                { logDebug("Couldn't create public user for " + rcsm.getBusinessName() + ", the contact is an organization"); return false; }

    // get the reference contact ID.   We will use to connect to the new public user
    refContactNum = rcsm.getContactSeqNumber();

    // check to see if public user exists already based on email address
    var getUserResult = aa.publicUser.getPublicUserByEmail(rcsm.getEmail())
    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
        userModel = getUserResult.getOutput();
        logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
                }

    if (!userModel) // create one
                {
                    logDebug("CreatePublicUserFromRefContact: creating new user based on email address: " + rcsm.getEmail());
                    var publicUser = aa.publicUser.getPublicUserModel();
                    publicUser.setFirstName(rcsm.getFirstName());
                    publicUser.setLastName(rcsm.getLastName());
                    publicUser.setEmail(rcsm.getEmail());
                    publicUser.setUserID(rcsm.getEmail());
                    publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                    publicUser.setAuditID("PublicUser");
                    publicUser.setAuditStatus("A");
                    publicUser.setCellPhone(rcsm.getPhone2());

                    var result = aa.publicUser.createPublicUser(publicUser);
                    if (result.getSuccess()) {

                                logDebug("Created public user " + rcsm.getEmail() + "  sucessfully.");
                                var userSeqNum = result.getOutput();
                                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                                // create for agency
                                aa.publicUser.createPublicUserForAgency(userModel);

                                // activate for agency
                                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                                                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode,userSeqNum,"ADMIN");

                                                // reset password
                                                var resetPasswordResult = aa.publicUser.resetPassword(rcsm.getEmail());
                                                if (resetPasswordResult.getSuccess()) {
                                                                var resetPassword = resetPasswordResult.getOutput();
                                                                userModel.setPassword(resetPassword);
                                                                logDebug("Reset password for " + rcsm.getEmail() + "  sucessfully.");
                                                } else {
                                                                logDebug("**ERROR: Reset password for  " + rcsm.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                                                }

                                // send Activate email
                                aa.publicUser.sendActivateEmail(userModel, true, true);

                                // send another email
                                aa.publicUser.sendPasswordEmail(userModel);
                    }
                else {
                    logDebug("**Warning creating public user " + rcsm.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
    }

//  Now that we have a public user let's connect to the reference contact

if (refContactNum)
                {
                logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refContactNum);
                aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
                }


return userModel; // send back the new or existing public user
}
/*************************************************************************************************/

function editAppSpecific(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }


		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}

   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue;
	}
	else
		{ logDebug( "WARNING: " + itemName + " was not updated." + appSpecInfoResult.getErrorMessage()); }
}

/*************************************************************************************************/

function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
     var itemCap = capId;
     if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
     var id1 = itemCap.ID1;
     var id2 = itemCap.ID2;
     var id3 = itemCap.ID3;
     var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
     var result = null;

     result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);

     if(result.getSuccess()) {
           logDebug("Sent email successfully!");
           return true;
     }
     else {
           logDebug("Failed to send mail. - " + result.getErrorType());
           return false;
     }
}

/*************************************************************************************************/

function getRecordParams4Notification(params) {
                // pass in a hashtable and it will add the additional parameters to the table

                addParameter(params, "$$altID$$", capIDString);
                addParameter(params, "$$capName$$", capName);
                addParameter(params, "$$capStatus$$", capStatus);
                addParameter(params, "$$fileDate$$", fileDate);
                addParameter(params, "$$workDesc$$", workDescGet(capId));
                addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
                addParameter(params, "$$capTypeAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
				        addParameter(params, "$$appTypeString$$", appTypeResult.toString());
                return params;
}

/*************************************************************************************************/

function getACARecordParam4Notification(params,acaUrl) {
                // pass in a hashtable and it will add the additional parameters to the table

                addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

                return params;
}

/*************************************************************************************************/

function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
                // pass in a hashtable and it will add the additional parameters to the table

                addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
                addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);

                return params;
}

/*************************************************************************************************/

function getACADocDownloadParam4Notification(params,acaUrl,docModel) {
                // pass in a hashtable and it will add the additional parameters to the table

                addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));

                return params;
}

/*************************************************************************************************/

function getContactParams4Notification(params,pContact) {
                // pass in a hashtable and it will add the additional parameters to the table
                // pass in contact to retrieve informaiton from

                                thisContact = pContact;
                                conType = "contact";
                                //logDebug("Contact Array: " + thisContact["contactType"] + " Param: " + conType);

                                addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
                                addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
                                addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
                                addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
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

                return params;
}

/*************************************************************************************************/

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

/*************************************************************************************************/

function getPrimaryOwnerParams4Notification(params) {
                // pass in a hashtable and it will add the additional parameters to the table

                capOwnerResult = aa.owner.getOwnerByCapId(capId);

                if (capOwnerResult.getSuccess()) {
                                owner = capOwnerResult.getOutput();

                                for (o in owner) {
                                                thisOwner = owner[o];
                                                if (thisOwner.getPrimaryOwner() == "Y") {
                                                                addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
                                                                addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);
                                                                break;
                                                }
                                }
                }
                return params;
}

/*************************************************************************************************/

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

/*************************************************************************************************/

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

/*************************************************************************************************/

function getDeepLinkUrl(acaUrl, appType, module) {
                var acaDeepLinkUrl = "";

                acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
                acaDeepLinkUrl += appType;
                acaDeepLinkUrl += "&Module=" + module;

                return acaDeepLinkUrl;
}

/*
* add parameter to a hashtable, for use with notifications.
*/

/*************************************************************************************************/

function addParameter(pamaremeters, key, value)
{
                if(key != null)
                {
                                if(value == null)
                                {
                                                value = "";
                                }
                                pamaremeters.put(key, value);
                }
}

/*************************************************************************************************/

function getInspectionResultParams4Notification(params) {

                // pass in a hashtable and it will add the additional parameters to the table
                // This should be called from InspectionResultAfter Event

                if (inspId) addParameter(params, "$$inspId$$", inspId);
                if (inspResult) addParameter(params, "$$inspResult$$", inspResult);
                if (inspResultComment) addParameter(params, "$$inspResultComment$$", inspResultComment);
                else addParameter(params, "$$inspResultComment$$", "");
                // if (inspComment) addParameter(params, "$$inspComment$$", inspComment);

                if (inspResultDate) addParameter(params, "$$inspResultDate$$", inspResultDate);
                if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);
                if (inspType) addParameter(params, "$$inspType$$", inspType);
                if (inspSchedDate) addParameter(params, "$$inspSchedDate$$", inspSchedDate);

                return params;
}

/*************************************************************************************************/

function getInspectionScheduleParams4Notification(params) {

                // pass in a hashtable and it will add the additional parameters to the table
                // This should be called from InspectionScheduleAfter Event

                if (inspId) addParameter(params, "$$inspId$$", inspId);

                if (InspectorFirstName) addParameter(params, "$$InspectorFirstName$$", InspectorFirstName);

                if (InspectorMiddleName) addParameter(params, "$$InspectorMiddleName$$", InspectorMiddleName);

                if (InspectorLastName) addParameter(params, "$$InspectorLastName$$", InspectorLastName);

                if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);

                if (InspectionTypeList) addParameter(params, "$$InspectionTypeList$$", InspectionTypeList);

                if (InspectionDate) addParameter(params, "$$InspectionDate$$", InspectionDate);

                if (InspectionTime) addParameter(params, "$$InspectionTime$$", InspectionTime);

                return params;

}

function getPaymentReceivedParams4Notification (params)  {

/*************************************************************************************************/

if (PaymentDate) addParameter(params, "$$PaymentDate$$", PaymentDate);
if (PaymentTotalPaidAmount) addParameter(params, "$$PaymentTotalPaidAmount$$", PaymentTotalPaidAmount);

   return params;
}

/*************************************************************************************************/

function generateReport(itemCap,reportName,module,parameters) {

  //returns the report file which can be attached to an email.
  var user = currentUserID;   // Setting the User Name
  var report = aa.reportManager.getReportInfoModelByName(reportName);
  report = report.getOutput();
  report.setModule(module);
  report.setCapId(itemCap.getCustomID());
  report.setReportParameters(parameters);

  var permit = aa.reportManager.hasPermission(reportName,user);

  if (permit.getOutput().booleanValue()) {
    var reportResult = aa.reportManager.getReportResult(report);
    if(reportResult) {
      reportOutput = reportResult.getOutput();
      var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
      reportFile=reportFile.getOutput();
      return reportFile;
    }  else {
      logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
      return false;
    }
  } else {
    logDebug("You have no permission.");
    return false;
  }
}

/*************************************************************************************************/

function getReceiptNbr() {

    receiptResult = aa.finance.getReceiptByCapID(capId, null);
    if (receiptResult.getSuccess()) {
        var receipt = null;
           receipt = receiptResult.getOutput();

        if (receipt[0] != undefined) {
                var maxReceiptNum = receipt.length-1;
            aa.print("Receipt successfully retrieved: " + receipt[maxReceiptNum].getReceiptNbr());
            return parseInt(receipt[maxReceiptNum].getReceiptNbr());
        } else {
            aa.print("Receipt Number Doesnt Exist.");
            return -1;
        }
    }
   else {
       aa.print("error getting the receipt nbr: " + receiptResult.getErrorMessage());
        return -1;
    }
}

/*************************************************************************************************/

function isEmpty(str) {
    return (!str || 0 === str.length);
}

/*************************************************************************************************/

function getUserEmail() {
    //optional parameter for userid
    var userId = currentUserID;
    if (arguments.length > 0)
        userId = arguments[0];
    var systemUserObjResult = aa.person.getUser(userId);
    if (systemUserObjResult.getSuccess()) {
        var systemUserObj = systemUserObjResult.getOutput();
        var userEmail = systemUserObj.getEmail();
        if (userEmail)
            return userEmail;
        else
            return false;
    } else {
        return false;
    }
}

/*************************************************************************************************/

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

                                                addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);

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

/*************************************************************************************************/

function runReportAttachForPublicReceipt(){

var reportName = "ACAReceiptAuto";
var sReceiptNumber = getReceiptNbr();
sReceiptNumber = sReceiptNumber.toString();

logDebug("BeforeGenerate");

runReportAttach(capId,reportName,"agencyid","rochester","receiptnbr",sReceiptNumber,"capid",capId.getCustomID());

}

/*************************************************************************************************/

function getV360InspectionResultParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table
	// This should be called from InspectionResultAfter Event

	if (inspId) addParameter(params, "$$inspId$$", inspId);

	if (inspResult) addParameter(params, "$$inspResult$$", inspResult);

	// if (inspResultComment) addParameter(params, "$$inspResultComment$$", inspResultComment);

	if (inspComment) addParameter(params, "$$inspComment$$", inspComment);
else
                  addParameter(params, "$$inspComment$$", "");
	if (inspResultDate) addParameter(params, "$$inspResultDate$$", inspResultDate);

	if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);

	if (inspType) addParameter(params, "$$inspType$$", inspType);

	if (inspSchedDate) addParameter(params, "$$inspSchedDate$$", inspSchedDate);

	return params;

}

/*******************************************************************************************************/

function licenseProfObject(licnumber, lictype) {
	//Populate the License Model
	this.refLicModel = null; //Reference LP Model
	this.infoTableGroupCodeObj = null;
	this.infoTableSubGroupCodesObj = null;
	this.infoTables = new Array(); //Table Array ex infoTables[name][row][column].getValue()
	this.attribs = new Array(); //Array of LP Attributes ex attribs[name]
	this.valid = false; //true if LP is valid
	this.validTables = false; //true if LP has infoTables
	this.validAttrs = false; //true if LP has attributes

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber);
	if (result.getSuccess()) {
		var tmp = result.getOutput();
		if (lictype == null)
			lictype = "";
		if (tmp != null)
			for (lic in tmp)
				if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase() || lictype == "") {
					this.refLicModel = tmp[lic];
					if (lictype == "") {
						lictype = this.refLicModel.getLicenseType();
					}
					break;
				}
	}

	//Get the People Info Tables
	if (this.refLicModel != null) {
		this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
		if (this.infoTableGroupCodeObj == null) {
			//12ACC-00187
			var infoSvc = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
			if (infoSvc.getInfoTableGroupCodeModel() != null) {
				infoSvc.getInfoTableGroupCodeModel().setServProvCode(aa.getServiceProviderCode());
				infoSvc.getInfoTableGroupCodeModel().setCategory(1);
				infoSvc.getInfoTableGroupCodeModel().setReferenceId("");
				infoSvc.getInfoTableGroupCodeModel().setName(lictype.toUpperCase());
				var tmpGrp = aa.licenseProfessional.getRefInfoTableGroupCode(infoSvc).getOutput();
				if (tmpGrp != null) { //If table was found set reference ID and write to DB
					tmpGrp.setReferenceId(this.refLicModel.getLicSeqNbr());
					infoSvc.setInfoTableGroupCodeModel(tmpGrp);
					aa.licenseProfessional.createRefInfoTable(infoSvc);

					//Recapture new data with Table Model
					var tmp = null;
					tmp = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber).getOutput();
					for (lic in tmp)
						if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase()) {
							this.refLicModel = tmp[lic];
							break;
						}
					//Get the Table Group Code and continue on
					this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
				}
			}
		}
	}

	if (this.infoTableGroupCodeObj != null) {
		var tmp = this.infoTableGroupCodeObj.getSubgroups();
		if (tmp != null)
			this.infoTableSubGroupCodesObj = tmp.toArray();
	}

	//Set flags that can be used for validation
	this.validTables = (this.infoTableSubGroupCodesObj != null);
	this.valid = (this.refLicModel != null);

	this.getEmailTemplateParams = function (params) {
		addParameter(params, "$$LPLastName$$", this.refLicModel.getContactLastName());
		addParameter(params, "$$LPFirstName$$", this.refLicModel.getContactFirstName());
		addParameter(params, "$$LPMiddleName$$", this.refLicModel.getContactMiddleName());
		addParameter(params, "$$LPBusinesName$$", this.refLicModel.getBusinessName());
		addParameter(params, "$$LPBusinesLicense$$", this.refLicModel.getBusinessLicense());
		addParameter(params, "$$LPBusinesName2$$", this.refLicModel.getBusinessName2());
		addParameter(params, "$$LPLicSeqNbr$$", this.refLicModel.getLicSeqNbr());
		addParameter(params, "$$" + lictype + "$$", this.refLicModel.getLicenseType());
		addParameter(params, "$$LPLicenseState$$", this.refLicModel.getLicState());
		addParameter(params, "$$LPLicenseExpirationDate$$", this.refLicModel.getLicenseExpirationDate());
		addParameter(params, "$$LPLicenseInsuranceExpDate$$", this.refLicModel.getInsuranceExpDate());
		addParameter(params, "$$LPLicenseIssueDate$$", this.refLicModel.getLicenseIssueDate());
		addParameter(params, "$$LPPhone1$$", this.refLicModel.getPhone1());
		addParameter(params, "$$LPPhone2$$", this.refLicModel.getPhone2());
		addParameter(params, "$$LPPhone3$$", this.refLicModel.getPhone3());
		addParameter(params, "$$LPEmail$$", this.refLicModel.getEMailAddress());
		addParameter(params, "$$LPAddressLine1$$", this.refLicModel.getAddress1());
		addParameter(params, "$$LPAddressLine2$$", this.refLicModel.getAddress2());
		addParameter(params, "$$LPAddressLine3$$", this.refLicModel.getAddress3());
		addParameter(params, "$$LPCity$$", this.refLicModel.getCity());
		addParameter(params, "$$LPState$$", this.refLicModel.getState());
		addParameter(params, "$$LPZip$$", this.refLicModel.getZip());
		addParameter(params, "$$LPFax$$", this.refLicModel.getFax());
		addParameter(params, "$$LPCountry$$", this.refLicModel.getCountry());
		addParameter(params, "$$LPWcExpDate$$", this.refLicModel.getWcExpDate());
		addParameter(params, "$$LPWcPolicyNo$$", this.refLicModel.getWcPolicyNo());
		addParameter(params, "$$LPWcInsCoCode$$", this.refLicModel.getWcInsCoCode());
		return params;

	}

	//Get all the Table Values, done this way to keep it clean when a row is added
	//Can also be used to refresh manually
	this.refreshTables = function () {
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				var tableArr = new Array()
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
				if (columnsList != null) {
					columnsList = columnsList.toArray();
					for (column in columnsList) {
						var tmpCol = columnsList[column].getTableValues();
						//aa.print(columnsList[column])
						if (tmpCol != null) {
							tmpCol = tmpCol.toArray();
							tmpCol.sort(function (a, b) {
								return a.getRowNumber() - b.getRowNumber()
							})
							//EMSE Dom gets by column, need to pivot to list by row to make usable
							for (var row = 0; row < tmpCol.length; row++) {
								tmpCol[row].setRowNumber(row); //Fix the row numbers
								if (tableArr[row] == null)
									tableArr[row] = new Array();
								tableArr[row][columnsList[column].getName()] = tmpCol[row];
							}
						}
					}
				}
				this.infoTables[this.infoTableSubGroupCodesObj[tbl].getName()] = tableArr;
			}
		}
	}
	this.refreshTables(); //Invoke the Table Refresh to popualte our table arrays

	//Get max row from table for sequencing
	this.getMaxRowByTable = function (vTableName) {
		var maxRow = -1;
		if (this.validTables) {
			var tbl = this.infoTables[vTableName];
			if (tbl != null) {
				for (row in tbl)
					for (col in tbl[row]) //due to way data is stored must loop through all row/columns
						if (maxRow < parseInt(tbl[row][col].getRowNumber()))
							maxRow = parseInt(tbl[row][col].getRowNumber());
			}
		}
		return maxRow;
	}

	//Add Row to Table
	this.addTableRow = function (vTableName, vValueArray) {
		var retVal = false;
		var newRowArray = new Array();
		if (this.validTables)
			for (tbl in this.infoTableSubGroupCodesObj)
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var maxRow = this.getMaxRowByTable(vTableName) + 1;
					var colsArr = this.infoTableSubGroupCodesObj[tbl].getColumnDefines().toArray();
					var colNum = 0;
					colsArr.sort(function (a, b) {
						return (parseInt(a.getDisplayOrder()) - parseInt(b.getDisplayOrder()))
					});
					for (col in colsArr) {
						//12ACC-00189
						var tmpTv = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput().getInfoTableValueModel();
						tmpTv.setAuditStatus("A");
						tmpTv.setServProvCode(aa.getServiceProviderCode());
						tmpTv.setColumnNumber(colNum++);
						tmpTv.setAuditDate(colsArr[col].getAuditDate()); //need proper date
						if (typeof(currentUserID) != 'undefined') //check to make sure a current userID exists
							tmpTv.setAuditId(currentUserID);
						else
							tmpTv.setAuditId("ADMIN"); //default to admin
						tmpTv.setInfoId(colsArr[col].getId());
						tmpTv.setRowNumber(maxRow); //use static new row variable from object
						for (val in vValueArray)
							if (val.toString().toUpperCase() == colsArr[col].getName().toString().toUpperCase()) {
								tmpTv.setValue(vValueArray[val].toString()); //Get Value from associative array
							}

						colsArr[col].addTableValue(tmpTv);
						retVal = true;
					}
					this.refreshTables(); //refresh associative arrays
				}
		return retVal;
	}

	//Process an ASIT row into People Info
	this.addTableFromASIT = function (vTableName, vASITArray) {
		var retVal = true;
		if (this.validTables)
			for (row in vASITArray) { //for Each Row in the ASIT execute the add
				if (!this.addTableRow(vTableName, vASITArray[row]))
					retVal = false;
			}
		else
			retVal = false;
		return retVal;
	}

	//Remove Row from Table
	this.removeTableRow = function (vTableName, vRowIndex) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								tmpCol = tmpCol.toArray();
								//aa.print(tmpCol.length);
								if (vRowIndex <= tmpCol.length) {
									var tmpList = aa.util.newArrayList()
										for (row in tmpCol) {
											if (tmpCol[row].getRowNumber() != vRowIndex) {
												tmpList.add(tmpCol[row]);
												//aa.print(tmpCol[row].getColumnNumber() + " :" + tmpCol[row].getRowNumber());
											} else {
												retVal = true;
											}
										}
										columnsList[column].setTableValues(tmpList);
								} //End Remove
							} //end column Check
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	this.removeTable = function (vTableName) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								var tmpList = aa.util.newArrayList()
									columnsList[column].setTableValues(tmpList);
								retVal = true;
							} //End Remove
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	//Enable or Disable Table Row by index
	this.setTableEnabledFlag = function (vTableName, vRowIndex, isEnabled) {
		var updated = false
			var tmp = null
			tmp = this.infoTables[vTableName];
		if (tmp != null)
			if (tmp[vRowIndex] != null) {
				for (col in tmp[vRowIndex]) {
					tmp[vRowIndex][col].setAuditStatus(((isEnabled) ? "A" : "I"));
					updated = true;
				}
			}
		return updated;
	}

	//Makes table visible in ACA Lookup
	//vIsVisible = 'Y' or 'N'
	this.setDisplayInACA4Table = function (vTableName, vIsVisible) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							columnsList[column].setDisplayLicVeriForACA(vIsVisible);
							retVal = true;
						} //end column loop
					} //end column list check
					if (retVal) {
						var tmpList = aa.util.newArrayList();
						for (col in columnsList) {
							tmpList.add(columnsList[col]);
						}
						this.infoTableSubGroupCodesObj[tbl].setColumnDefines(tmpList);
					}
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check
		return retVal;
	}

	//Get the Attributes for LP
	if (this.valid) {
		var tmpAttrs = this.refLicModel.getAttributes();
		if (tmpAttrs != null) {
			var tmpAttrsList = tmpAttrs.values()
				var tmpIterator = tmpAttrsList.iterator();
			if (tmpIterator.hasNext()) {
				var tmpAttribs = tmpIterator.next().toArray();
				for (x in tmpAttribs) {
					this.attribs[tmpAttribs[x].getAttributeLabel().toUpperCase()] = tmpAttribs[x];
				}
				this.validAttrs = true;
			}
		}
	}

	//get method for Attributes
	this.getAttribute = function (vAttributeName) {
		var retVal = null;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null)
				retVal = tmpVal.getAttributeValue();
		}
		return retVal;
	}

	//Set method for Attributes
	this.setAttribute = function (vAttributeName, vAttributeValue) {
		var retVal = false;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null) {
				tmpVal.setAttributeValue(vAttributeValue);
				retVal = true;
			}
		}
		return retVal;
	}

	//Update From Record Contact by Contact Type
	//Uses first contact of type found
	//If contactType == "" then uses primary
	this.updateFromRecordContactByType = function (vCapId, vContactType, vUpdateAddress, vUpdatePhoneEmail) {
		this.retVal = false;
		if (this.valid) {
			var conArr = new Array();
			var capContResult = aa.people.getCapContactByCapID(vCapId);

			if (capContResult.getSuccess()) {
				conArr = capContResult.getOutput();
			} else {
				retVal = false;
			}

			for (contact in conArr) {
				if (vContactType.toString().toUpperCase() ==
					conArr[contact].getPeople().getContactType().toString().toUpperCase()
					 || (vContactType.toString() == "" && conArr[contact].getPeople().getFlag() == "Y")) {

					cont = conArr[contact];
					peop = cont.getPeople();
					addr = peop.getCompactAddress();

					this.refLicModel.setContactFirstName(cont.getFirstName());
					this.refLicModel.setContactMiddleName(peop.getMiddleName()); //get mid from peop
					this.refLicModel.setContactLastName(cont.getLastName());
					this.refLicModel.setBusinessName(peop.getBusinessName());
					if (vUpdateAddress) {
						this.refLicModel.setAddress1(addr.getAddressLine1());
						this.refLicModel.setAddress2(addr.getAddressLine2());
						this.refLicModel.setAddress3(addr.getAddressLine3());
						this.refLicModel.setCity(addr.getCity());
						this.refLicModel.setState(addr.getState());
						this.refLicModel.setZip(addr.getZip());
					}
					if (vUpdatePhoneEmail) {
						this.refLicModel.setPhone1(peop.getPhone1());
						this.refLicModel.setPhone2(peop.getPhone2());
						this.refLicModel.setPhone3(peop.getPhone3());
						this.refLicModel.setEMailAddress(peop.getEmail());
						this.refLicModel.setFax(peop.getFax());
					}
					//Audit Fields
					this.refLicModel.setAgencyCode(aa.getServiceProviderCode());
					this.refLicModel.setAuditDate(sysDate);
					this.refLicModel.setAuditID(currentUserID);
					this.refLicModel.setAuditStatus("A");

					retVal = true;
					break;
				}
			}
		}
		return retVal;
	}

	this.updateFromAddress = function (vCapId) {
		this.retVal = false;
		if (this.valid) {
			var capAddressResult = aa.address.getAddressByCapId(vCapId);
			var addr = null;
			if (capAddressResult.getSuccess()) {
				Address = capAddressResult.getOutput();
				for (yy in Address) {
					if ("Y" == Address[yy].getPrimaryFlag()) {
						addr = Address[yy];
						logDebug("Target CAP has primary address");
						break;
					}
				}
				if (addr == null) {
					addr = Address[0];
				}
			} else {
				logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
			}

			if (addr != null) {
				var addrLine1 = addr.getAddressLine1();
				if (addrLine1 == null) {
					addrLine1 = addr.getHouseNumberStart();
					addrLine1 += (addr.getStreetDirection() != null ? " " + addr.getStreetDirection() : "");
					addrLine1 += (addr.getStreetName() != null ? " " + addr.getStreetName() : "");
					addrLine1 += (addr.getStreetSuffix() != null ? " " + addr.getStreetSuffix() : "");
					addrLine1 += (addr.getUnitType() != null ? " " + addr.getUnitType() : "");
					addrLine1 += (addr.getUnitStart() != null ? " " + addr.getUnitStart() : "");
				}
				this.refLicModel.setAddress1(addrLine1);
				this.refLicModel.setAddress2(addr.getAddressLine2());
				this.refLicModel.setCity(addr.getCity());
				this.refLicModel.setState(addr.getState());
				this.refLicModel.setZip(addr.getZip());
				retVal = true;
			} else {
				retVal = false;
			}
		}
		return retVal;
	}

	//Update From Record Licensed Prof
	//License Number and Type must match that of the Record License Prof
	this.updateFromRecordLicensedProf = function (vCapId) {
		var retVal = false;
		if (this.valid) {

			var capLicenseResult = aa.licenseProfessional.getLicenseProf(capId);
			var capLicenseArr = new Array();
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			} else {
				retVal = false;
			}

			for (capLic in capLicenseArr) {
				if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
					 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {

					licProfScriptModel = capLicenseArr[capLic];

					this.refLicModel.setAddress1(licProfScriptModel.getAddress1());
					this.refLicModel.setAddress2(licProfScriptModel.getAddress2());
					this.refLicModel.setAddress3(licProfScriptModel.getAddress3());
					this.refLicModel.setAgencyCode(licProfScriptModel.getAgencyCode());
					this.refLicModel.setAuditDate(licProfScriptModel.getAuditDate());
					this.refLicModel.setAuditID(licProfScriptModel.getAuditID());
					this.refLicModel.setAuditStatus(licProfScriptModel.getAuditStatus());
					this.refLicModel.setBusinessLicense(licProfScriptModel.getBusinessLicense());
					this.refLicModel.setBusinessName(licProfScriptModel.getBusinessName());
					this.refLicModel.setCity(licProfScriptModel.getCity());
					this.refLicModel.setCityCode(licProfScriptModel.getCityCode());
					this.refLicModel.setContactFirstName(licProfScriptModel.getContactFirstName());
					this.refLicModel.setContactLastName(licProfScriptModel.getContactLastName());
					this.refLicModel.setContactMiddleName(licProfScriptModel.getContactMiddleName());
					this.refLicModel.setContryCode(licProfScriptModel.getCountryCode());
					this.refLicModel.setCountry(licProfScriptModel.getCountry());
					this.refLicModel.setEinSs(licProfScriptModel.getEinSs());
					this.refLicModel.setEMailAddress(licProfScriptModel.getEmail());
					this.refLicModel.setFax(licProfScriptModel.getFax());
					this.refLicModel.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
					this.refLicModel.setPhone1(licProfScriptModel.getPhone1());
					this.refLicModel.setPhone2(licProfScriptModel.getPhone2());
					this.refLicModel.setSelfIns(licProfScriptModel.getSelfIns());
					this.refLicModel.setState(licProfScriptModel.getState());
					this.refLicModel.setLicState(licProfScriptModel.getState());
					this.refLicModel.setSuffixName(licProfScriptModel.getSuffixName());
					this.refLicModel.setWcExempt(licProfScriptModel.getWorkCompExempt());
					this.refLicModel.setZip(licProfScriptModel.getZip());

					//new
					this.refLicModel.setFein(licProfScriptModel.getFein());
					//licProfScriptModel.getBirthDate()
					//licProfScriptModel.getTitle()
					this.refLicModel.setPhone3(licProfScriptModel.getPhone3());
					this.refLicModel.setBusinessName2(licProfScriptModel.getBusName2());

					retVal = true;
				}
			}
		}
		return retVal;
	}

	//Copy Reference Licensed Professional to a Record
	//If replace is true will remove and readd lic_prof
	//Currently wont copy infoTables...
	this.copyToRecord = function (vCapId, vReplace) {
		var retVal = false;
		if (this.valid) {
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
						 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {
						if (vReplace) {
							aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
							break;
						} else {
							existing = true;
						}
					}
				}
			}

			if (!existing) {
				capListResult = aa.licenseScript.associateLpWithCap(vCapId, this.refLicModel);
				retVal = capListResult.getSuccess();
				//Add peopleInfoTables via Workaround (12ACC-00186)
				if (this.validTables && retVal) {
					var tmpLicProfObj = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
					this.infoTableGroupCodeObj.setCapId1(vCapId.getID1());
					this.infoTableGroupCodeObj.setCapId2(vCapId.getID2());
					this.infoTableGroupCodeObj.setCapId3(vCapId.getID3());
					//save ref values
					var tmpRefId = this.infoTableGroupCodeObj.getReferenceId();
					var tmpRefType = this.infoTableGroupCodeObj.getReferenceType();
					var tmpRefDesc = this.infoTableGroupCodeObj.getReferenceDesc();
					//update Ref Values
					this.infoTableGroupCodeObj.setReferenceId(this.refLicModel.getStateLicense());
					this.infoTableGroupCodeObj.setReferenceType(this.refLicModel.getLicenseType());
					this.infoTableGroupCodeObj.setReferenceDesc("Description");
					this.infoTableGroupCodeObj.setCategory(1);
					tmpLicProfObj.setInfoTableGroupCodeModel(this.infoTableGroupCodeObj);
					aa.licenseProfessional.createInfoTable(tmpLicProfObj);
					//Set the cap back to null
					this.infoTableGroupCodeObj.setCapId1(null);
					this.infoTableGroupCodeObj.setCapId2(null);
					this.infoTableGroupCodeObj.setCapId3(null);
					//Set the ref values back
					this.infoTableGroupCodeObj.setReferenceId(tmpRefId);
					this.infoTableGroupCodeObj.setReferenceType(tmpRefType);
					this.infoTableGroupCodeObj.setReferenceDesc(tmpRefDesc);
				}
			}
		}
		return retVal;
	}

	this.enable = function () {
		this.refLicModel.setAuditStatus("A");
	}
	this.disable = function () {
		this.refLicModel.setAuditStatus("I");
	}

	//get records associated to license
	this.getAssociatedRecords = function () {
		var retVal = new Array();
		if (this.valid) {
			var resObj = aa.licenseScript.getCapIDsByLicenseModel(this.refLicModel);
			if (resObj.getSuccess()) {
				var tmp = resObj.getOutput();
				if (tmp != null) //make sure your not setting to null otherwise will not work like array
					retVal = tmp;
			}
		}
		return retVal;
	}

	//Save Changes to this object to Ref Licensed Professional
	this.updateRecord = function () {
		var retVal = false
			if (this.valid) {
				this.refreshTables(); //Must ensure row#s are good or wont show in ACA
				var res = aa.licenseScript.editRefLicenseProf(this.refLicModel);
				retVal = res.getSuccess();
			}
			return retVal;
	}

	return this
}


/*******************************************************************************************************/

function getInspectionScheduleParams4Notification(params) {

	// pass in a hashtable and it will add the additional parameters to the table
	// This should be called from InspectionScheduleAfter Event

	if (inspId) addParameter(params, "$$inspId$$", inspId);

	if (InspectorFirstName) addParameter(params, "$$InspectorFirstName$$", InspectorFirstName);

	if (InspectorMiddleName) addParameter(params, "$$InspectorMiddleName$$", InspectorMiddleName);

	if (InspectorLastName) addParameter(params, "$$InspectorLastName$$", InspectorLastName);

	if (inspGroup) addParameter(params, "$$inspGroup$$", inspGroup);


	if (InspectionTypeList) addParameter(params, "$$InspectionType$$", InspectionTypeList);

	if (inspSchedDate != null) addParameter(params, "$$InspectionDate$$", inspSchedDate);

	if (InspectionTime) addParameter(params, "$$InspectionTime$$", InspectionTime);

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
			else
                  addParameter(params, "$$wfComment$$", "");

	return params;

}

 /*******************************************************************************************************/

function sendV360MeterSetNotification(){
var notificationTemplate = "ROCH_V360_METER_SET_NOTICE";
var report = null;
var params = aa.util.newHashtable();
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
getRecordParams4Notification(params);
getACARecordParam4Notification(params,acaURL);
getV360InspectionResultParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

 function sendMeterSetNotification(){
var notificationTemplate = "ROCH_METER_SET_NOTICE";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getACARecordParam4Notification(params,acaURL);
getInspectionResultParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

 function sendBLDGInspectionPendingNotification(){
var notificationTemplate = "ROCH_BLDG_PENDING_INSPECTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Job Superintendent");
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

 function sendBLDGInspectionScheduleNotification(){
var notificationTemplate = "ROCH_BLDG_INSPECTION_SCHEDULED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Job Superintendent");
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

 function sendBLDGInspectionNRNotification(){
var notificationTemplate = "ROCH_BLDG_INSPECTION_NR_SCHEDULED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var parentCapID = null;
var parentCapID=getParent();
var contactTypesArray = new Array("Notice Recipient");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray(parentCapID);
var profObjArray = getLicenseProfessional(capId);
var iProf = null;
for (iProf in profObjArray) {
        var tProfObj = profObjArray[iProf];
        //logDebug("LP Name: " + tProfObj.people.getFirstName() + " " + tProfObj.people.getLastName());
        logDebug("LP Name: " + tProfObj);
        var vProfObj = new licenseProfObject(tProfObj.getLicenseNbr());



for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"])){


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getContactParams4Notification(params,"Notice Recipient");
			vProfObj.getEmailTemplateParams(params);
			getInspectionScheduleParams4Notification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
}

 /*******************************************************************************************************/


function sendBLDGInspectionResultApplNotification(){
var notificationTemplate = "ROCH_BLDG_INSPECTION_RESULT_APPL";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Job Superintendent");
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
      getInspectorNameParams4Notification (params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

 function sendBLDGInspectionResultApplV360Notification(){
var notificationTemplate = "ROCH_BLDG_INSPECTION_RESULT_APPLV360";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Job Superintendent");
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
			getV360InspectionResultParams4Notification(params);
                        getInspectorNameParams4Notification (params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

 function sendBldgInspectionResultNRNotification(){
var notificationTemplate = "ROCH_BLDG_RESULT_AMO_NR";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var parentCapID = null;
var parentCapID=getParent();
var contactTypesArray = new Array("Notice Recipient");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray(parentCapID);
var profObjArray = getLicenseProfessional(capId);
var iProf = null;
logDebug("parentCapID " + parentCapID);
logDebug("capID:" + capId);
for (iProf in profObjArray) {
        var tProfObj = profObjArray[iProf];
        //logDebug("LP Name: " + tProfObj.people.getFirstName() + " " + tProfObj.people.getLastName());
        logDebug("LP Name: " + tProfObj);
        var vProfObj = new licenseProfObject(tProfObj.getLicenseNbr());

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			vProfObj.getEmailTemplateParams(params);
			getInspectionResultParams4Notification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
}

 /*******************************************************************************************************/

function sendBldgInspectionResultNRV360Notification(){
var notificationTemplate = "ROCH_BLDG_INSPECTION_RESULT_NRV360";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var parentCapID = null;
var parentCapID=getParent();
var contactTypesArray = new Array("Notice Recipient");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray(parentCapID);
var profObjArray = getLicenseProfessional(capId);
var iProf = null;
logDebug("parentCapID " + parentCapID);
logDebug("capID:" + capId);
for (iProf in profObjArray) {
        var tProfObj = profObjArray[iProf];
        //logDebug("LP Name: " + tProfObj.people.getFirstName() + " " + tProfObj.people.getLastName());
        logDebug("LP Name: " + tProfObj);
        var vProfObj = new licenseProfObject(tProfObj.getLicenseNbr());


for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getContactParams4Notification(params,"Notice Recipient");
			vProfObj.getEmailTemplateParams(params);
			getV360InspectionResultParams4Notification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
}

 /*******************************************************************************************************/

 function sendBldgWTUA_IssuedNotification(){
var notificationTemplate = "ROCH_BLDG_WTUA_ISSUED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Job Superintendent");
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
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

  /*******************************************************************************************************/

 function sendFireWorkflowRZCOAPPREQESTEmail(){
var notificationTemplate = "ROCH_ZONE_RCOAPPREQUEST";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

  /*******************************************************************************************************/

function sendFireWorkflowROCHZ_RTCOAPPREQUESTEmail(){
var notificationTemplate = "ROCH_ZONE_RTCOAPPREQUEST";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

  /*******************************************************************************************************/


function sendFireWorkflowRCOAPPREQESTEmail(){
var notificationTemplate = "ROCH_FIRE_RCOAPPREQUEST";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

function sendFireWorkflowRCOAPPROVALEmail(){
var notificationTemplate = "ROCH_FIRE_COAPPROVED";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

function sendWorkflowZONERCOAPPROVALEmail(){
var notificationTemplate = "ROCH_ZONE_COAPPROVED";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*******************************************************************************************************/
function sendWorkflowZONERCOAPPROVALEmail(){
var notificationTemplate = "ROCH_ZONE_COAPPROVED";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*******************************************************************************************************/
function sendFireWorkflowROCH_RTCOAPPEmail(){
var notificationTemplate = "ROCH_FIRE_RTCOAPPROVAL";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}
 /*******************************************************************************************************/

function sendWorkflowZONE_RTCOAPPEmail(){
var notificationTemplate = "ROCH_ZONE_RTCOAPPROVAL";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*******************************************************************************************************/

function sendWorkflowZONE_RTCOAPPEmail(){
var notificationTemplate = "ROCH_ZONE_RTCOAPPROVAL";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*******************************************************************************************************/


function sendFireWorkflowROCH_RTCOAPPREQUESTEmail(){
var notificationTemplate = "ROCH_FIRE_RTCOAPPREQUEST";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

function sendFireWorkflowROCH_FIRE_RCORRECTIONSEmail(){
var notificationTemplate = "ROCH_FIRE_RCORRECTIONS";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

function sendZONEWorkflowROCH_CORRECTIONSEmail(){
var notificationTemplate = "ROCH_ZONE_CORRECTIONS";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

 /*******************************************************************************************************/

function sendZONEWorkflowROCH_CORRECTIONSEmail(){
var notificationTemplate = "ROCH_ZONE_CORRECTIONS";
var report = null;
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
getWorkflowTaskUpdateAfterforNotification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

 /*******************************************************************************************************/

 function sendPaymentInternalNotification(){
var notificationTemplate = "ROCH_ACA_LICENSEPMT_STAFF";
var report = null;
var receiptID = getReceiptNbr();
logDebug ("receiptID: " + receiptID);
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getACARecordParam4Notification(params,acaURL);
getPaymentReceivedParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
sendNotification("accela_maildev@rochestermn.gov","aheydon@rochestermn.gov","",notificationTemplate ,params,(report));
}

/************************************************************************************************/

function sendV360BackflowPreventionNotification(){
var notificationTemplate = "ROCH_V360_BACKFLOW_PREVENTION";
var report = null;
var params = aa.util.newHashtable();
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
getRecordParams4Notification(params);
getACARecordParam4Notification(params,acaURL);
getV360InspectionResultParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*************************************************************************************************/

function sendBackflowPreventionNotification(){
var notificationTemplate = "ROCH_BACKFLOW_PREVENTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
getRecordParams4Notification(params);
getACARecordParam4Notification(params,acaURL);
getInspectionResultParams4Notification(params);
getPrimaryAddressLineParam4Notification(params);
sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
}

/*******************************************************************************************************/

function sendBldgWTUA_IssuedNRNotification(){
var notificationTemplate = "ROCH_BLDG_WTUA_NR_ISSUED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var parentCapID = null;
var parentCapID=getParent();
var contactTypesArray = new Array("Notice Recipient");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray(parentCapID);
var profObjArray = getLicenseProfessional(capId);
var iProf = null;
logDebug("parentCapID " + parentCapID);
logDebug("capID:" + capId);
for (iProf in profObjArray) {
        var tProfObj = profObjArray[iProf];
        //logDebug("LP Name: " + tProfObj.people.getFirstName() + " " + tProfObj.people.getLastName());
        logDebug("LP Name: " + tProfObj);
        var vProfObj = new licenseProfObject(tProfObj.getLicenseNbr());

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getContactParams4Notification(params,"Notice Recipient");
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			vProfObj.getEmailTemplateParams(params);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
}
 /*******************************************************************************************************/

function sendOLM_BLDGInspResultApplNotification(){
var notificationTemplate = "OLM_BLDG_INSPECTION_RESULT_APPL";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			getV360InspectionResultParams4Notification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

function sendOLMBLDGInspectionNotification(){
var notificationTemplate = "OLM_BLDG_INSPECTION_SCHEDULED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

function sendLICInspectionScheduleNotification(){
var notificationTemplate = "ROCH_LIC_INSPECTION_SCHEDULED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Manager", "Agent", "Property Owner");
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

function sendOLMBldgWTUA_ExpiredNotification(){
var notificationTemplate = "OLM_BLDG_WTUA_EXP";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

/*******************************************************************************************************/


function sendOLMPlanWTUA_StatusNotification(){
var notificationTemplate = "OLM_PLAN_WTUA_STATUS";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
 /*******************************************************************************************************/

function sendOLMPlanWTUA_VarianceNotification(){
var notificationTemplate = "OLM_PLAN_WTUA_VARIANCE";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

 /*******************************************************************************************************/

function sendOLMPlanWTUA_ReferralNotification(){
var notificationTemplate = "OLM_PLAN_WTUA_REFERRAL";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate,params,(report));

		}

 /*******************************************************************************************************/

function sendOLMPlan_SDPNotification(){
var notificationTemplate = "OLM_PLAN_SDP";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate,params,(report));

		}

/*******************************************************************************************************/

function sendOLM_OISTSStatusNotification(){
var notificationTemplate = "OLM_OISTS_WTUA_STATUS";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
/*******************************************************************************************************/

function sendOLMBldgInspResultLPNotification(){
var notificationTemplate = "OLM_BLDG_INSP_RESULT_LP";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();
var profObjArray = getLicenseProfessional(capId);
var iProf = null;

for (iProf in profObjArray) {
        var tProfObj = profObjArray[iProf];
        //logDebug("LP Name: " + tProfObj.people.getFirstName() + " " + tProfObj.people.getLastName());
        logDebug("LP Email: " + tProfObj);
        var vProfObj = new licenseProfObject(tProfObj.getLicenseNbr());

		{


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			vProfObj.getEmailTemplateParams(params);
			getV360InspectionResultParams4Notification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov",tProfObj["email"],"",notificationTemplate ,params,(report));
			}
			}
			}


/_______________________________________________________________________________/

function getGISInfo2(svc, layer, attributename) // optional: numDistance, distanceType
{
	// use buffer info to get info on the current object by using distance 0 feet by default
	// 05/16/2012 - Paul H. Rose modified to add optional parameters
	// usage:
	//
	// x = getGISInfo2("flagstaff","Parcels","LOT_AREA");
	// x = getGISInfo2("flagstaff","Parcels","LOT_AREA", -1, "feet");

	var numDistance = 0
		if (arguments.length >= 4)
			numDistance = arguments[3]; // use numDistance in arg list
		var distanceType = "feet";
	if (arguments.length == 5)
		distanceType = arguments[4]; // use distanceType in arg list

	var retString;

	var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
	if (bufferTargetResult.getSuccess()) {
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
	} else {
		logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
		return false
	}

	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess())
		var fGisObj = gisObjResult.getOutput();
	else {
		logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
		return false
	}

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
	{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else {
			logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
			return false
		}

		for (a2 in proxArr) {
			var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
			for (z1 in proxObj) {
				var v = proxObj[z1].getAttributeValues()
					retString = v[0];
			}

		}
	}
	return retString
}

 /*******************************************************************************************************/

function doesASIFieldExistOnRecord(asiFieldName) {
	var appSpecInfoResult = aa.appSpecificInfo.getAppSpecificInfos(capId, asiFieldName)

		var appspecObj = appSpecInfoResult.getOutput();

	if (typeof(appspecObj[0]) != 'undefined') {
		return true;
	} else {
		return false;
	}
}
/*******************************************************************************************************/
 function sendLICInspectionCancelNotification(){
var notificationTemplate = "ROCH_LIC_CANCELLED_INSPECTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Manager", "Property Owner", "Agent");
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
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}


/*******************************************************************************************************/
 function sendLICInspV360CancelNotification(){
var notificationTemplate = "ROCH_LIC_V360_CANCELLED_INSPECTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Manager", "Property Owner", "Agent");
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
			getV360InspectionResultParams4Notification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

/*******************************************************************************************************/

function sendDemoBldgWTUA_DEMO_Notification(){
var notificationTemplate = "ROCH_DEMO_PERMIT";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}

/*******************************************************************************************************/

function sendDemoBldgWTUA_CLOSEDDEMO_Notification(){
var notificationTemplate = "ROCH_CLOSED_DEMO_PERMIT";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}

/*******************************************************************************************************/

function sendOlmDevAppl_Notification(){
var notificationTemplate = "OLM_PLAN_DEV_APPL";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}
/*******************************************************************************************************/

function sendOlmDevAmend_Notification(){
var notificationTemplate = "OLM_PLAN_DEV_AMEND";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}
/*******************************************************************************************************/


/*******************************************************************************function sendOlmDevFinal_Notification(){
var notificationTemplate = "OLM_PLAN_DEV_FINAL";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
                        getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}******************/

function runReportAttachForPermit(){

var reportName = "ACAResidentialTradePermit";

logDebug("BeforeGenerate");

runReportAttach(capId,reportName,"altId",capId.getCustomID());

}

/*************************************************************************************************/

function sendNotificationACAPERMITACCEPTED(){
var notificationTemplate = "ROCH_ACA_PERMIT_ACCEPTED";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray();

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"]))

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}}
}

/*************************************************************************************************/


function sendNotificationACAPERMITINCOMPLETE(){
var notificationTemplate = "ROCH_ACA_PERMIT_INCOMPLETE";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray();

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"]))

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}}
}

/*************************************************************************************************/

function sendFireFPE_CreatedNotification(){
var notificationTemplate = "ROCH_FIRE_FPE_SUBMIT";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();

 {
			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));
		}
}

/*************************************************************************************************/

function sendOLMBldgSSTS_COFC_Notification(){
var notificationTemplate = "OLM_BLDG_SSTS_COFC";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

/*************************************************************************************************/

function sendOBldgSSTS_ASBUILT_Notification(){
var notificationTemplate = "OLM_BLDG_SSTS_AS-BUILT";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}
/*************************************************************************************************/
function sendOBldgSSTS_ABANDON_Notification(){
var notificationTemplate = "OLM_BLDG_SSTS_ABANDON";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

/*************************************************************************************************/
function sendOBldgSSTS_ASBUILT_ABANDON_Notification(){
var notificationTemplate = "OLM_BLDG_SSTS_AS-BUILT_ABANDON";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}

/*************************************************************************************************/

function sendOWELL_ISSUED_Notification(){
var notificationTemplate = "OLM_WELL_ISSUED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Well Owner");
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
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}


/*************************************************************************************************/

function sendV360INSPDEMONotification(){
var notificationTemplate = "ROCH_V360INSP_DEMO";
var report = null;
var params = aa.util.newHashtable();

 {
			getRecordParams4Notification(params);
			getV360InspectionResultParams4Notification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

		}
}

/*************************************************************************************************/

function sendROCHINSPDEMONotification(){
var notificationTemplate = "ROCH_INSP_DEMO";
var report = null;
var params = aa.util.newHashtable();
 {
			getRecordParams4Notification(params);
			getInspectionResultParams4Notification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

		}
}

/*************************************************************************************************/

function runReport4Email(itemCap,reportName,conObj,rParams,eParams,emailTemplate,module,mailFrom) {
	//If email address available for contact type then email the report, otherwise return false;

	var reportSent = false;

	if (conObj) {
		if (!matches(conObj.people.getEmail(),null,undefined,"")) {
			//Send the report via email
			var rFile;
			rFile = generateReport(itemCap,reportName,module,rParams);

			if (rFile) {
				var rFiles = new Array();
				rFiles.push(rFile);
				sendNotification(mailFrom,conObj.people.getEmail(),"",emailTemplate,eParams,rFiles,itemCap);
				return true;
			}
		} else {
			reportSent = false;
		}
	} else {
		reportSent = false;
	}

	if (!reportSent) {
		return false;
	}
}

/*************************************************************************************************/
function runReport4EmailACA_ELEC_PERMIT(){
var notificationTemplate = "ROCH_BLDG_ACAELEC_ISSUED";
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var agencyReplyEmail = "accela_maildev@rochestermn.gov";
var iCon = null;
var contactArray = getContactArray();
var reportName = "ACARESTRADEPermitEmail";
var rptParams = aa.util.newHashMap();
rptParams.put("agencyid", servProvCode);
rptParams.put("capid",capIDString);

var contactObjArray = getContactObjs(capId,contactTypesArray);

	for (iCon in contactObjArray) {

	var tContactObj = contactObjArray[iCon];
	logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
	if (!matches(tContactObj.people.getEmail(),null,undefined,"")) {
	logDebug("Contact Email: " + tContactObj.people.getEmail());
//for (iCon in contactArray) {

  //if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		//tContact = contactArray[iCon];
		//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		//if (!isEmpty(tContact["email"])) {

			getRecordParams4Notification(params);
			tContactObj.getEmailTemplateParams(params);
			//getContactParams4Notification(params,"Applicant");
			//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			//logDebug("Contact Email: " + tContact["email"]);
			if(!matches(reportName,null,undefined,"")){
			runReport4Email(capId,reportName,tContactObj,rptParams,params,notificationTemplate,cap.getCapModel().getModuleName(),agencyReplyEmail);
			}
			else {
			sendNotification("accela_maildev@rochestermn.gov",tContactObj.people.getEmail(),"",notificationTemplate,params,null);
		}
}
}
}

/*************************************************************************************************/


function sendNotificationACAPERMITELECSUBMIT(){
var notificationTemplate = "ROCH_ACA_ELECAPPSUBMIT";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray();

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"]))

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}}
}

/*************************************************************************************************/

function runReport4EmailACA_RECEIPT(){
var notificationTemplate = "ROCH_ACAEMAIL_RECEIPT";
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var agencyReplyEmail = "accela_maildev@rochestermn.gov";
var iCon = null;
var contactArray = getContactArray();
var reportName = "Receipt for ACA";
var sReceiptNumber = getReceiptBatchNbr();
sReceiptNumber = sReceiptNumber.toString();
var rptParams = aa.util.newHashMap();
rptParams.put("agencyid", servProvCode);
rptParams.put("batchtransactionnbr", sReceiptNumber);
rptParams.put("capid", capIDString);

sReceiptNumber = sReceiptNumber.toString();

var contactObjArray = getContactObjs(capId,contactTypesArray);

	for (iCon in contactObjArray) {

	var tContactObj = contactObjArray[iCon];
	logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
	if (!matches(tContactObj.people.getEmail(),null,undefined,"")) {
	logDebug("Contact Email: " + tContactObj.people.getEmail());
//for (iCon in contactArray) {


  //if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		//tContact = contactArray[iCon];
		//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		//if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			tContactObj.getEmailTemplateParams(params);
			//getContactParams4Notification(params,"Applicant");
			//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			//logDebug("Contact Email: " + tContact["email"]);
			if(!matches(reportName,null,undefined,"")){
			runReport4Email(capId,reportName,tContactObj,rptParams,params,notificationTemplate,cap.getCapModel().getModuleName(),agencyReplyEmail);
			}
			else {
			sendNotification("accela_maildev@rochestermn.gov",tContactObj.people.getEmail(),"",notificationTemplate,params,null);
		}
}
}
}



/*************************************************************************************************/

function runReport4EmailACA_COMTradeELEC_PERMIT(){
var notificationTemplate = "ROCH_BLDG_ACAELEC_ISSUED";
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var agencyReplyEmail = "accela_maildev@rochestermn.gov";
var iCon = null;
var contactArray = getContactArray();
var reportName = "ACACommercialTradePermitEmail";
var rptParams = aa.util.newHashMap();
rptParams.put("agencyid", servProvCode);
rptParams.put("batchtransactionnbr", sReceiptNumber);
rptParams.put("capid", capIDString);

var contactObjArray = getContactObjs(capId,contactTypesArray);

	for (iCon in contactObjArray) {

	var tContactObj = contactObjArray[iCon];
	logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
	if (!matches(tContactObj.people.getEmail(),null,undefined,"")) {
	logDebug("Contact Email: " + tContactObj.people.getEmail());
//for (iCon in contactArray) {


  //if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		//tContact = contactArray[iCon];
		//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		//if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			tContactObj.getEmailTemplateParams(params);
			//getContactParams4Notification(params,"Applicant");
			//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			//logDebug("Contact Email: " + tContact["email"]);
			if(!matches(reportName,null,undefined,"")){
			runReport4Email(capId,reportName,tContactObj,rptParams,params,notificationTemplate,cap.getCapModel().getModuleName(),agencyReplyEmail);
			}
			else {
			sendNotification("accela_maildev@rochestermn.gov",tContactObj.people.getEmail(),"",notificationTemplate,params,null);
		}
}
}
}

/*************************************************************************************************/

function sendNotification4DemoPermit(){

 var permitNo = getCapId();
 var reportName = "DemolitionPermitForEmail";
 var reportHashTable = aa.util.newHashMap();
 addParameter(reportHashTable, 'altId', permitNo);
 var report = aa.reportManager.getReportInfoModelByName(reportName);
 report = report.getOutput();
 report.setModule(cap.getCapModel().getModuleName());
 report.setCapId(permitNo);
 report.setReportParameters(reportHashTable);
 report.getEDMSEntityIdModel().setAltId(permitNo);
 var reportResult = aa.reportManager.getReportResult(report);
 if (reportResult.getSuccess()) {
 reportResult = reportResult.getOutput();
 var reportFile = aa.reportManager.storeReportToDisk(reportResult);
 reportFile = reportFile.getOutput();

 var notificationTemplate = "ROCH_DEMO_PERMIT";
 var params = aa.util.getNewHashMap();

 if (reportFile) {

 getRecordParams4Notification(params);
 sendNotification("accela_maildev@rochestermn.gov", "", "", notificationTemplate, params, [reportFile],permitNo);
 }
 }
 }

/*************************************************************************************************/

function runReport4EmailACA_COMTradePlumb_PERMIT(){
var notificationTemplate = "ROCH_BLDG_ACAPLUMB_ISSUED";
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var agencyReplyEmail = "accela_maildev@rochestermn.gov";
var iCon = null;
var contactArray = getContactArray();
var reportName = "ACACommercialTradePermitEmail";
var rptParams = aa.util.newHashMap();
rptParams.put("agencyid", servProvCode);
rptParams.put("capid",capIDString);

var contactObjArray = getContactObjs(capId,contactTypesArray);

	for (iCon in contactObjArray) {

	var tContactObj = contactObjArray[iCon];
	logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
	if (!matches(tContactObj.people.getEmail(),null,undefined,"")) {
	logDebug("Contact Email: " + tContactObj.people.getEmail());
//for (iCon in contactArray) {


  //if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		//tContact = contactArray[iCon];
		//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		//if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			tContactObj.getEmailTemplateParams(params);
			//getContactParams4Notification(params,"Applicant");
			//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			//logDebug("Contact Email: " + tContact["email"]);
			if(!matches(reportName,null,undefined,"")){
			runReport4Email(capId,reportName,tContactObj,rptParams,params,notificationTemplate,cap.getCapModel().getModuleName(),agencyReplyEmail);
			}
			else {
			sendNotification("accela_maildev@rochestermn.gov",tContactObj.people.getEmail(),"",notificationTemplate,params,null);
		}
}
}
}

/*************************************************************************************************/

function runReport4EmailACAPlumb_PERMIT(){
var notificationTemplate = "ROCH_BLDG_ACAPLUMB_ISSUED";
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var agencyReplyEmail = "accela_maildev@rochestermn.gov";
var iCon = null;
var contactArray = getContactArray();
var reportName = "ACARESTRADEPermitEmail";
var rptParams = aa.util.newHashMap();
rptParams.put("agencyid", servProvCode);
rptParams.put("capid",capIDString);

var contactObjArray = getContactObjs(capId,contactTypesArray);

	for (iCon in contactObjArray) {

	var tContactObj = contactObjArray[iCon];
	logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
	if (!matches(tContactObj.people.getEmail(),null,undefined,"")) {
	logDebug("Contact Email: " + tContactObj.people.getEmail());
//for (iCon in contactArray) {


  //if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		//tContact = contactArray[iCon];
		//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		//if (!isEmpty(tContact["email"])) {


			getRecordParams4Notification(params);
			tContactObj.getEmailTemplateParams(params);
			//getContactParams4Notification(params,"Applicant");
			//logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			//logDebug("Contact Email: " + tContact["email"]);
			if(!matches(reportName,null,undefined,"")){
			runReport4Email(capId,reportName,tContactObj,rptParams,params,notificationTemplate,cap.getCapModel().getModuleName(),agencyReplyEmail);
			}
			else {
			sendNotification("accela_maildev@rochestermn.gov",tContactObj.people.getEmail(),"",notificationTemplate,params,null);
		}
}
}
}

/*************************************************************************************************/
function getReceiptBatchNbr() {

    receiptResult = aa.finance.getReceiptByCapID(capId, null);
    if (receiptResult.getSuccess()) {
        var receipt = null;
           receipt = receiptResult.getOutput();

        if (receipt[0] != undefined) {
                var maxReceiptNum = receipt.length-1;
            aa.print("Receipt successfully retrieved: " + receipt[maxReceiptNum].getReceiptBatchNbr());
            return parseInt(receipt[maxReceiptNum].getReceiptBatchNbr());
        } else {
            aa.print("Receipt Number Doesnt Exist.");
            return -1;
        }
    }
   else {
       aa.print("error getting the receipt nbr: " + receiptResult.getErrorMessage());
        return -1;
    }
}

/*******************************************************************************************************/
 function sendLICInspectionCompliantNotification(){
var notificationTemplate = "ROCH_LIC_COMPLIANT_INSPECTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();


			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getInspectionResultParams4Notification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}

/*******************************************************************************************************/

function getInspectorNameParams4Notification (params)  {
var userResult = aa.person.getUser(currentUserID); //The currentUserID variable is available in the IRSA event.
	var userFName = "Unknown";
	var userLName = "Unknown";
	if (userResult.getSuccess()) {
		userObj = userResult.getOutput();
		userFName = userObj.getFirstName();
		userLName = userObj.getLastName();
		comment("The user First name: "+userFName);
		comment("The user Last name: "+userLName);
	}

if (userFName) addParameter(params, "$$InspectorFName$$", userFName);
if (userLName) addParameter(params, "$$InspectorLName$$", userLName);

   return params;
}



/*******************************************************************************************************/
 function sendLICInspV360CompliantNotification(){
var notificationTemplate = "ROCH_LIC_V360_COMPLIANT_INSPECTION";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
			getACARecordParam4Notification(params,acaURL);
			getV360InspectionResultParams4Notification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));


}

 /*******************************************************************************************************/
function sendNotificationTCOMultiFam(){
var notificationTemplate = "ROCH_BLDG_MFNEW_TCO";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}
/*************************************************************************************************/
function sendNotificationCOFOMultiFam(){
var notificationTemplate = "ROCH_BLDG_MFNEW_COFO";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var params = aa.util.newHashtable();

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getWorkflowTaskUpdateAfterforNotification(params);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov","","",notificationTemplate ,params,(report));

}
/*************************************************************************************************/

function sendNotificationWAITINGPLANAPPROVAL(){
var notificationTemplate = "ROCH_BLDG_WAITING_FOR_PLAN_APPROVAL";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray();

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"]))

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}}
}

/*************************************************************************************************/
function sendNotificationACAPERMITDENIED(){
var notificationTemplate = "ROCH_APPLICATION_DENIED";
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var report = null;
var contactTypesArray = new Array("Applicant");
var params = aa.util.newHashtable();
var iCon = null;
var contactArray = getContactArray();

for (iCon in contactArray) {
if (exists(contactArray[iCon]["contactType"],contactTypesArray)) {

		tContact = contactArray[iCon];
		logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
		if (!isEmpty(tContact["email"]))

			getRecordParams4Notification(params);
      getACARecordParam4Notification(params,acaURL);
			getPrimaryAddressLineParam4Notification(params);
			getWorkflowTaskUpdateAfterforNotification(params);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}}
}

/*************************************************************************************************/

function runReportAttachCommercialTrade(){

var reportName = "ACACommercialTradePermitAttach";


logDebug("BeforeGenerate");

runReportAttach(capId,reportName,"capid",capId.getCustomID(),"agencyid","rochester");
}
/*******************************************************************************************************/
 function sendLICTerminatedNotification(){
var notificationTemplate = "ROCH_LIC_TERMINATED";
var report = null;
var acaURL = "acatest.rochestermn.gov/citizenaccessdev/";
var contactTypesArray = new Array("Applicant", "Manager", "Property Owner", "Agent");
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
			getWorkflowTaskUpdateAfterforNotification(params);
			logDebug("ContactName: " + tContact["firstName"] + " " + tContact["lastName"]);
			getPrimaryAddressLineParam4Notification(params);
			logDebug("Contact Email: " + tContact["email"]);
			sendNotification("accela_maildev@rochestermn.gov",tContact["email"],"",notificationTemplate ,params,(report));

		}
}
}
}



// 7-18-18  Keith Added Function createChildLic
function createChildLic(grp, typ, stype, cat, desc)
//
// creates the new application and returns the capID object
//
{
	try {
		var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
		logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
		if (appCreateResult.getSuccess()) {
			var newId = appCreateResult.getOutput();
			logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

			// create Detail Record
			capModel = aa.cap.newCapScriptModel().getOutput();
			capDetailModel = capModel.getCapModel().getCapDetailModel();
			capDetailModel.setCapID(newId);
			aa.cap.createCapDetail(capDetailModel);

			var newObj = aa.cap.getCap(newId).getOutput(); //Cap object
			var result = aa.cap.createAppHierarchy(capId, newId);
			if (result.getSuccess())
				logDebug("Child application successfully linked");
			else
				logDebug("Could not link applications");

                       	// Copy Parcels

			var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
			if (capParcelResult.getSuccess()) {
				var Parcels = capParcelResult.getOutput().toArray();
				for (zz in Parcels) {
					logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
					var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
					newCapParcel.setParcelModel(Parcels[zz]);
					newCapParcel.setCapIDModel(newId);
					newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
					newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
					aa.parcel.createCapParcel(newCapParcel);
				}
			}

			// Copy Contacts
			capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess()) {
				Contacts = capContactResult.getOutput();
				for (yy in Contacts) {
					var newContact = Contacts[yy].getCapContactModel();
					newContact.setCapID(newId);
					aa.people.createCapContact(newContact);
					logDebug("added contact");
				}
			}

			// Copy Addresses
			capAddressResult = aa.address.getAddressByCapId(capId);
			if (capAddressResult.getSuccess()) {
				Address = capAddressResult.getOutput();
				for (yy in Address) {
					newAddress = Address[yy];
					newAddress.setCapID(newId);
					aa.address.createAddress(newAddress);
					logDebug("added address");
				}
			}

			// Copy Owners  THIS IS ADDED for Sacramento County
			capOwnerResult = aa.owner.getOwnerByCapId(capId);
			if (capOwnerResult.getSuccess()) {
				Owner = capOwnerResult.getOutput();
				for (yy in Owner) {
					newOwner = Owner[yy];
					newOwner.setCapID(newId);
					aa.owner.createCapOwnerWithAPOAttribute(newOwner);
					logDebug("added owner");
				}
			}
			// Copy Work Description - This is custom for Sac County
			copyDetailedDescription(capId, newId);

			//Copy GIS Objects This is ADDED fro SACRAMENTO COUNTY
			var holdId = capId;
			capId = newId;
			copyParcelGisObjects();
			capId = holdId;

			return newId;
		} else {
			logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}

	} catch (err) {

		logDebug("A JavaScript Error occurred: " + err.message + " Line "  + err.lineNumber);
	}
}

// 7-18-18  Keith Added Function copyDetailedDescription

function copyDetailedDescription(srcCapId, targetCapId)
{
    //1. Get CapWorkDesModel with source CAPID.
    var srcCapWorkDesModel = getCapWorkDesModel(srcCapId);
    if (srcCapWorkDesModel == null)
    {
        return;
    }
    //2. Copy Detailed Description from source to target.
    var targetCapWorkDesModel = srcCapWorkDesModel.getCapWorkDesModel();
    targetCapWorkDesModel.setCapID(targetCapId);
    aa.cap.createCapWorkDes(targetCapWorkDesModel);
}

// 7-22-18  Keith Added Function getCapWorkDesModel
function getCapWorkDesModel(capId)
{
	capWorkDesModel = null;
	var s_result = aa.cap.getCapWorkDesByPK(capId);
	if(s_result.getSuccess())
	{
		capWorkDesModel = s_result.getOutput();
	}
	else
	{
		aa.print("ERROR: Failed to get CapWorkDesModel: " + s_result.getErrorMessage());
		capWorkDesModel = null;
	}
	return capWorkDesModel;
}



//  Keith 7/18/18 - added function getParentCapIDForReview
function getParentCapIDForReview(capid) {
	try {
		if (capid == null || aa.util.instanceOfString(capid)) {
			return null;
		}
		//1. Get parent license for review
		var result = aa.cap.getProjectByChildCapID(capid, "Renewal", "Incomplete"); //"Incomplete" was"Review"
		if (result.getSuccess()) {
			projectScriptModels = result.getOutput();
			if (projectScriptModels == null || projectScriptModels.length == 0) {
				logDebug("ERROR: Failed to get parent CAP with CAPID(" + capid + ") for review");
				return null;
			}
			//2. return parent CAPID.
			projectScriptModel = projectScriptModels[0];
			return projectScriptModel.getProjectID();
		} else {
			logDebug("ERROR: Failed to get parent CAP by child CAP(" + capid + ") for review: " + result.getErrorMessage());
			return null;
		}

	} catch (err) {

		logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
	}
}

/*******************************************************************************************************/

function addStdCondition_wAppStatus(cType, cDesc) // optional cap ID
{

	var itemCap = capId;
	var statusComment = aa.env.getValue("StatusComment");
	if (arguments.length == 3) {
		itemCap = arguments[2]; // use cap ID specified in args
	}
	if (!aa.capCondition.getStandardConditions) {
		logDebug("addStdCondition function is not available in this version of Accela Automation.");
	} else {
		standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
		for (i = 0; i < standardConditions.length; i++)
			// deactivate strict match for indy
			//if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
				standardCondition = standardConditions[i];

				var addCapCondResult = aa.capCondition.addCapCondition(itemCap, standardCondition.getConditionType(), standardCondition.getConditionDesc(),StatusComment, sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority(), standardCondition.getConditionOfApproval());

				if (addCapCondResult.getSuccess()) {
					logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
				} else {
					logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
				}
			}
	}
}
