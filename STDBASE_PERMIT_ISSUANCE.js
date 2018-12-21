/*
 * Title : Permit Issuance
 *
Purpose : follows the rules set to update the permit record and associated components

Author: Yazan Barghouth

Functional Area : Workflow Update,Inpsection Result, Payment Received, does NOT support (PageFlow)

Description : JSON Example:

{
  "Building/Residential/New/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "permit record update",
          "operators": {

          }
        },
        "preScript": "",
        "criteria": {
          "allowBalance": false,
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "activateTask": ["task-1"],
          "deactivateTask": ["task-2"],
          "updateTask": [
            {
              "task": "Intake",
              "status": "Accepted"
            }
          ],
          "issuedStatus": "Active",
          "expirationStatus": "Active",
          "expirationDaysOut": 180,
          "setName": "BUILDING_PERMIT_"
        },
        "postScript": ""
      }
    ]
  }
}

 */

try {
	//try to get CONFIGURABLE_SCRIPTS_COMMON from Non-Master, if not found, get from Master
	var configurableCommonContent = getScriptText("CONFIGURABLE_SCRIPTS_COMMON");
	if (configurableCommonContent && configurableCommonContent != null && configurableCommonContent != "") {
		eval(configurableCommonContent);
	} else {
		eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON", null, true));
	}

	var settingsArray = [];
	var scriptSuffix = "PERMIT_ISSUANCE";

	isConfigurableScript(settingsArray, scriptSuffix);

	for (s in settingsArray) {
		var rules = settingsArray[s];

		if (!isEmptyOrNull(rules.preScript)) {
			eval(getScriptText(rules.preScript, null, false));
		}
		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		updatePermitComponents(rules);

		if (!isEmptyOrNull(rules.postScript)) {
			eval(getScriptText(rules.postScript, null, false));
		}
	}//for all settingsArray
} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * Update permit components, such ass app status, expiration data and status, and other components
 * @param rules JSON element from settings array
 */
function updatePermitComponents(rules) {

	//check criteria allowBalance:
	if (!isEmptyOrNull(rules.criteria.allowBalance) && rules.criteria.allowBalance == false) {
		var capDetails = aa.cap.getCapDetail(capId).getOutput();
		if (capDetails.getBalance() > 0) {
			return false;
		}
	}//criteria.allowBalance

	if (!isEmptyOrNull(rules.action.activateTask)) {
		for (t in rules.action.activateTask) {
			activateTask(rules.action.activateTask[t]);
		}
	}//activateTask

	if (!isEmptyOrNull(rules.action.deactivateTask)) {
		for (t in rules.action.deactivateTask) {
			deactivateTask(rules.action.deactivateTask[t]);
		}
	}//deactivateTask

	if (!isEmptyOrNull(rules.action.updateTask)) {
		for ( var t in rules.action.updateTask) {
			var taskItem = rules.action.updateTask[t];
			var taskResult = aa.workflow.getTask(capId, taskItem.task);
			var currentTask = taskResult.getOutput();
			if (currentTask != null && currentTask != "") {
				activateTask(taskItem.task);
				currentTask.setSysUser(aa.person.getCurrentUser().getOutput());
				currentTask.setDisposition(taskItem.status);
				var updateResult = aa.workflow.handleDisposition(currentTask.getTaskItem(), capId);
			}
		}
	}//updateTask

	if (!isEmptyOrNull(rules.action.issuedStatus)) {
		updateAppStatus(rules.action.issuedStatus, "by auto script");
	}//issuedStatus

	var expirationResult = aa.expiration.getLicensesByCapID(capId);
	if (expirationResult.getSuccess() && expirationResult.getOutput() != null) {
		expirationResult = expirationResult.getOutput();
		if (!isEmptyOrNull(rules.action.expirationDaysOut)) {
			expirationResult.setExpDate(aa.date.parseDate(dateAdd(aa.util.now(), rules.action.expirationDaysOut)));
		}
		if (!isEmptyOrNull(rules.action.expirationStatus)) {
			expirationResult.setExpStatus(rules.action.expirationStatus);
		}
		aa.expiration.editB1Expiration(expirationResult.getB1Expiration());
	}//expirationResult is OK

	if (!isEmptyOrNull(rules.action.setName)) {
		var theSetName = String(rules.action.setName);
		if (theSetName.charAt(theSetName.length - 1) != '_')
			theSetName = theSetName + '_';

		theSetName = theSetName + aa.util.formatDate(new Date(), "MMddYYYY");
		var theSet = aa.set.getSetByPK(theSetName);
		if (!theSet.getSuccess() && theSet.getOutput() == null && theSet.getErrorMessage() == " Set don't exist. ") {
			//set not found, create it
			theSet = aa.set.createSet(theSetName, theSetName);
			if (!theSet.getSuccess()) {
				logDebug("**WARN failed to create set " + theSetName + " Error: " + theSet.getErrorMessage());
				return false;
			}
		}//set not found

		var added = aa.set.addCapSetMember(theSetName, capId);
		if (!added.getSuccess()) {
			logDebug("**WARN failed to add capId to set " + theSetName + " Error: " + added.getErrorMessage());
			return false;
		}
	}//setName not empty

}//updatePermitComponents()
