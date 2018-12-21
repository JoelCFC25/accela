/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
| Version 1.1 - Updated for Multco 09/10/14 ETW
|               Modified 20151216 by NSS: added Enforcement as skip status; added Env print out
|
/------------------------------------------------------------------------------------------------------*/
/*
// Testing values.  Replace with batch parameters when testing is complete
aa.env.setValue("fromDate", "12/21/2017");
aa.env.setValue("toDate", "12/31/2017");
aa.env.setValue("appGroup", "EHS");
aa.env.setValue("appTypeType", "*");
aa.env.setValue("appSubtype", "License");
aa.env.setValue("appCategory", "*");
aa.env.setValue("expirationStatus", "Active");
aa.env.setValue("newExpirationStatus", "About to Expire");
aa.env.setValue("newApplicationStatus", "About to Expire");
aa.env.setValue("setProcessPrefix", "ETW_A");
aa.env.setValue("setRecordsPrefix", "ETW_B");
aa.env.setValue("setEmailPrefix", "ETW_C");
aa.env.setValue("setNonEmailPrefix", "ETW_D");
aa.env.setValue("setBillingContactPrefix", "ETW_E");
aa.env.setValue("emailAddress", "");
aa.env.setValue("showDebug", "true");
aa.env.setValue("sendEmailToContactTypes", "Billing Contact,Applicant");
aa.env.setValue("emailTemplate", "LICENSE ABOUT TO EXPIRE 90 DAYS");
aa.env.setValue("BatchJobName", "TestBatch");
aa.env.setValue("createRenewalRecord","Y");
aa.env.setValue("vASICheck",null);
aa.env.setValue("vASIValue",null);
aa.env.setValue("vASIExCheck",null);
aa.env.setValue("vASIExValue",null);
aa.env.setValue("vRunReport","N");
//*/
//aa.env.setValue("skipAppStatus", "Closed,Confirmed Closed,Denied,Enforcement,Out of County MU,Pending,Surveillance,Suspended,Terminated,Voided,Withdrawn,Withheld");
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var debug = "";
var emailText = "";
var maxSeconds = 200 * 60;		// number of seconds allowed for batch processing, usually < 5*60
var message = "";
var br = "<br>";
var showDebug = true;
var showMessage = false;

var appTypeArray;
var capId;
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 2.0;

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_BATCH"));

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var showDebug = aa.env.getValue("showDebug");

var sysDate = aa.date.getCurrentDate();
var batchJobResult = aa.batchJob.getJobID();
var batchJobName = "" + aa.env.getValue("BatchJobName");
var wfObjArray = null;


var batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var skipAppStatus = "Closed,Confirmed Closed,Denied,Enforcement,Pending,Suspended,Terminated,Voided,Withdrawn,Withheld" //20151120
var fromDate = getParam("fromDate");							// Hardcoded dates.   Use for testing only
var toDate = getParam("toDate");								// ""
var dFromDate = aa.date.parseDate(fromDate);					//
var dToDate = aa.date.parseDate(toDate);						//
//var lookAheadDays = aa.env.getValue("lookAheadDays");			// Number of days from today
//var daySpan = aa.env.getValue("daySpan");						// Days to search (6 if run weekly, 0 if daily, etc.)
var appGroup = getParam("appGroup");							//   app Group to process {Licenses}
var appTypeType = getParam("appTypeType");						//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");						//   app subtype to process {NA}
var appCategory = getParam("appCategory");						//   app category to process {NA}
var expStatus = getParam("expirationStatus");					//   test for this expiration status
var newExpStatus = getParam("newExpirationStatus");				//   update to this expiration status
var newAppStatus = getParam("newApplicationStatus");				//   update the CAP to this status
var vASICheck = getParam("vASICheck");
var vASIValue = getParam("vASIValue");
var vASIExCheck = getParam("vASIExCheck");
var vASIExValue = getParam("vASIExValue");
var setProcessPrefix = getParam("setProcessPrefix");
var setRecordsPrefix = getParam("setRecordsPrefix");
var setEmailPrefix = getParam("setEmailPrefix");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var setBillingContactPrefix = getParam("setBillingContactPrefix");
var skipAppStatusArray = skipAppStatus.split(","); //getParam("skipAppStatus").split(",");	//   Skip records with one of these application statuses
var emailAddress = getParam("emailAddress");					// email to send report
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");// send out emails?
var emailTemplate = getParam("emailTemplate");					// email Template. E.g., LICENSE ABOUT TO EXPIRE 90 DAYS
var createRenewalRecord = getParam("createRenewalRecord");	// create a temporary record
var currentUserID = "ADMIN"; // Current User
var disableTokens = false;		// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;	// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;	// Use Group name when populating Task Specific Info Values
var enableVariableBranching = true;	// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;			// Maximum number of std choice entries.  Entries must be Left Zero Padded
var publicUser = false;
var vRunReport = getParam("vRunReport");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

if (!fromDate.length) {// no "from" date, assume today + number of days to look ahead
    fromDate = dateAdd(null, parseInt(lookAheadDays));
}
if (!toDate.length) {// no "to" date, assume today + number of look ahead days + span
    toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan));
}
var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate);

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

if (appGroup == "") {
    appGroup = "*";
}
if (appTypeType == "") {
    appTypeType = "*";
}
if (appSubtype == "") {
    appSubtype = "*";
}
if (appCategory == "") {
    appCategory = "*";
}
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
logDebug("Environment: " + lookup("AGENCY_CONTACT_INFO", "01_Env")); //so output indicates if it came from TEST or PROD
logDebug("Start of Job");

try {
    mainProcess();
} catch (err) {
    logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
    logDebug("Stack: " + err.stack);
}

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length) {
    emailText = "<b>Debug Output:</b> <br>" + debug + "<b>Message Output:</b> <br>" + message;
    aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug");
if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ScriptReturnCode", "1");
    aa.env.setValue("ScriptReturnMessage", debug);
}
else {
    aa.env.setValue("ScriptReturnCode", "0");
    if (showMessage) {
        aa.env.setValue("ScriptReturnMessage", message);
    }
    if (showDebug) {
        aa.env.setValue("ScriptReturnMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Debug=Loop================>
/------------------------------------------------------------------------------------------------------*/

function mainProcess() {
    var capFilterType = 0;
    var capFilterInactive = 0;
    var capFilterError = 0;
    var capFilterStatus = 0;
    var capDeactivated = 0;
    var asiFilterStatus = 0;
    var capCount = 0;
    var emailCount = 0;
    var nonEmailCount = 0;
    var unqEmailCount = 0;
    var unqNonEmailCount = 0;
    var onlyNonEmailCount = 0;
    var vBiProcessCount = 0;
    var unqEmailArray = [];
    var sentEmail = false;
    var inspDate;
    var setId;
    var setName;
    var setDescription;
    var vSetArray
    var vUnqContactSetArray;
    var yy;
    var mm;
    var dd;
    var hh;
    var mi;
    var vProcessSet;
    var vRecordsSet;
    var vEmailSet;
    var vNonEmailSet;
    var vBillingContactSet;
    var vContactSet;
    var expResult;
    var myExp;
    var b1Exp;
    var b1ExpDate;
    var expDate;
    var b1Status;
    var renewalCapId;
    var altId;
    //var capIDString; //global variable needed for runASAForCapID function
    var capResult;
    //var appTypeResult; //global variable needed for runASAForCapID function
    //var cap; //global variable needed for runASAForCapID function
    //var capStatus; //global variable needed for runASAForCapID function
    var renewalCap
    //var appTypeString; //global variable needed for runASAForCapID function
    var createResult;
    var repURL;
    var conTypeArray;
    var conEmail;
    var conEmailList;
    var conEmailArray = [];
    var z;
    var y;
    var x;
    var w;
    var thisExp;
    var vConObj;
    var peopTemp;
    var vAllOptIn;
    var vExOptIn;
    var capId4Email;
    var fileNames = [];
    var vEParams;
    var vRParams;
    var vReport;
    var thisSet;
    var thisSetId;
    var vtmpCapSet;
    var orgName;
    var vAddressee = "";
    var addrStreet = "";
    var addrLine1 = "";
    var addrLine2 = "";
    var addrCity = "";
    var addrState = "";
    var addrZip = "";
    var addrFull = "";
    logDebug("skipAppStatus " + skipAppStatus);

    yy = startDate.getFullYear().toString().substr(2, 2);
    mm = (startDate.getMonth() + 1).toString();
    if (mm.length < 2) {
        mm = "0" + mm;
    }
    dd = startDate.getDate().toString();
    if (dd.length < 2) {
        dd = "0" + dd;
    }
    hh = startDate.getHours().toString();
    if (hh.length < 2) {
        hh = "0" + hh;
    }
    mi = startDate.getMinutes().toString();
    if (mi.length < 2) {
        mi = "0" + mi;
    }

    //Create a set of sets processed via this batch
    if (setProcessPrefix != "") {
        setId = setProcessPrefix.substr(0, 5) + yy + mm + dd + hh + mi;
        setName = setProcessPrefix + " Renewals Set of Sets";
        setDescription = setProcessPrefix + " : " + startDate.toLocaleString();

        //Create Process Set
        vProcessSet = new setSet(setId, setName, null, setDescription);
        vProcessSet.name = setName;
        vProcessSet.comment = setDescription;
    }

    //Create a set of all records processed by this batch
    if (setRecordsPrefix != "") {
        setId = setRecordsPrefix.substr(0, 5) + yy + mm + dd + hh + mi;
        setName = setRecordsPrefix + " Processed Set";
        setDescription = setRecordsPrefix + " : " + startDate.toLocaleString();

        //Create records Set
        vRecordsSet = new capSet3_0(setId, setName, null, setDescription);
        vRecordsSet.recSetType = "Billing";
        vRecordsSet.status = "Pending";
        vRecordsSet.update();

        //Add to processing set
        if (setProcessPrefix != "") {
            vProcessSet.add(setId);
        }
    }

    //Create a set of records where an email was sent
    if (setEmailPrefix != "") {
        setId = setEmailPrefix.substr(0, 5) + yy + mm + dd + hh + mi;
        setName = setEmailPrefix + " Email Set";
        setDescription = setEmailPrefix + " : " + startDate.toLocaleString();

        //Create Email Set
        vEmailSet = new capSet3_0(setId, setName, null, setDescription);
        vEmailSet.recSetType = "Billing";
        vEmailSet.status = "Pending";
        vEmailSet.update();

        //Add to processing set
        if (setProcessPrefix != "") {
            vProcessSet.add(setId);
        }
    }

    //Create a set of records where an email was not sent
    if (setNonEmailPrefix != "") {
        setId = setNonEmailPrefix.substr(0, 5) + yy + mm + dd + hh + mi;
        setName = setNonEmailPrefix + " Non-Email Set";
        setDescription = setNonEmailPrefix + " : " + startDate.toLocaleString();

        //Create NonEmail Set
        vNonEmailSet = new capSet3_0(setId, setName, null, setDescription);
        vNonEmailSet.recSetType = "Billing";
        vNonEmailSet.status = "Pending";
        vNonEmailSet.update();

        //Add to processing set
        if (setProcessPrefix != "") {
            vProcessSet.add(setId);
        }
    }

    //Create a set of sets of all Billing Contact sets
    if (setBillingContactPrefix != "") {
        setId = setBillingContactPrefix.substr(0, 5) + yy + mm + dd + hh + mi;
        setName = setBillingContactPrefix + " Billing Contact Set of Sets";
        setDescription = setBillingContactPrefix + " : " + startDate.toLocaleString();

        // Create Billing Contact Set of Sets
        vBillingContactSet = new setSet(setId, setName, null, setDescription);
        vBillingContactSet.name = setName;
        vBillingContactSet.comment = setDescription;

        //Add to processing set
        if (setProcessPrefix != "") {
            vProcessSet.add(setId);
        }
    }

    //Get all license records by their expiration date and expiration status
    expResult = aa.expiration.getLicensesByDate(expStatus, fromDate, toDate);
    myExp;

    if (expResult.getSuccess()) {
        myExp = expResult.getOutput();
        logDebug("Processing " + myExp.length + " expiration records");
    }
    else {
        logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage());
        return false;
    }

    for (thisExp in myExp) {
        // for each b1expiration (effectively, each license app)
        if (elapsed() > maxSeconds) {
            // only continue if time hasn't expired
            logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
            timeExpired = true;
            break;
        }

        b1Exp = myExp[thisExp];
        expDate = b1Exp.getExpDate();
        if (expDate) {
            b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
        }
        b1Status = b1Exp.getExpStatus();
        //get capId from expiration status model
        capId = aa.cap.getCapID(b1Exp.getCapID().getID1(), b1Exp.getCapID().getID2(), b1Exp.getCapID().getID3()).getOutput();

        if (!capId) {
            logDebug("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
            continue;
        }

        altId = capId.getCustomID();
        capIDString = capId.getCustomID();
        logDebug("     " + altId + ": Renewal Status : " + b1Status + ", Expires on " + b1ExpDate);
        capResult = aa.cap.getCap(capId);

        if (!capResult.getSuccess()) {
            logDebug("          " + altId + ": Record is deactivated, skipping");
            capDeactivated++;
            continue;
        }
        else {
            cap = capResult.getOutput();
        }

        capStatus = cap.getCapStatus();
        appTypeResult = cap.getCapType();		//create CapTypeModel object
        appTypeString = appTypeResult.toString();
        appTypeArray = appTypeString.split("/");

        //global variable needed for runASAForCapID function
        capName = cap.getSpecialText();
        fileDateObj = cap.getFileDate();
        fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
        parcelArea = 0;
        estValue = 0;
        //balanceDue = 0;
        //houseCount = 0;
        //feesInvoicedTotal = 0;
        capDetail = "";
        AInfo = new Array();
        //partialCap = false;
        //parentCapId = null;
        //CreatedByACA = 'N';

        // Filter by CAP Type
        if (appType.length && !appMatch(appType)) {
            capFilterType++;
            logDebug("          " + altId + ": Application Type does not match");
            continue;
        }

        // Filter by CAP Status
        if (exists(capStatus, skipAppStatusArray)) {
            capFilterStatus++;
            logDebug("          " + altId + ": skipping due to application status of " + capStatus);
            continue;
        }

        // Filter by ASI Field
        if (vASICheck != null && vASICheck != "" && vASIValue != null && vASIValue != "") {
            if (getAppSpecific(vASICheck, capId) != vASIValue) {
                asiFilterStatus++;
                logDebug("          " + altId + ": skipping due to ASI field " + vASIValue)
                continue;
            }
        }

        // Filter by ASI Field
        if (vASIExCheck != null && vASIExCheck != "" && vASIExValue != null && vASIExValue != "") {
            if (getAppSpecific(vASIExCheck, capId) == vASIExValue) {
                asiFilterStatus++;
                logDebug("          " + altId + ": skipping due to ASI field " + vASIExValue)
                continue;
            }
        }

        capCount++;

        //Add Record to record set
        if (setRecordsPrefix != "") {
            vRecordsSet.add(capId);
        }

        // update expiration status
        if (newExpStatus.length > 0) {
            b1Exp.setExpStatus(newExpStatus);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            logDebug("          " + altId + ": Update expiration status: " + newExpStatus);
        }

        // update CAP status
        if (newAppStatus.length > 0) {
            updateAppStatus(newAppStatus, "");
            logDebug("          " + altId + ": Updated Application Status to " + newAppStatus);
        }

        // create renewal record and run ASA event
        if (createRenewalRecord && createRenewalRecord.substring(0, 1).toUpperCase().equals("Y")) {
            createResult = aa.cap.createRenewalRecord(capId);
            if (!createResult.getSuccess()) {
                logDebug("          " + "Could not create renewal record : " + createResult.getErrorMessage());
            }
            else {
                renewalCapId = createResult.getOutput();
                if (renewalCapId == null) {
                    logDebug("          " + "RenewalCapId, " + renewalCapId + " is no good : " + capId);
                    continue;
                }
                renewalCap = aa.cap.getCap(renewalCapId).getOutput();
                if (renewalCap.isCompleteCap()) {
                    logDebug("          " + altId + ": Renewal Record already exists : " + renewalCapId.getCustomID());
                }
                else {
                    logDebug("          " + altId + ": created Renewal Record " + renewalCapId.getCustomID());
                    //add fees
                    runASAForCapID(renewalCapId);
                }
            }
        }

        //get Contact Emails
        if (sendEmailToContactTypes == "All") {
            sendEmailToContactTypes = "Applicant,Architect or Engineer,Billing Contact,Business Owner,Business Partner,Complainant,Director,District,Emergency Contact,Event Coordinator,General Contractor,Life Safety Officer,Operator,Person In Charge,Plan Review Contact,Pool Builder,Primary Contact,Property Manager,Responsible Party";
        }

        vAllOptIn = true;
        vExOptIn = null;
        conTypeArray = sendEmailToContactTypes.split(",");
        conEmailList = "";
        conEmailArray = [];
        var fileNames = [];
        z = 0;
        for (z in conTypeArray) {
            logDebug("          Searching for " + conTypeArray[z]); //this shows up blank in debug output
            vConObj = getContactObj(capId, conTypeArray[z]);
            if (vConObj) {
                //logDebug("          Found: " + vConObj.people.getFullName() + " " + vConObj.refSeqNumber);
                conEmail = vConObj.people.getEmail();
                logDebug("          Email: " + conEmail);
                peopTemp = vConObj.people.getTemplate();

                if (peopTemp) {
                    vExOptIn = vConObj.getASI("COMMUNICATION OPT-IN", "Email Opt-In");
                }
                if (vExOptIn != "CHECKED") {
                    vAllOptIn = false;
                }
                if (conTypeArray[z] == "Billing Contact") {
                    var vAddress = vConObj.people.getCompactAddress();
                    addrStreet = vAddress.getAddressLine1() + "";
                    addrLine2 = vAddress.getAddressLine2() + "";
                    if (addrLine2 != null && addrLine2 != "" && addrLine2 != "null") {
                        addrStreet = addrLine1 + " " + addrLine2;
                    }
                    addrCity = vAddress.getCity() + "";
                    addrState = vAddress.getState() + "";
                    addrZip = vAddress.getZip() + "";
                }

                vAddressee = getOrgOrContactName_FL("Billing Contact", capId);
                logDebug("vAddressee " + vAddressee + "; addrStreet " + addrStreet);
            } //if vConObj

            if (conEmail && conEmail != "" && !exists(conEmail, conEmailArray) && vExOptIn == "CHECKED") {
                logDebug("          Adding " + conEmail + " to email array");
                conEmailArray.push(conEmail);

                //Create a set for the Billing Contact
                if (setBillingContactPrefix != "") {
                    setId = vConObj.refSeqNumber + "";
                    setId = setId.substr(0, 5) + yy + mm + dd + hh + mi;
                    setName = vConObj.people.getFullName();
                    setDescription = vConObj.people.getFullName() + " : " + startDate.toLocaleString();

                    //Get or Create unique Billing Contact Set
                    vContactSet = new capSet3_0(setId, setName, null, setDescription);
                    vContactSet.recSetType = "Billing";
                    vContactSet.status = "Pending";
                    vContactSet.update();

                    //Add record to unique billing contact set
                    vContactSet.add(capId);

                    //Add unique contact set to Billing Contact set of sets (only if it doesn't already exist)
                    vBillingContactSet.refresh();
                    vSetArray = new Array();
                    x = 0;
                    //get existing set members and put in an array for comparison
                    for (x in vBillingContactSet.members) {
                        vSetArray.push(vBillingContactSet.members[x].getSetID());
                    }
                    //Add set to Billing Contact set if it doesn't already exists
                    if (!exists(setId, vSetArray)) {
                        vBillingContactSet.add(setId);
                    }
                }
            }
        }

        vReport = null;
        if (vRunReport == "Y") {
            //Setup report parameters
            vRParams = aa.util.newHashMap();
            addParameter(vRParams, "ShowPaidInvoices", "False");
            addParameter(vRParams, "ReportTitle", "Renewal Notice");
            addParameter(vRParams, "ID", altId);

            //generate and get report file
            vReport = generateReport(capId, "Renewal Notice", "EHS", vRParams);
        }

        //send emails to contact array
        sentEmail = false;
        y = 0;
        for (y in conEmailArray) {
            vEParams = aa.util.newHashtable();
            addParameter(vEParams, "$$altid$$", altId);
            addParameter(vEParams, "$$acaUrl$$", acaSite + getACAUrl());
            addParameter(vEParams, "$$businessName$$", cap.getSpecialText());
            addParameter(vEParams, "$$expirationDate$$", b1ExpDate);
            addParameter(vEParams, "$$orgName$$", vAddressee);
            addParameter(vEParams, "$$address1_2$$", addrStreet);
            //addParameter(vEParams, "$$address2$$", addrLine2);
            addParameter(vEParams, "$$city$$", addrCity);
            addParameter(vEParams, "$$state$$", addrState);
            addParameter(vEParams, "$$zip$$", addrZip);
            capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
            if (vReport != false) {
                fileNames[0] = vReport; // attaches the invoice to the email
            }
            aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmailArray[y], "", emailTemplate, vEParams, capId4Email, []);
            logDebug("          " + altId + ": Sent Email template " + emailTemplate + " to " + conEmailArray[y]);
            emailCount++;
            sentEmail = true;
        }

        if (sentEmail == true && setEmailPrefix != "") {
            // Add Record to Email Set
            vEmailSet.add(capId);
            unqEmailCount++;
        }
        if (!vAllOptIn && setNonEmailPrefix != "") {
            // Add Record to Non-Email Set
            vNonEmailSet.add(capId);
            unqNonEmailCount++;
        }
        if (!vAllOptIn && !sentEmail) {
            // Add Record to Non-Email Set
            onlyNonEmailCount++;
        }
        if (vAllOptIn && !sentEmail) {
            // Add Record to Non-Email Set
            onlyNonEmailCount++;
        }
        if (!vAllOptIn && sentEmail) {
            vBiProcessCount++;
        }
    } //thisExp For Loop

    //Remove unique billing contact sets with only one record
    if (setBillingContactPrefix != "") {
        vBillingContactSet.refresh();
        w = 0;
        thisSet = null;
        thisSetId = null;
        vtmpCapSet = null;
        for (w in vBillingContactSet.members) {
            thisSet = vBillingContactSet.members[w];
            thisSetId = thisSet.getSetID()
            vtmpCapSet = new capSet3_0(thisSetId);
            if (vtmpCapSet.size <= 1) {
                vBillingContactSet.remove(thisSetId);
                aa.set.removeSetHeader(thisSetId);
            }
        }
    }

    logDebug("Total CAPS qualified date range: " + myExp.length);
    logDebug("Ignored due to application type: " + capFilterType);
    logDebug("Ignored due to CAP Status: " + capFilterStatus);
    logDebug("Ignored due to Deactivated CAP: " + capDeactivated);
    logDebug("Ignored due to ASI field: " + asiFilterStatus);
    logDebug("Records processed completely via email: " + unqEmailCount);
    logDebug("Records processed without any emails: " + onlyNonEmailCount);
    logDebug("Records processed with and without emails: " + vBiProcessCount);
    logDebug("Total Emails Sent: " + emailCount);
    logDebug("Total CAPS processed: " + capCount);
}

function generateReport(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID;   // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap.getCustomID());
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);
    if (permit.getOutput().booleanValue()) {
        var reportResult = aa.reportManager.getReportResult(report);
        if (!reportResult.getSuccess()) {
            logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
        else {
            var reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            logDebug("Report " + reportName + " generated for record " + itemCap.getCustomID());
            return reportFile;
        }
    }
    else {
        logDebug("Permissions are not set for report " + reportName + ".");
        return false;
    }
}
