/* Created by antalol on 03/11/2016.

 Account Application
 ===================

 Dependncies:
 ============
 AA.js
 AAutil.js
 AArest.js
 AAdropdown.js

*/

var _apiDomain;
var dom = window.location.hostname;
if (dom.indexOf("net") == 0) _apiDomain = "https://net-api.nadex.com"
else if (dom.indexOf("trade") == 0) _apiDomain = "https://net-api.nadex.com"
else if (dom.indexOf("demo") == 0) _apiDomain = "https://demo-api.nadex.com"
else if (dom.indexOf("web") == 0) _apiDomain = "https://web-api.nadex.com"
else _apiDomain = "https://api.nadex.com"

var PMSon = false;

var oneTimeToken = null;

var iFrameBottomPadding = 30;

var AAc = AA.constants;
var _setEvent = AA.event.setEvent;
var _thisRest = new AA.REST();
var pwd = null;
var thisAppFormVersion = "";
var thisAppFormType = "";
var thisAppFormId = "";
var appForm = null;
var timeStamp = null;
var offset = 0;
var answers = null;
var originalAnswers = null;
var validation = null;
var aboutUsObj = {};
var countryList = {};
var inFullValidate = false;
var openAllPages = false;
var nexmoKey = null;
var nexmoToken = null;
var _loadedPage;
var DEVICE_TYPE = "DESKTOP";

var FIELD = "FIELD",
    BUTTON = "BUTTON",
    DROPDOWN = "DROPDOWN",
    STATIC = "STATIC",
    CHECKBOX = "CHECKBOX",
    INVERTED_CHECKBOX = "INVERTED_CHECKBOX",
    BREAK = "BREAK",
    FORM_TAB = "FORM_TAB",
    RADIO = "RADIO",
    OBSCURED_FIELD = "OBSCURED_FIELD",
    TOGGLED_PASSWORD = "TOGGLED_PASSWORD",
    TEXTAREA = "TEXTAREA";

var PAGEONE = 1;
var RESUMEPAGE = 6;
var RESETPAGE = 7;
var DEMOPAGE = 10;
var DEMOPAGEPHONE = 11;

var OBSCURE_CHAR = "\u2022"; //"*";
var pageId = {
 "resume": 6
};

var nextPageNo = null;
var prevPageNo = null;

/*****************************************************
 NOTE:
 
 Bit maps  / fields are 2^n values that represent the
 validation status of each succesive page
 0 - not validated,
 1 - fully validated
 
 INVERSE bit maps / fields represent the 1's complement
 or mask value of the corresponding bit
 E.g. For bit 4 (page 4)
 The field value is
 2^4 == 16
 The inverse value is 2^7-1 (7 pages) - 2^4 == 111
 *****************************************************/

//old page bit feilds (prior to new nexmo third page)
var PAGE_BITMAP = [0, 1, 2, 4, 8, 16, 32, 64];
var INV_BITMAP = [0, 126, 125, 123, 119, 111, 95, 63];

//new page bit feilds (after adding new nexmo third page)
var BIT_FIELD = [0, 1, 2, 8, 16, 32, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4];
var INV_BIT_FIELD = [0, 126, 125, 119, 111, 95, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 123];

var PAGE_LOOKUP = ["0", "1", "2", "25", "3", "4", "5", "6"];

var nexmoReqXLTS = null;
var nexmoReqXLMs = 30000;

var demoTmpAnswers;
var dialingPrefText = "+1";
var fullDialingPrefix = "001";

var validatedPages = 0;

var countryLoaded = false;
var statesLoaded = false;

var isUSA = false;

var dropDownLookup = {};

var defaultAllowed = "^[0-9a-zA-Z\\.\\,\\;\\@\\:\\!\\?\\_\\(\\)\\-\\ \\'\\n\\u00C0-\\u017F]*$";

var _currentPage = PAGEONE;

var queryDict = AA.buildQueryDict(location.search);

var stateList;

var PMSenabled = queryDict['PMS'];
if (PMSenabled && PMSenabled === "on") PMSon = true;

var inResetLead = false;

var toResetLead = queryDict['func'];
if (toResetLead && toResetLead === "reset") {
 var token = queryDict['t'];
 var hash = queryDict['h'];
 inResetLead = true;
}

var IGUSClientDataObj = null;
var USClientToken = null;
var autoPopulate = false;
USClientToken = queryDict['tok'];
if (USClientToken) autoPopulate = true;

var isDebug = true;
var isDemo = false;
var isApp = false;
var isUnified = false;
var uHash, uUid;

if (queryDict["uni"]) {
 if (queryDict["uni"].toLowerCase() == "true") {
  isUnified = true;
  uHash = queryDict["h"].toUpperCase();
  uUid = queryDict["u"].toUpperCase();
  DEVICE_TYPE = "UNIFIED";
 }
}

if (queryDict["debug"]) {
 if (queryDict["debug"].toLowerCase() == "true") isDebug = true
 else isDebug = false;
}

if (queryDict["app"]) {
 isApp = true;
 if (queryDict["app"].toLowerCase() == "demo") isDemo = true;
}

AA.setCookieExpires("isApp", isApp, "nadex.com", 1);

var formTypeFlag = null;

PROD = 1;
DEMO = 2;

if (queryDict["formType"]) {
 if (queryDict["formType"].toLowerCase() == "prod") formTypeFlag = PROD;
 if (queryDict["formType"].toLowerCase() == "demo") formTypeFlag = DEMO;
}

var ua = navigator.userAgent || navigator.vendor || window.opera;

var isDesktop;

var deviceType = checkDeviceType(ua);

isDesktop = (deviceType == "desktop");

var channelBase = "online";
var channelDevice = deviceType;
var channelType = "site";

if (isApp) {
 if (isDemo) channelType = "demo";
 else channelType = "app";
}

var channelId = channelBase + "." + channelDevice + "." + channelType;

var requestId;

var inMobileApp = false;
if (/IGMarkets/i.test(ua)) inMobileApp = true;

var thisSubmitMemObj = {
 "username": "",
 "password": ""
};

var thisSubmitUsernameObj = {
 "credentialValue": "",
 "credentialType": ""
};

var thisResetLeadObj = {
 "emailAddress": ""
};

var thisResetAAObj = {
 "hash": "",
 "token": ""
};

var thisUSClientDataObj = {
 "token": ""
};

var QPID = null;

var loginDetails = {
 username: ""
};

var oldHeight = -1;

var currentPageHeight = 0;

var LINKS = {
 "OLD": {
  "accountTypes": "https://www.nadex.com/why-nadex/account-types/?type=business",
  "legal": "https://www.nadex.com/legal",
  "riskDisclosure": "https://www.nadex.com/sites/default/files/pdf/nadex-risk-disclosure.pdf",
  "membershipAgreement": "https://www.nadex.com/sites/default/files/pdf/nadex-membership-agreement.pdf",
  "privacyPolicy": "https://www.nadex.com/sites/default/files/pdf/nadex-privacy-policy.pdf",
  "eSignatureAct": "https://www.nadex.com/sites/default/files/pdf/nadex-e-signature-act.pdf",
  "termsAndConditions": "https://www.nadex.com/sites/default/files/pdf/nadex-terms-and-conditions.pdf",
  "rules": "https://www.nadex.com/sites/default/files/pdf/nadex_rules.pdf",
  "pageUnavailable": "/response/page-unavailable"
 },
 "NEW": {
  "accountTypes": "https://nadex.com/learning/how-do-i-set-up-an-entity-account/?type=business",
  "legal": "https://www.nadex.com/legal",
  "riskDisclosure": "https://www.nadex.com/rules/",
  "membershipAgreement": "https://www.nadex.com/rules/",
  "privacyPolicy": "https://www.nadex.com/legal",
  "eSignatureAct": "https://www.nadex.com/legal",
  "termsAndConditions": "https://www.nadex.com/legal",
  "rules": "https://www.nadex.com/rules/",
  "pageUnavailable": "/response/page-unavailable"
 }
}

var validateActionCache = [];
var isFullValid = false;
var errorList = [];

var checkStatusObj = {
 "credentialType": null,
 "credentialValue": null
};

var checkDemoStatusObj = {
 "credentialType": null,
 "credentialValue": null
};

var singleErrorCheck = true; // mutex to stop multiple checks from causing infinite loops
var eventMutex = false;
var clearMutexTO = null;

var delayedCB = null;

var lookUpMonthIndex = {
 "January": 1,
 "February": 2,
 "March": 3,
 "April": 4,
 "May": 5,
 "June": 6,
 "July": 7,
 "August": 8,
 "September": 9,
 "October": 10,
 "November": 11,
 "December": 12
};

var noHide = false;

var excludeCountries = {
 "IM": true,
 "GG": true,
 "JE": true
}

var inBuild = false;

var pubKey = null;

function trackEvents(data) {
 parent.postMessage({
  trackEvents: data
 }, "*");
 console.log("trackerEvent: " + JSON.stringify(data));
}

function pageTransitionEvent(env) {
 data = {};
 data.event = 'virtual_page_view';
 data.page_category = env + ' application';
 data.virtual_report_path = '/account-application-ui-service/html/account-application.html?page=' + _currentPage;
 data.page_type = 'signup_form';

 trackEvents(data);
}

function liveAccountStartEvent() {
 data = {};
 data.event = 'live_account_start';
 data.event_category = 'Nadex Live Account';
 data.event_action = 'Application Start';
 data.cta_name = 'Create live account';
 data.cta_type = 'Header Link';
 trackEvents(data);
}

function liveAccountErrorEvent(Err, field) {
 data = {};
 data.event = 'live_account_error';
 data.error = Err;
 data.event_category = 'Nadex Live Account';
 data.event_action = 'Error';
 data.event_label = Err + " - " + field;
 data.field_name = field;
 trackEvents(data);
}

function liveAccountSignupEvent(employmentStatus, countryOfResidence) {
 data = {};
 data.event = 'live_account_signup';
 data.event_category = 'Nadex Live Account';
 data.event_action = 'Application Complete';
 data.employment_status = employmentStatus;
 data.country_of_residence = countryOfResidence;
 data.account_type = 'Non-Leveraged';

 data.nationality = undefined;
 data.annual_income = undefined;
 data.savings_and_investements = undefined;
 data.funding_type = undefined;
 data.way_of_trading = undefined;

 data.trading_experience = undefined;
 data.application_attempt = 1;
 data.live_applications_completed = 1;
 trackEvents(data);
}

function demoAccountStartEvent() {
 data = {};
 data.event = 'demo_account_interaction';
 data.error = undefined;
 data.event_category = 'Nadex Demo Account';
 data.event_action = 'Start Application';
 data.event_label = undefined;
 data.is_validation_error = 0;
 data.is_form_opening = 1;
 data.interaction_type = 'Start Application';
 data.field_name = undefined;
 trackEvents(data);
}

function demoAccountErrorEvent(Err, field, val) {
 data = {};
 data.event = 'demo_account_interaction';
 data.error = Err;
 data.event_category = 'Nadex Demo Account';
 data.event_action = 'Error';
 data.event_label = Err + " - " + field;
 data.is_validation_error = val;
 data.is_form_opening = 0;
 data.interaction_type = 'Error';
 data.field_name = field;
 trackEvents(data);
}

function demoAccountSignupEvent() {
 data = {};
 data.event = 'demo_account_signup';
 data.event_category = 'Nadex Demo Account';
 data.event_action = 'sign up';
 data.demo_applications_completed = 1;
 trackEvents(data);
}

function genericAccountErrorEvent(Err, field, val) {
 if (thisAppFormType == "DEMO") demoAccountErrorEvent(Err, field, val)
 else liveAccountErrorEvent(Err, field)
}

function invalidate() {
 validatedPages = 0;
 if (document.getElementById("AAValidatedPages")) document.getElementById("AAValidatedPages").value = validatedPages;
}

function setValidate() {
 if (nextPageNo) validatedPages |= BIT_FIELD[_currentPage]
 else validatedPages |= PAGE_BITMAP[_currentPage];
 if (document.getElementById("AAValidatedPages")) document.getElementById("AAValidatedPages").value = validatedPages;
}

function unsetValidate() {
 if (nextPageNo) validatedPages &= INV_BIT_FIELD[_currentPage]
 else validatedPages &= INV_BITMAP[_currentPage];
 if (document.getElementById("AAValidatedPages")) document.getElementById("AAValidatedPages").value = validatedPages;
}

function firstUnvalidatedPage(answers) {
 var i;
 if (isUnified) {
  //When unified make sure to show the nexmo code it if exists
  if (document.getElementById("nexmoValidation")) document.getElementById("nexmoValidation").style.display = "block";
  return 1;
 }
 for (i = 0; i < answers.length; i++) {
  if (answers[i].questionKey == "AAValidatedPages") validatedPages = answers[i].answerValue;
 }
 for (i = 1; i < 8; i++) {
  if (!(PAGE_BITMAP[i] & validatedPages)) {
   if (nextPageNo) return PAGE_LOOKUP[i]
   else
   return i;
  }
 }
 return 1;
}

function checkDeviceType(userAgent) {
 if (/windows phone/i.test(userAgent)) return "windows"; //Windows Phone must come first because its UA also contains "Android"
 if (/android/i.test(userAgent)) return "android";
 if (/iPhone/.test(userAgent) && !window.MSStream) return "iphone";
 if (/iPad/.test(userAgent) && !window.MSStream) return "ipad";
 if (/iPod/.test(userAgent) && !window.MSStream) return "ipod";
 if (/BlackBerry/.test(userAgent) && !window.MSStream) return "blackberry";
 return "desktop";
}

function setTrackerPage(pgNo) {
 try {
  if (thisAppFormType == "DEMO") window.nadex.marketing.analytics.tracking.trackAppFormStep("demo app form", "Page 1")
  else window.nadex.marketing.analytics.tracking.trackAppFormStep("application form", "Page " + pgNo);
 } catch (e) {}
}

function saveCookieData() {
 var userEmail, accountId;
 //Email cookie
 if (getAnswer("Email")) {
  userEmail = getAnswer("Email").toUpperCase();
  AA.setCookieExpires("userEmail", userEmail, "nadex.com", 1);
 }
 //demo form values
 if (answers && (answers.length > 0) && (getAnswer("Forename") != "") || (getAnswer("Surname") != "") && (getAnswer("Email") != "")) {
  if (localStorage) {
   try {
    localStorage.setItem('DEMOemail', getAnswer("Email"));
    localStorage.setItem('DEMOforename', getAnswer("Forename"));
    localStorage.setItem('DEMOsurname', getAnswer("Surname"));
   } catch (e) {
    AA.util.toggleInProgress("none");
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.PRIVATE_BROWSING, 0);
    dialogBox(AAc.ERROR_ICON, AAc.LOCAL_STORAGE_TITLE, AAc.LOCAL_STORAGE, "", "", AAc.OK, "AA.util.hideAlert");
    isFullValid = false;
   }
  }
 }
 //accountId for auto-logon
 if (getAnswer("Username")) {
  if (thisAppFormType == "DEMO") {
   accountId = "DEMO" + getAnswer("Username").toUpperCase();
  } else accountId = getAnswer("Username").toUpperCase();
  AA.setCookieExpires("accountId", accountId, "nadex.com", 1);
  if (localStorage) {
   try {
    localStorage.setItem('accountId', accountId);
   } catch (e) {
    AA.util.toggleInProgress("none");
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.PRIVATE_BROWSING, 0);
    dialogBox(AAc.ERROR_ICON, AAc.LOCAL_STORAGE_TITLE, AAc.LOCAL_STORAGE, "", "", AAc.OK, "AA.util.hideAlert");
    isFullValid = false;
   }
  }
 }
}

function loadCookieData() {
 //if we are reseting then do not populate any values
 if (_currentPage === PAGEONE && inResetLead) return;

 //if forename, surname, email are missing
 if ((!getAnswer("Forename") || getAnswer("Forename") == "") && (!getAnswer("Surname") || getAnswer("Surname") == "") && (!getAnswer("Email") || getAnswer("Email") == "")) {
  if (AA.getCookieByName("quickLastname")) {
   setAnswer("Surname", (AA.getCookieByName("quickLastname")) ? AA.getCookieByName("quickLastname") : "");
   setAnswer("Email", (AA.getCookieByName("quickEmail")) ? AA.getCookieByName("quickEmail") : "");
   setAnswer("Forename", (AA.getCookieByName("quickFirstname")) ? AA.getCookieByName("quickFirstname") : "");
  } else if (localStorage) {
   try {
    setAnswer("Forename", (localStorage.getItem('DEMOforename') && (localStorage.getItem('DEMOforename') != "undefined")) ? localStorage.getItem('DEMOforename') : "");
    setAnswer("Surname", (localStorage.getItem('DEMOsurname') && (localStorage.getItem('DEMOsurname') != "undefined")) ? localStorage.getItem('DEMOsurname') : "");
    setAnswer("Email", (localStorage.getItem('DEMOemail') && (localStorage.getItem('DEMOemail') != "undefined")) ? localStorage.getItem('DEMOemail') : "");
   } catch (e) {
    AA.util.toggleInProgress("none");
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.PRIVATE_BROWSING, 0);
    dialogBox(AAc.ERROR_ICON, AAc.LOCAL_STORAGE_TITLE, AAc.LOCAL_STORAGE, "", "", AAc.OK, "AA.util.hideAlert");
    isFullValid = false;
   }
  }
 }
 if (getAnswer("Email") && document.getElementById("Email")) document.getElementById("Email").value = getAnswer("Email");
 if (getAnswer("Forename") && document.getElementById("Forename")) document.getElementById("Forename").value = getAnswer("Forename");
 if (getAnswer("Surname") && document.getElementById("Surname")) document.getElementById("Surname").value = getAnswer("Surname");
}

function loadQpidData() {
 if (queryDict["QPID"]) QPID = queryDict["QPID"];
 //if QPID exists cache it in a cookie
 if (QPID) AA.setCookieExpires("QPID", QPID, null, 7);
}

function notifyLoadToMobile() {
 var url;
 url = AAc.NOTIFLY_LOAD_MOBILE;
 notifyMobile(url);
}

function notifyLoginToMobile() {
 var url;
 if (getAnswer("Username")) {
  loginDetails.username = getAnswer("Username");
  url = AAc.NOTIFLY_LOGIN_MOBILE + "?data=" + JSON.stringify(loginDetails);
  notifyMobile(url);
 } else {
  AA.debug("Auto login failed. No username");
 }
}

function notifyMobile(url) {
 var frameEl;
 try {
  if (typeof Android !== 'undefined') {
   Android.handleUrl(url)
  } else {
   if (!document.getElementById("notifyApple")) {
    frameEl = document.createElement("IFRAME");
    frameEl.id = "notifyApple";
    frameEl.style.display = "none";
    document.body.appendChild(frameEl);
   }
   document.getElementById("notifyApple").src = url;
  }
 } catch (e) {
  AA.debug("Auto login failed. Error: " + e);
 }
}

function setCSS(css) {
 try {
  //append stylesheet to head
  document.getElementsByTagName("head")[0].appendChild(css);
 } catch (e) {
  setTimeout(function() {
   setCSS(css)
  }, 100);
 }
}

function scrollParentToZero() {
 parent.postMessage({
  "scrollToZero": "true"
 }, "*");
}

function setupPage() {
 var embedStyleSheet, css;
 var btnOModal, btnTModal, closeModalXBox, btnOAlert, btnTAlert, closeAlertXBox;
 if (queryDict["embed"]) {
  embedStyleSheet = queryDict["embed"].toLowerCase();
  // create CSS element to set up the page
  css = document.createElement("link");
  css.setAttribute("href", "css/" + embedStyleSheet + ".css?wow=" + new Date().getTime());
  css.setAttribute("rel", "stylesheet");
  css.setAttribute("type", "text/css");
  setCSS(css);
  css = null;
 }
 if (inMobileApp) notifyLoadToMobile();
 if (!navigator.cookieEnabled) {
  _gotIRPPage(AAc.IRP_COOKIES_OFF_URI);
  return;
 }
 AA.setTargetedMessagingCookie("ApplicationStarted");

 if (PMSon) {
  // Create the encryption object and set the key.
  crypt = new JSEncrypt();
  _thisRest.RESTget(_apiDomain + AA.restPathPrefixes.getPubKey, this, getPubKeyRespCB, errorKeyCB);
 } else loadAA();

 btnOModal = document.getElementById("modalBtnOne");
 _setEvent(btnOModal, "click", null, AA.util.btnOneModal);
 _setEvent(btnOModal, "touchstart", null, AA.util.btnOneModal);

 btnTModal = document.getElementById("modalBtnTwo");
 _setEvent(btnTModal, "click", null, AA.util.btnTwoModal);
 _setEvent(btnTModal, "touchstart", null, AA.util.btnTwoModal);

 closeModalXBox = document.getElementById("modalCloseX");
 _setEvent(closeModalXBox, "click", null, AA.util.hideModal);
 _setEvent(closeModalXBox, "touchstart", null, AA.util.hideModal);

 btnOAlert = document.getElementById("alertBtnOne");
 _setEvent(btnOAlert, "click", null, AA.util.btnOneAlert);
 _setEvent(btnOAlert, "touchstart", null, AA.util.btnOneAlert);

 btnTAlert = document.getElementById("alertBtnTwo");
 _setEvent(btnTAlert, "click", null, AA.util.btnTwoAlert);
 _setEvent(btnTAlert, "touchstart", null, AA.util.btnTwoAlert);

 closeAlertXBox = document.getElementById("alertCloseX");
 _setEvent(closeAlertXBox, "click", null, AA.util.hideAlert);
 _setEvent(closeAlertXBox, "touchstart", null, AA.util.hideAlert);

 window.addEventListener("message", (event) = > {
  if (event.event && ["mouseUp", "touchEnd"].includes(event.event.type)) {
   clearMutex.call(this, event.event);
  }
 });
}

function getPubKeyRespCB(resp) {
 var data = JSON.parse(resp);
 pubKey = data.encryptionKey
 crypt.setPublicKey(pubKey);
 loadAA();
}

function errorKeyCB(e) {
 alert("Error! " + e);
}

// scroll to the top of the form (within iframe)

function scrollToTop() {
 forceAndroidBlur();
 setTimeout(waitForRefresh, 100);
}

function waitForRefresh() {
 var iframe, demoIframe;
 if (top != window) {
  parent.postMessage({
   scrollFrameIntoView: "true"
  }, "*");
 } else if (demoIframe && innerWidth < 600 || iframe) {
  document.body.scrollTop = 0;
 } else {
  document.body.scrollTop = 0;
  window.scrollTo(0, 0)
 }
}

function setFrameHeight() {
 parent.postMessage({
  height: currentPageHeight
 }, "*");
}

function setPageHeight() {
 currentPageHeight = iFrameBottomPadding + document.getElementById("container").scrollHeight; //get current page height, and add on padding
 setFrameHeight();
}

// Load AA with Lead data

function forceAndroidBlur() {
 var currentFocuedEl, relatedField, sectionId;
 currentFocuedEl = document.activeElement;
 if (currentFocuedEl && currentFocuedEl.id) {
  relatedField = getRelatedField(currentFocuedEl.id);
  sectionId = currentFocuedEl.getAttribute("sectionId");
  if (relatedField && relatedField.onblurAction && window[relatedField.onblurAction]) {
   if (relatedField.onblurParams) {
    window[relatedField.onblurAction](true, currentFocuedEl, relatedField.onblurParams)
   } else {
    window[relatedField.onblurAction](true, currentFocuedEl);
   }
  }
 }
}

function _submitResumeLead(e) {
 var data;
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();
 delayedCB = null;
 fullValidate();
 if (isFullValid) {
  thisSubmitUsernameObj.credentialValue = document.getElementById("usernameResume").value.toUpperCase();
  thisSubmitUsernameObj.credentialType = "USERNAME";
  data = JSON.stringify(thisSubmitUsernameObj);
  AA.util.toggleInProgress("block");
  scrollToTop();
  _requestStatus(data, _checkResumeUsernameCB);
 }
}

// Reset Lead

function _submitResetAA(e) {
 var data;
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();
 delayedCB = null;
 fullValidate();
 if (isFullValid) {
  thisResetLeadObj.emailAddress = document.getElementById("resetAAEmail").value.toLowerCase();
  data = JSON.stringify(thisResetLeadObj);
  AA.util.toggleInProgress("block");
  scrollToTop();
  _thisRest.RESTpost(AA.restPathPrefixes.resetLeadRequest, this, data, _resetAAPageCB, _errorCB);
 }
}

function _resetAAPageCB(resp) {
 var respObj, status, reason;
 try {
  AA.util.hideAlert();
  AA.util.toggleInProgress("none");
  respObj = JSON.parse(resp);
  status = respObj.responseStatus;
  reason = respObj.errorReason;
  if (status === "SUCCESS") {
   dialogBox(AAc.NO_ICON, AAc.THANKS_TITLE, AAc.RESET_LEAD, "", "", AAc.OK, "AA.util.hideAlert");
  } else if (status === "FAILURE") {
   if (reason === "MEMBER_EXISTS") {
    //showErrorMessage(AAc.EXISTING_MEMBER);
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_EXISTS, 0);
    dialogBox(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.EXISTING_MEMBER, "", "", AAc.LOG_IN, "_goToLoginPage");
    return;
   }
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.EMAIL_NOT_RECOGNISED, 0);
   dialogBox(AAc.NO_ICON, AAc.HELLO_TITLE, AAc.EMAIL_NOT_RECOGNISED, "", "", AAc.SIGN_UP, "_goToPageOne");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.REST_APP_ERROR, 0);
   showGenericError();
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.REST_APP_ERROR, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _checkResumeUsernameCB(resp) {
 var usernameEl, pwd, respObj, status, data;
 usernameEl = document.getElementById("usernameResume").value.toUpperCase();
 pwd = document.getElementById("passwordResume").value;
 setAnswer("Username", usernameEl);
 setAnswer("Password", pwd);
 try {
  respObj = JSON.parse(resp);
  status = (respObj.header) ? respObj.header.responseStatus : null;
  if (status === "ACTIVE_APPLICATION") {
   thisSubmitMemObj.username = usernameEl;
   thisSubmitMemObj.password = pwd;
   data = JSON.stringify(thisSubmitMemObj);
   _thisRest.RESTput(AA.restPathPrefixes.appFormData, this, data, _resumeAA, _errorCB);
  } else if (status === "COMPLETED_APPLICATION" || status === "ACTIVE_MEMBER") {
   genericAccountErrorEvent(AAc.RESUME_ACTIVE_MEMBER, AAc.EMAIL_IN_USE, 1);
   showDialog(AAc.NO_ICON, AAc.ACTIVE_MEMBER_TITLE, AAc.ACTIVE_MEMBER, AAc.LOGIN, "_goToLoginPage");
  } else if (status && AAc[status]) {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, "Resume Application error: " + AAc[respObj.header.responseStatus], 0);
   showDialog(AAc.NO_ICON, AAc.OOPS_TITLE, AAc[respObj.header.responseStatus], AAc.OK, "_goToResetPage");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.RESUME_ERROR, 0);
   showGenericError();
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.RESUME_ERROR, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _getLastEdited(resp) {
 var o, i, j;
 var thisField, thisSection, thisAnswer, thisPageSection;
 var pages, lastPage, lastElementId;
 pages = appForm.pages_sections_order[DEVICE_TYPE];
 for (o in pages) {
  thisPageSection = appForm.pages_sections_order[DEVICE_TYPE][o];
  for (i = 0; i < thisPageSection.length; i++) {
   thisSection = getSection(thisPageSection[i]);
   for (j = 0; j < thisSection.relatedFields.length; j++) {
    thisField = thisSection.relatedFields[j];
    thisAnswer = getAnswerObject(answers, thisField.questionId);
    if (thisAnswer && thisAnswer.answerValue != "" && thisAnswer.answerValue != null) {
     lastPage = parseInt(o, 10);
     lastElementId = thisField.questionId;
    }
   }
  }
 }
 if (lastPage && lastElementId) {
  return {
   "lastPage": lastPage,
   "lastElementId": lastElementId
  }
 }
}

function _goToPageOne(e) {
 if (_checkStopEvent(e)) return;
 token = "";
 hash = "";
 inResetLead = false;
 reloaded = false;
 originalAnswers = [];
 answers = [];
 AA.util.hideAlert();
 _currentPage = PAGEONE;
 invalidate();
 pageTransitionEvent("Live");
 buildPage(_currentPage);
}

function _goToResumePage(e) {
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();

 // Google Analytics and other tracking
 try {
  if (ga) {
   ga('send', 'event', 'Application Form', 'Resume');
  }
  if (s && s.tl) {
   s.tl(true, "o", "Application Form Resume");
  }
 } catch (ee) {}

 // Load Resume Page
 _currentPage = RESUMEPAGE;
 invalidate();
 pageTransitionEvent("Live");
 buildPage(_currentPage);
}

function _goToResetPage(e) {
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();

 // Google Analytics and other tracking
 try {
  if (ga) {
   ga('send', 'event', 'Application Form', 'Reset');
  }
  if (s && s.tl) {
   s.tl(true, "o", "Application Form Reset");
  }
 } catch (ee) {}

 // Load Reset Application Page
 _currentPage = RESETPAGE;
 invalidate();
 pageTransitionEvent("Live");
 buildPage(_currentPage);
}

function _goToIG(e) {
 if (_checkStopEvent(e)) return;
 token = "";
 hash = "";
 inResetLead = false;
 reloaded = false;
 originalAnswers = [];
 answers = [];
 AA.util.hideAlert();
 invalidate();
 pageTransitionEvent("Live");
 parent.postMessage({
  "goBack": "true"
 }, "*");
}

function _goToDemoPage(e) {
 if (_checkStopEvent(e)) return;
 token = "";
 hash = "";
 inResetLead = false;
 reloaded = true;
 originalAnswers = [];
 answers = [];
 AA.util.hideAlert();
 _currentPage = DEMOPAGE;
 invalidate();
 pageTransitionEvent("Demo");
 buildPage(_currentPage);
}

function _goToDemoPhone(e) {
 var nexmoReqXLNow, requestTimeMs, errObj;
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();
 nexmoReqXLNow = new Date();
 requestTimeMs = nexmoReqXLNow.getTime() - nexmoReqXLTS.getTime();
 if (requestTimeMs < nexmoReqXLMs) {
  errObj = AAc["DEMO_ERROR_108"];
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "Demo phone validation error: " + errObj.errorText, 0);
  showErrorMessage(errObj.errorText)
  return;
 }

 _currentPage = DEMOPAGEPHONE;
 invalidate();
 pageTransitionEvent("Demo");
 buildPage(_currentPage);
}

function openPage(pg) {
 pageTransitionEvent("Live (" + pg + ")");
 window.open(LINKS["NEW"][pg])
}

function loadPage(pg) {
 parent.postMessage({
  navigateTo: pg
 }, "*");
}

function _goToNadex(e) {
 loadPage("");
 AA.event.stopEvent(e);
}

function _goToLoginPage(e) {
 loadPage("/login");
 AA.event.stopEvent(e);
}

function goToLostDetailsPage(e) {
 loadPage("/forgot-password");
 AA.event.stopEvent(e);
}

function _gotIRPPage(responsePage) {
 if (inMobileApp && AA.IRPsuccessURLs[responsePage]) notifyLoginToMobile();
 if (formTypeFlag == PROD) pageTransitionEvent("Live (" + responsePage + ")")
 else pageTransitionEvent("Demo (" + responsePage + ")");
 if (oneTimeToken) loadPage(responsePage + "?oneTimeToken=" + oneTimeToken)
 else loadPage(responsePage);
}

function _gotoNextPage() {
 var maxPage;
 AA.util.hideAlert();
 if (nextPageNo) {
  if (nextPageNo[_currentPage]) {
   _currentPage = nextPageNo[_currentPage];
   pageTransitionEvent("Live");
   buildPage(_currentPage);
   AA.util.toggleInProgress("none");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NEXT_NAVIGATION_ERROR, 0);
   showNoIconDialog(AAc.SORRY_TITLE, AAc.GENERIC_ERROR);
  }
 } else {
  maxPage = getPageLength(appForm.pages_sections_order[DEVICE_TYPE]);
  if (_currentPage < maxPage) {
   _currentPage++;
   pageTransitionEvent("Live");
   buildPage(_currentPage);
   AA.util.toggleInProgress("none");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NEXT_NAVIGATION_ERROR, 0);
   showNoIconDialog(AAc.SORRY_TITLE, AAc.GENERIC_ERROR);
  }
 }
}

function goToPreviousPage(e) {
 var maxPage;
 if (_checkStopEvent(e)) return;
 AA.util.hideAlert();
 if (prevPageNo) {
  if (prevPageNo[_currentPage]) {
   _currentPage = prevPageNo[_currentPage];
   pageTransitionEvent("Live");
   buildPage(_currentPage);
   AA.util.toggleInProgress("none");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.PREV_NAVIGATION_ERROR, 0);
   showNoIconDialog(AAc.SORRY_TITLE, AAc.GENERIC_ERROR);
  }
 } else {
  maxPage = getPageLength(appForm.pages_sections_order[DEVICE_TYPE]);
  if (_currentPage < maxPage) {
   _currentPage = _currentPage - 1;
   pageTransitionEvent("Live");
   buildPage(_currentPage);
   AA.util.toggleInProgress("none");
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.PREV_NAVIGATION_ERROR, 0);
   showNoIconDialog(AAc.SORRY_TITLE, AAc.GENERIC_ERROR);
  }
 }
}

function _togglePassword(e) {
 var evt, trgt, sectionId, section, relatedFieldId, relatedField, passwordEl;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 sectionId = trgt.getAttribute("sectionId");
 if (!sectionId) return;
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 passwordEl = document.getElementById(relatedField.questionId);
 if (passwordEl.type === "password") {
  passwordEl.type = "text";
  trgt.className = "toggleImgHide";
 } else {
  passwordEl.type = "password";
  trgt.className = "toggleImgReveal";
 }
}

function _jumpToPage(e) {
 var evt, trgt, pgNo;
 if (_checkStopEvent(e)) return;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 pgNo = trgt.getAttribute("pageNo");
 if (pgNo != _currentPage) _gotoPage(pgNo);
}

function _gotoPage1() {
 _gotoPage(1)
}

function _gotoPage2() {
 _gotoPage(2)
}

function _gotoPage3() {
 _gotoPage(3)
}

function _gotoPage4() {
 _gotoPage(4)
}

function _gotoPage(n) {
 AA.util.hideAlert();
 _currentPage = n;
 unsetValidate();
 if (formTypeFlag == PROD) pageTransitionEvent("Live")
 else pageTransitionEvent("Demo");
 buildPage(_currentPage);
}

function getPageLength(pages) {
 var maxPage, o;
 maxPage = 0;
 for (o in pages) {
  if (o > maxPage) maxPage = o;
 }
 return maxPage;
}

// Request Form

function loadAA() {
 var thisUnifiedUser, dat;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollParentToZero();
 if (isUnified) {
  thisUnifiedUser = {
   token: uHash,
   userId: uUid
  };
  dat = JSON.stringify(thisUnifiedUser);
  _thisRest.RESTpost(AA.restPathPrefixes.appFormUnified, this, dat, _buildAA, _errorCB);
 } else {
  if (formTypeFlag == PROD) _thisRest.RESTget(AA.restPathPrefixes.appFormDataProd, this, _buildAA, _errorCB)
  else if (formTypeFlag == DEMO) _thisRest.RESTget(AA.restPathPrefixes.appFormDataDemo, this, _buildAA, _errorCB)
  else _thisRest.RESTget(AA.restPathPrefixes.appFormData, this, _buildAA, _errorCB);
 }
}

// Build Form

function _buildAA(resp) {
 var obj, data;
 pwd = getAnswer("Password");
 try {
  AA.util.toggleInProgress("none");
  obj = JSON.parse(resp);
  thisAppFormVersion = obj.formVersion;
  thisAppFormType = obj.formType;

  if (thisAppFormType == "DEMO") demoAccountStartEvent()
  else liveAccountStartEvent();

  thisAppFormId = obj.formId;
  appForm = obj.appForm;
  if (appForm.nextPageNo) nextPageNo = appForm.nextPageNo;
  if (appForm.prevPageNo) prevPageNo = appForm.prevPageNo;
  timeStamp = obj.timestamp;
  offset = obj.offset;
  answers = obj.answers;
  validation = obj.validation;
  thisUSClientDataObj.tokenId = USClientToken;
  data = JSON.stringify(thisUSClientDataObj);
  if (autoPopulate) _thisRest.RESTpost(AA.restPathPrefixes.getClientData, this, data, loadUSClientDataCB, _errorCB)
  else showPage();
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "Build App Form Generic error (generic): " + e, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function checkStaticValue(questionId, value) {
 var i, relatedFields, possibleValues;
 try {
  relatedFields = getRelatedField(questionId)
  if (relatedFields.staticValues) possibleValues = relatedFields.staticValues;
  if (relatedFields.optionValues) possibleValues = relatedFields.optionValues;
  for (i = 0; i < possibleValues.length; i++) {
   if (possibleValues[i] == value) return true;
  }
 } catch (e) {}
 return false;
}

function loadUSClientDataCB(resp) {
 var tel, ssn, ssn1, ssn2, ssn3, o, errObj;
 try {
  IGUSClientDataObj = JSON.parse(resp);
  IGUSClientDataObj["declaration_9"] = "Yes"; //preset Have SSN (declaration_9) to true
  delete IGUSClientDataObj["PhonePrimaryType"]; //phoneType no longer in use, remove from client data
  //process Break up phone 3-3-4
  tel = IGUSClientDataObj["PhonePrimary"];
  if (tel) {
   IGUSClientDataObj["phoneUSOne"] = tel.substr(0, 3);
   IGUSClientDataObj["phoneUSTwo"] = tel.substr(3, 3);
   IGUSClientDataObj["phoneUSThree"] = tel.substr(6, 4);
  } else {
   IGUSClientDataObj["phoneUSOne"] = "";
   IGUSClientDataObj["phoneUSTwo"] = "";
   IGUSClientDataObj["phoneUSThree"] = "";
  }
  //process Break up SSN 3-2-4
  ssn = IGUSClientDataObj["SocialSecurityNumber"];
  if (ssn) {
   IGUSClientDataObj["social_security_number1"] = ssn.substr(0, 3);
   IGUSClientDataObj["social_security_number2"] = ssn.substr(3, 2);
   IGUSClientDataObj["social_security_number3"] = ssn.substr(5, 4);
  } else {
   IGUSClientDataObj["social_security_number1"] = "";
   IGUSClientDataObj["social_security_number2"] = "";
   IGUSClientDataObj["social_security_number3"] = "";
  }
  //Check if Suffix is a valid option clear if none
  if (!checkStaticValue("Suffix", IGUSClientDataObj["Suffix"])) {
   delete IGUSClientDataObj["Suffix"];
  }

  //Check if EmploymentStatus is a valid option and blank EmployerNature and EmployerPosition if not known
  if (!checkStaticValue("EmploymentStatus", IGUSClientDataObj["EmploymentStatus"])) {
   delete IGUSClientDataObj["EmploymentStatus"];
   delete IGUSClientDataObj["EmployerNature"];
   delete IGUSClientDataObj["EmployerPosition"];
  }

  //for each entry add using answers.push({"questionKey": "Forename", "answerValue": "First_Name"})
  for (o in IGUSClientDataObj) answers.push({
   "questionKey": o,
   "answerValue": IGUSClientDataObj[o]
  });
  showPage();
 } catch (e) {
  errObj = AAc["DEMO_ERROR_CLIENT"];
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "IG client data error: " + errObj.errorText, 0);
  showErrorMessageCTACancel(errObj.errorText, errObj.gotoPage);
  AA.debug("REST response error: " + e);
 }
}

function showPage() {
 _currentPage = firstUnvalidatedPage(answers);
 originalAnswers = AA.copyObject(answers);
 if (thisAppFormType == "DEMO") {
  _currentPage = DEMOPAGE;
 }
 if (pwd) {
  setAnswer("Password", pwd);
 }
 loadQpidData();
 buildPage(_currentPage);
 loadCookieData();
 if (getAnswer("Username")) document.title += " for user: " + getAnswer("Username");
}

// Resume Form

function _resumeAA(resp) {
 var resumeLocation, _lastElementId, lastEditedEl;
 _buildAA(resp);
 buildPage(_currentPage);
 if (nextPageNo) showPage()
 else {
  resumeLocation = _getLastEdited(resp);
  _currentPage = resumeLocation.lastPage;
  buildPage(_currentPage);
  _lastElementId = resumeLocation.lastElementId;
  lastEditedEl = document.getElementById(_lastElementId);
  if (lastEditedEl) {
   lastEditedEl.focus();
   lastEditedEl.scrollIntoView();
  }
 }
}

// Set page Indicator

function setTabActive(tab, pageNo) {
 if (tab != null) {
  tab.className = tab.className.replace("inactive", "active");
  tab.setAttribute("pageNo", pageNo);
  _setEvent(tab, "click", null, _jumpToPage);
 }
}

function markPage(pageList) {
 var activeTab;
 var activePage = _currentPage;
 activeTab = activePage - 1;
 setTabActive(document.getElementById(pageList[activeTab]));
 while (activePage > 0) {
  activePage--;
  activeTab--;
  setTabActive(document.getElementById(pageList[activeTab]));
 }
}

function markPage6() {
 var setActiveTab;
 var activePage = _currentPage;
 setTabActive(document.getElementById("page" + activePage), activePage);
 while (prevPageNo[activePage]) {
  activePage = prevPageNo[activePage];
  setTabActive(document.getElementById("page" + activePage), activePage);
 }
}

//function to stop auto submit of forms

function _cancelSubmit(e) {
 e.preventDefault();
 return false;
}

// Application form builder

function buildPage(page) {
 var thisEl, postProcessItem, thisTrgt, fakeEvent, callAction, thisId;
 var thisOptionValues, fakePasswordEl, passwordRetypeEl, submitBtn;
 var hideSectionId, showSectionId, i, j, k, thisOption, staticValue;
 var thisSection, thisField;
 var fieldContainer = [],
     fieldElement = [],
     fieldDropdown = [],
     radioContainer = [],
     fieldObscured = [],
     fieldToggle = [],
     popupContainer = [];
 var tmpFunct = [],
     row = [],
     title = [],
     innerDiv = [],
     fieldLabel = [],
     fieldText = [],
     fieldInfo = [],
     fieldError = [],
     postProcess = [];
 var outerDiv, formEl, answerValue, thisID, validator, reloaded, thisPageSection, popupId;
 var elCount, rowCount;
 elCount = 0;
 rowCount = 0;
 if (!navigator.cookieEnabled) {
  _gotIRPPage(AAc.IRP_COOKIES_OFF_URI);
  return;
 }
 setTrackerPage(page);
 if (_currentPage === PAGEONE && inResetLead) {
  resetLead();
 }
 outerDiv = document.getElementById("container");
 outerDiv.innerHTML = "";
 formEl = document.createElement("FORM");
 _setEvent(formEl, "submit", null, _cancelSubmit);
 outerDiv.appendChild(formEl);
 reloaded = false;
 if (answers && answers != "" && answers != null && answers != undefined) reloaded = true;

 // Load JSON
 inBuild = true;
 thisPageSection = appForm.pages_sections_order[DEVICE_TYPE][page];
 for (i = 0; i < thisPageSection.length; i++) {
  thisSection = getSection(thisPageSection[i]);
  // Create section row
  row[rowCount] = document.createElement("DIV");
  row[rowCount].className = "row";
  if (thisSection.sectionId) row[rowCount].id = thisSection.sectionId;
  if (thisSection.sectionClassName) row[rowCount].className = "row " + thisSection.sectionClassName;
  if (thisSection.hidden) row[rowCount].style.display = "none";
  // Create main page title
  if (thisSection.sectionTitle) {
   title[rowCount] = document.createElement("H1");
   title[rowCount].innerHTML = thisSection.sectionTitle;
   if (thisSection.sectionTitleClassName) title[rowCount].className = thisSection.sectionTitleClassName;
   row[rowCount].appendChild(title[rowCount]);
  }
  // Attach main sections / related fields of the app form
  if (thisSection.relatedFields) {
   for (j = 0; j < thisSection.relatedFields.length; j++) {
    thisField = thisSection.relatedFields[j];
    thisID = thisField.questionId;
    if (validation[thisField.validationType]) {
     validator = validation[thisField.validationType]
    } else validator = null;
    answerValue = getAnswer(thisID);
    innerDiv[elCount] = document.createElement("DIV");
    innerDiv[elCount].className = thisField.className;
    fieldContainer[elCount] = document.createElement("DIV");
    fieldContainer[elCount].className = "rowInitial";
    innerDiv[elCount].appendChild(fieldContainer[elCount]);
    if (thisField.hidden) {
     innerDiv[elCount].style.display = "none";
    }
    // Create formtab
    if (thisField.inputType == FORM_TAB) {
     innerDiv[elCount].id = thisField.questionId;
     fieldContainer[elCount].outerHTML = thisField.text;
    }

    // Create Label
    if (thisField.questionText) {
     fieldLabel[elCount] = document.createElement("LABEL");
     if (thisField.className == "colxxxs" || thisField.className == "colxxs" || thisField.className == "colxs" || thisField.className == "cols" || thisField.className == "colxxsstatic") {
      fieldLabel[elCount].className = "labelfield nowrap";
     } else {
      fieldLabel[elCount].className = "labelfield";
     }
     fieldLabel[elCount].innerHTML = thisField.questionText;
    }

    // Create ERROR FIELD
    if (thisField.fieldError) {
     fieldError[elCount] = document.createElement("DIV");
     fieldError[elCount].className = "errortxt";
     fieldError[elCount].innerHTML = thisField.fieldError;
     if (thisField.questionErrorId) fieldError[elCount].id = thisField.questionErrorId;
    }
    // Create HINT FIELD
    if (thisField.fieldInfo) {
     fieldInfo[elCount] = document.createElement("DIV");
     fieldInfo[elCount].innerHTML = thisField.fieldInfo;
     fieldInfo[elCount].className = "infotxt";
     if (thisField.questionInfoId) fieldInfo[elCount].id = thisField.questionInfoId;
    }
    // Create LINK TEXT
    else if (thisField.addLink) {
     fieldInfo[elCount] = document.createElement("DIV");
     fieldInfo[elCount].className = "linktxt";
     fieldInfo[elCount].innerHTML = thisField.addLink;
    }

    // Create STATIC
    if (thisField.inputType == STATIC) {
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     fieldElement[elCount] = document.createElement("DIV");
     fieldElement[elCount].className = thisField.className;
     fieldElement[elCount].id = thisField.questionId;
     fieldElement[elCount].innerHTML = thisField.staticText;
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
    }

    // Create INPUT FIELD
    else if (thisField.inputType == FIELD) {
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     if (thisField.blockDivClassName) {
      fieldElement[elCount] = document.createElement("DIV");
      fieldElement[elCount].className = thisField.blockDivClassName;
      fieldContainer[elCount].appendChild(fieldElement[elCount]);

      if (thisField.blockDivValue) {
       fieldElement[elCount].innerHTML = thisField.blockDivValue;
      }
     }
     fieldElement[elCount] = document.createElement("INPUT");
     fieldElement[elCount].className = thisField.inputClassName;
     fieldElement[elCount].id = thisField.questionId;
     if (thisField.type) {
      fieldElement[elCount].type = thisField.type;
     }
     if (validator && validator.maxLength) {
      fieldElement[elCount].maxLength = validator.maxLength;
     }
     if (answerValue) {
      fieldElement[elCount].value = answerValue;
     }
     if (thisField.disableField) {
      fieldElement[elCount].className = thisField.inputClassName + " disablefld";
      fieldElement[elCount].disabled = true;
     }
     if (reloaded && thisField.disableOnReload && !autoPopulate) {
      fieldElement[elCount].className = thisField.inputClassName + " disablefld";
      fieldElement[elCount].disabled = true;
     }
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     if (thisField.value) {
      fieldElement[elCount].setAttribute("value", thisField.value);
     }
     if (thisField.placeholder) {
      fieldElement[elCount].setAttribute("placeholder", thisField.placeholder);
     }
     _setEvent(fieldElement[elCount], "focus", null, _clearErr);
     _setEvent(fieldElement[elCount], "blur", null, _checkError);
     if (thisField.toAutoTab) {
      _setEvent(fieldElement[elCount], "keyup", null, _autoTab);
     }
     if (thisField.name) {
      fieldElement[elCount].name = thisField.name;
     }
     if (thisField.autocomplete) {
      fieldElement[elCount].autocomplete = thisField.autocomplete;
     } else {
      fieldElement[elCount].autocomplete = thisField.questionId + Math.random().toString(36).replace(/[^a-z]+/g, '');
     }
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
     if (popupContainer[elCount]) fieldContainer[elCount].appendChild(popupContainer[elCount]);
    }

    // Create TOGGLED PASSWORD
    else if (thisField.inputType == TOGGLED_PASSWORD) {
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     fieldElement[elCount] = document.createElement("INPUT");
     fieldElement[elCount].className = thisField.inputClassName;
     fieldElement[elCount].id = thisField.questionId;
     if (thisField.type) {
      fieldElement[elCount].type = thisField.type;
     }
     if (validator && validator.maxLength) {
      fieldElement[elCount].maxLength = validator.maxLength;
     }
     if (answerValue) {
      fieldElement[elCount].value = answerValue;
     }
     if (reloaded && thisField.disableOnReload && !autoPopulate) {
      fieldElement[elCount].className = thisField.inputClassName + " disablefld";
      fieldElement[elCount].disabled = true;
     }
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     _setEvent(fieldElement[elCount], "focus", null, _clearErr);
     _setEvent(fieldElement[elCount], "blur", null, _checkError);
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
     fieldToggle[elCount] = document.createElement("DIV");
     fieldToggle[elCount].className = thisField.toggleClassName;
     if (reloaded && thisField.disableOnReload && !autoPopulate) {
      fieldToggle[elCount].className = thisField.inputClassName + " disablefld";
      fieldToggle[elCount].disabled = true;
     }
     fieldToggle[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldToggle[elCount].setAttribute("relatedField", j);
     _setEvent(fieldToggle[elCount], "click", null, _togglePassword);
     fieldContainer[elCount].appendChild(fieldToggle[elCount]);
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
    }

    // Create OBSCURED INPUT FIELD
    else if (thisField.inputType == OBSCURED_FIELD) {
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     fieldElement[elCount] = document.createElement("INPUT");
     fieldElement[elCount].className = thisField.inputClassName;
     fieldElement[elCount].id = thisField.questionId;
     if (thisField.type) {
      fieldElement[elCount].type = thisField.type;
     }
     if (validator && validator.maxLength) {
      fieldElement[elCount].maxLength = validator.maxLength;
     }
     if (answerValue) {
      fieldElement[elCount].value = answerValue;
     }
     if (reloaded && thisField.disableOnReload && !autoPopulate) {
      fieldElement[elCount].className = thisField.inputClassName + " disablefld";
      fieldElement[elCount].disabled = true;
     }
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     _setEvent(fieldElement[elCount], "focus", null, _clearErr);
     _setEvent(fieldElement[elCount], "blur", null, _checkError);
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
     fieldObscured[elCount] = document.createElement("INPUT");
     fieldObscured[elCount].className = thisField.inputClassName;
     fieldObscured[elCount].style.display = "none";
     fieldObscured[elCount].id = thisField.obscureId;
     if (reloaded && thisField.disableOnReload && !autoPopulate) {
      fieldObscured[elCount].className = thisField.inputClassName + " disablefld";
      fieldObscured[elCount].disabled = true;
     }
     fieldObscured[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldObscured[elCount].setAttribute("relatedField", j);
     _setEvent(fieldObscured[elCount], "focus", null, _clearErr);
     _setEvent(fieldObscured[elCount], "blur", null, _checkError);
     fieldContainer[elCount].appendChild(fieldObscured[elCount]);
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
    }

    // Create DROPDOWN
    else if (thisField.inputType == DROPDOWN) {
     // Create LABEL
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     fieldDropdown[elCount] = new AA.DropDown(thisField.questionId);
     dropDownLookup[thisField.questionId] = fieldDropdown[elCount];
     if (!isDesktop) fieldDropdown[elCount].setEditDisabled(true);
     fieldDropdown[elCount].sectionId = thisPageSection[i];
     fieldDropdown[elCount].relatedField = j;
     fieldDropdown[elCount].getEdit().parentNode.parentNode.setAttribute("sectionId", thisPageSection[i]);
     fieldDropdown[elCount].getEdit().parentNode.parentNode.setAttribute("relatedField", j);
     fieldDropdown[elCount].getEdit().setAttribute("sectionId", thisPageSection[i]);
     fieldDropdown[elCount].getEdit().setAttribute("relatedField", j);
     fieldDropdown[elCount].setBlurEvent(_checkError);
     fieldDropdown[elCount].setFocusEvent(_clearErr);
     if (thisField.action && window[thisField.action]) {
      if (thisField.actionParams) {
       //add in src and params...
       tmpFunct[elCount] = newFunct(thisField.questionId, window[thisField.action], thisField.actionParams);
       fieldDropdown[elCount].setEvent("click", tmpFunct[elCount]);
       if (answerValue) {
        postProcess.push({
         trgt: thisField.questionId,
         action: tmpFunct[elCount]
        });
       }
      } else {
       fieldDropdown[elCount].setEvent("click", window[thisField.action]);
       if (answerValue) {
        postProcess.push({
         trgt: thisField.questionId,
         action: thisField.action
        });
       }
      }
     }
     if (thisField.loadValues && window[thisField.loadValues]) {
      if (thisField.loadParams) {
       window[thisField.loadValues](thisField.loadParams)
      } else {
       window[thisField.loadValues]();
      }
     } else if (thisField.staticValues) {
      if (thisField.addItem) {
       fieldDropdown[elCount].addItem("", thisField.addItem);
      }
      if (typeof thisField.staticValues[0] == "string") for (k = 0; k < thisField.staticValues.length; k++) {
       staticValue = thisField.staticValues[k];
       fieldDropdown[elCount].addItem(staticValue, staticValue);
      } else {
       for (k = 0; k < thisField.staticValues.length; k++) {
        staticValue = thisField.staticValues[k];
        fieldDropdown[elCount].addItem(staticValue[0], staticValue[1]);
       }
      }
     }
     if (answerValue) {
      fieldDropdown[elCount].setSelectedData(answerValue);
     } else if (thisField.preselectedText) {
      fieldDropdown[elCount].setSelectedText(thisField.preselectedText);
      setAnswer(thisField.questionId, thisField.preselectedText);
     }
     if (thisField.placeholder) fieldDropdown[elCount].setInputHint(thisField.placeholder);
     fieldDropdown[elCount].addToElement(fieldContainer[elCount]);
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
    }

    // Create TEXTAREA
    else if (thisField.inputType == TEXTAREA) {
     if (thisField.questionText) {
      fieldContainer[elCount].appendChild(fieldLabel[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     fieldElement[elCount] = document.createElement("textarea");
     fieldElement[elCount].className = thisField.inputClassName;
     fieldElement[elCount].id = thisField.questionId;
     if (validator && validator.maxLength) {
      fieldElement[elCount].maxLength = validator.maxLength;
     }
     if (answerValue) {
      fieldElement[elCount].value = answerValue;
     }
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     _setEvent(fieldElement[elCount], "focus", null, _clearErr);
     _setEvent(fieldElement[elCount], "blur", null, _checkError);
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
    }

    // Create CHECKBOX
    else if ((thisField.inputType == CHECKBOX) || (thisField.inputType == INVERTED_CHECKBOX)) {
     if (thisField.id) innerDiv[elCount].id = thisField.id;
     fieldElement[elCount] = document.createElement("DIV");
     fieldElement[elCount].type = "checkbox";
     fieldElement[elCount].className = "checkbox";
     if (answerValue != undefined) {
      if (("" + answerValue == "true") || (answerValue == "Yes")) {
       if (thisField.inputType == INVERTED_CHECKBOX) {
        fieldElement[elCount].className = "checkbox";
       } else {
        if (thisField.action) {
         postProcess.push({
          trgt: thisField.questionId,
          action: thisField.action
         });
        } else {
         fieldElement[elCount].className = "checkbox checked";
        }
       }
      } else if (thisField.inputType == INVERTED_CHECKBOX) {
       if (thisField.action) {
        postProcess.push({
         trgt: thisField.questionId,
         action: thisField.action
        });
       } else {
        fieldElement[elCount].className = "checkbox checked";
       }
      } else {
       if (thisField.hideSectionUnchecked) {
        hideSectionId = thisField.hideSection;
        if (hideSectionId) postProcess.push({
         id: hideSectionId,
         action: "hideSection"
        });
       } else {
        showSectionId = thisField.showSection;
        if (showSectionId) postProcess.push({
         id: showSectionId,
         action: "showSection"
        });
       }
      }
     } else {
      if (thisField.checked) {
       if (thisField.action) {
        postProcess.push({
         trgt: thisField.questionId,
         action: thisField.action
        });
       } else {
        fieldElement[elCount].className = "checkbox checked";
       }
      } else {
       if (thisField.hideSectionUnchecked) {
        hideSectionId = thisField.hideSection;
        if (hideSectionId) postProcess.push({
         id: hideSectionId,
         action: "hideSection"
        });
       } else {
        showSectionId = thisField.showSection;
        if (showSectionId) postProcess.push({
         id: showSectionId,
         action: "showSection"
        });
       }
      }
     }
     fieldElement[elCount].id = thisField.questionId;
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     _setEvent(fieldElement[elCount], "click", null, _checkError);
     _setEvent(fieldElement[elCount], "touchstart", null, _checkError);
     if (thisField.action && window[thisField.action]) {
      _setEvent(fieldElement[elCount], "click", null, window[thisField.action]);
      _setEvent(fieldElement[elCount], "touchstart", null, window[thisField.action]);
     }
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
     if (thisField.questionText) {
      fieldElement[elCount] = document.createElement("DIV");
      fieldElement[elCount].className = thisField.questionTextClassName;
      fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
      fieldElement[elCount].setAttribute("relatedField", j);
      fieldElement[elCount].innerHTML = thisField.questionText;
      fieldContainer[elCount].appendChild(fieldElement[elCount]);
     }
     if (thisField.fieldError) {
      fieldContainer[elCount].appendChild(fieldError[elCount]);
     }
     if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
    }

    // Create RADIO
    else if (thisField.inputType == RADIO) {
     if (thisField.questionText) {
      fieldElement[elCount] = document.createElement("DIV");
      fieldElement[elCount].className = thisField.questionTextClassName;
      fieldElement[elCount].innerHTML = thisField.questionText;
      fieldContainer[elCount].appendChild(fieldElement[elCount]);
     }
     if (thisField.fieldInfo) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     } else if (thisField.addLink) {
      fieldContainer[elCount].appendChild(fieldInfo[elCount]);
     }
     if (thisField.id) {
      innerDiv[elCount].id = thisField.id;
     }
     thisOptionValues = thisField.optionValues;
     if ((thisField.selectedValue) && (answerValue == thisField.selectedOption)) {
      setAnswer(thisField.actionParams[0], thisField.selectedValue);
     }
     for (k = 0; k < thisOptionValues.length; k++) {
      radioContainer[elCount] = document.createElement("DIV");
      radioContainer[elCount].className = "radiobox";
      radioContainer[elCount].id = "radioBox";
      fieldContainer[elCount].appendChild(radioContainer[elCount]);
      thisOption = thisOptionValues[k];
      fieldElement[elCount] = document.createElement("INPUT");
      fieldElement[elCount].type = "radio";
      fieldElement[elCount].name = thisField.questionId;
      fieldElement[elCount].id = thisField.questionId + "_" + thisOption;
      fieldElement[elCount].value = thisOption;
      fieldElement[elCount].className = thisField.radioClassname;
      if (answerValue) {
       if (answerValue == thisOption) {
        fieldElement[elCount].checked = true;
        postProcess.push({
         trgt: thisField.questionId + "_span_" + thisOption,
         action: thisField.action
        });
       }
      } else {
       if (thisField.selectedOption == thisOption) fieldElement[elCount].checked = true;
      }
      radioContainer[elCount].appendChild(fieldElement[elCount]);

      fieldElement[elCount] = document.createElement("BUTTON");
      fieldElement[elCount].id = thisField.questionId + "_span_" + thisOption;
      fieldElement[elCount].className = "checkButton"
      fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
      fieldElement[elCount].setAttribute("relatedField", j);
      fieldElement[elCount].setAttribute("optionValue", thisOption);
      _setEvent(fieldElement[elCount], "click", null, _checkError);
      _setEvent(fieldElement[elCount], "touchstart", null, _checkError);
      if (thisField.action && window[thisField.action]) {
       if (thisField.actionParams) {
        tmpFunct[elCount] = newFunct(thisField.questionId, window[thisField.action], thisField.actionParams);
       }
       _setEvent(fieldElement[elCount], "click", null, window[thisField.action]);
       _setEvent(fieldElement[elCount], "touchstart", null, window[thisField.action]);
      }
      fieldElement[elCount].innerHTML = thisOption;

      radioContainer[elCount].appendChild(fieldElement[elCount]);
      if (thisField.fieldError) {
       fieldContainer[elCount].appendChild(fieldError[elCount]);
      }
     }
    }

    // Create BUTTON
    else if (thisField.inputType == BUTTON) {
     fieldElement[elCount] = document.createElement("BUTTON");
     fieldElement[elCount].type = "button";
     fieldElement[elCount].className = thisField.inputClassName;
     fieldElement[elCount].id = thisField.questionId;
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     if (thisField.disableField) {
      fieldElement[elCount].className = thisField.inputClassName + " disablefld";
      fieldElement[elCount].disabled = true;
     }
     if (thisField.action && window[thisField.action]) {
      _setEvent(fieldElement[elCount], "click", null, window[thisField.action]);
      _setEvent(fieldElement[elCount], "touchstart", null, window[thisField.action]);
     }
     fieldElement[elCount].innerHTML = thisField.caption;
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
    }

    // Create LINE BREAK
    if (thisField.inputType == BREAK) {
     fieldElement[elCount] = document.createElement("DIV");
     fieldElement[elCount].id = thisField.questionId;
     fieldElement[elCount].setAttribute("sectionId", thisPageSection[i]);
     fieldElement[elCount].setAttribute("relatedField", j);
     fieldContainer[elCount].appendChild(fieldElement[elCount]);
    }

    // Append rows
    row[rowCount].appendChild(innerDiv[elCount]);
    if (thisField.rowClassName) {
     row[rowCount].className = thisField.rowClassName;
    }
    elCount++;
   }
  }

  // Append container
  formEl.appendChild(row[rowCount]);

  if (thisSection.loadAction && window[thisSection.loadAction]) {
   window[thisSection.loadAction](thisSection.loadParams);
  }
  rowCount++;
 }

 //setup static elements (submit buttons, password retype, etc.
 if (originalAnswers && originalAnswers != null) {
  if (document.getElementById("PasswordRetype") && getAnswer("Password")) {
   fakePasswordEl = document.getElementById("fakePassword");
   passwordRetypeEl = document.getElementById("PasswordRetype");
   fakePasswordEl.value = "        ";
   passwordRetypeEl.value = "        ";

   var hideFunc = window[getRelatedField("fakePassword").onblurAction];
   hideFunc(true, fakePasswordEl);
   hideFunc(true, passwordRetypeEl);
  }
 }

 if (postProcess.length > 0) {
  for (i = 0; i < postProcess.length; i++) {
   postProcessItem = postProcess[i]
   thisTrgt = postProcessItem.trgt;
   if (thisTrgt) {
    if (document.getElementById(thisTrgt)) {
     thisEl = document.getElementById(thisTrgt);
     fakeEvent = {};
     fakeEvent.target = thisEl;
     callAction = postProcessItem.action;
     if (window[callAction]) window[callAction](fakeEvent);
    }
   } else {
    thisId = postProcessItem.id;
    callAction = postProcessItem.action;
    if (window[callAction]) window[callAction](thisId);
   }
  }
 }
 setPageHeight();
 if ((_currentPage != PAGEONE) && (_currentPage != DEMOPAGE)) {
  scrollToTop();
 } else scrollParentToZero();
 inBuild = false;
}

function newFunct(thisDDid, thisAction, thisActionParams) {
 return function(e) {
  thisAction(e, thisDDid, thisActionParams);
 };
}

function resetLead() {
 var data;
 thisResetAAObj.token = token;
 thisResetAAObj.hash = hash;
 data = JSON.stringify(thisResetAAObj);
 _thisRest.RESTpost(AA.restPathPrefixes.resetLead, this, data, _resetLeadCB, "")
}

function _getAppText(param) {
 var nam, tmpNam, msecOff, CSTtime, thisOffset, CSToffset;
 var day, mnth, yr, hr, mn, sec, ampm, dateStr, outerDiv, blockEl;
 nam = "";
 tmpNam = getAnswer("Forename");
 nam = (tmpNam) ? tmpNam + " " : "";
 if (getAnswer("Initial")) nam += getAnswer("Initial") + ". ";
 tmpNam = getAnswer("Surname");
 nam += " " + (tmpNam) ? tmpNam : "";
 if (getAnswer("Suffix")) nam += ", " + getAnswer("Suffix") + ".";
 //make sure we get correct offset for the given date!!!
 CSTtime = new Date(parseInt(timeStamp, 0));
 thisOffset = CSTtime.getTimezoneOffset();

 CSToffset = parseInt(offset) + thisOffset;

 msecOff = CSToffset * 60000; //convert mins to msec
 CSTtime = new Date(parseInt(timeStamp, 0) + msecOff);

 day = CSTtime.getDate();
 mnth = CSTtime.getMonth() + 1;
 yr = CSTtime.getFullYear();
 hr = CSTtime.getHours();
 mn = CSTtime.getMinutes();
 sec = CSTtime.getSeconds();
 ampm = (hr >= 12) ? "PM" : "AM"
 hr = hr % 12;
 if (hr === 0) hr = 12;
 dateStr = to2digits(mnth) + "/" + to2digits(day) + "/" + yr + " " + hr + ":" + to2digits(mn) + ":" + to2digits(sec) + " " + ampm + " ET";
 document.getElementById(param[0]).innerHTML = nam;
 document.getElementById(param[1]).innerHTML = dateStr;
 if (!document.getElementById("block")) {
  outerDiv = document.getElementById("container");
  blockEl = document.createElement("DIV");
  blockEl.id = "block";
  blockEl.className = "block";
  outerDiv.appendChild(blockEl);
 }
}

function _resetLeadCB(resp) {
 var emailInput, respObj, status, reason;
 try {
  AA.util.hideAlert();
  AA.util.toggleInProgress("none");
  respObj = JSON.parse(resp);
  status = respObj.responseStatus;
  if (status === "SUCCESS") {
   if (respObj.emailAddress) {
    emailInput = document.getElementById("Email");
    emailInput.value = respObj.emailAddress;
    emailInput.parentNode.className = "rowDisable";
    emailInput.disabled = "disable";
   }
  } else if (status === "FAILURE") {
   reason = respObj.errorReason;
   if (reason === "MEMBER_EXISTS") {
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_EXISTS, 0);
    showDialog(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.EXISTING_MEMBER, AAc.LOG_IN, "_goToLoginPage");
   } else if (reason === "EXPIRED_TOKEN") {
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.EXPIRED_RESET_TOKEN, 0);
    showDialog(AAc.NO_ICON, AAc.OOPS_TITLE, AAc.EXPIRED_LEAD_RESET, AAc.RESTART, "_goToResetPage");
   } else if (reason === "TOKEN_ALREADY_USED") {
    //do nothing - used token means that user can create "new" lead
   } else {
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.RESET_LEAD_ERROR, 0);
    showGenericError();
   }
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.RESET_LEAD_ERROR, 0);
   showGenericError();
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.RESET_LEAD_ERROR, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _getCountryListData(params) { //params: [elementID]
 countryLoaded = false;
 _thisRest.RESTget(AA.restPathPrefixes.countriesData, this, _countryListCB, _errorCB, params);
}

function _countryListCB(resp, _this, elementIds) {
 var country, ddId, countryDD, selectedCountry, i, sectionId, section, relatedFieldId, relatedField;
 try {
  ddId = elementIds[0];
  countryDD = dropDownLookup[ddId];
  selectedCountry = getAnswer(ddId);
  countryDD.clear();
  countryList = JSON.parse(resp);
  for (i = 0; i < countryList.length; i++) {
   country = countryList[i];
   countryDD.addItem(country.isoCode, country.name);
  }
  if (selectedCountry) {
   countryDD.setSelectedData(selectedCountry);
   sectionId = countryDD.sectionId;
   section = getSection(sectionId);
   relatedFieldId = countryDD.relatedField;
   relatedField = section.relatedFields[relatedFieldId];
   if (relatedField.action && window[relatedField.action]) {
    if (relatedField.actionParams) {
     window[relatedField.action](null, ddId, relatedField.actionParams);
    } else {
     window[relatedField.action]();
    }
   }
  }
  countryLoaded = true;
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_COUNTY_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _setDialingPrefix(showHide) {
 var dialingPref;
 dialingPref = document.getElementById("phonePrefix");
 if (isUSA) {
  showSection(showHide.USshow);
  hideSection(showHide.UShide);
  dialNum = "1";
  if (dialingPref) dialingPref.value = "+1";
  dialingPrefText = "+1";
  fullDialingPrefix = "001";
 } else {
  showSection(showHide.NonUSshow);
  hideSection(showHide.NonUShide);
  if (dialingPref) dialingPref.value = dialingPrefText;
 }
}

function _getStatesListData(e, ddId, params) { //params: [dd1Id, dd2Id]
 var dialingPref, dialNum, countryCode, countryDD, country, i;
 if (_checkStopEvent(e)) return;
 statesLoaded = false;
 dialingPref = document.getElementById("phonePrefix");
 if (!ddId) return;
 countryDD = dropDownLookup[ddId];
 if (!countryDD) return;
 country = countryDD.getSelectedData();
 if (!country) return;
 if (country.toUpperCase() === "US") {
  isUSA = true;
  selectUSNonUS();
  dialNum = "1";
  if (dialingPref) dialingPref.value = "+1";
  dialingPrefText = "+1";
  fullDialingPrefix = "001";
 } else {
  isUSA = false;
  for (i = 0; i < countryList.length; i++) {
   countryCode = countryList[i].isoCode;
   if (country == countryCode) {
    dialNum = countryList[i].dialingPrefix;
    if (dialingPref) dialingPref.value = "+" + dialNum;
    dialingPrefText = "+" + dialNum;
    fullDialingPrefix = "00" + dialNum;
   }
  }
 }
 _thisRest.RESTget(AA.restPathPrefixes.countriesData + "/" + country + AA.restPathPrefixes.statesByCountryDataPostfix, this, _stateListCB, _errorCB, params);
}

function _getStatesListDataAndSelectUSnonUS(e, ddId, params) { //params: [dd1Id, dd2Id]
 var evt, trgt, sectionId, section, relatedFieldId, relatedField;
 var selectedOption, selectedValue, val, countryId, extendedField;
 var dialingPref, dialNum, countryCode, countryDD, country, i;
 if (_checkStopEvent(e)) return;
 statesLoaded = false;
 dialingPref = document.getElementById("phonePrefix");
 if (ddId) {
  countryDD = dropDownLookup[ddId];
  if (!countryDD) return;
  country = countryDD.getSelectedData();
  if (!country) return;
  if (country.toUpperCase() === "US") {
   isUSA = true;
   dialNum = "1";
   if (dialingPref) dialingPref.value = "+1";
   dialingPrefText = "+1";
   fullDialingPrefix = "001";
  } else {
   isUSA = false;
   for (i = 0; i < countryList.length; i++) {
    countryCode = countryList[i].isoCode;
    if (country == countryCode) {
     dialNum = countryList[i].dialingPrefix;
     if (dialingPref) dialingPref.value = "+" + dialNum;
     dialingPrefText = "+" + dialNum;
     fullDialingPrefix = "00" + dialNum;
    }
   }
  }
  _thisRest.RESTget(AA.restPathPrefixes.countriesData + "/" + country + AA.restPathPrefixes.statesByCountryDataPostfix, this, _stateListCB, _errorCB, params);
 }
 section = getSection("residentialAddress");
 relatedField = getRelatedFieldFromSection(section, "Country");
 showSectionId = relatedField.showSection;
 hideSectionId = relatedField.hideSection;
 if (country.toUpperCase() === "US") {
  show = showSectionId["Yes"];
  hide = hideSectionId["Yes"];
 } else {
  show = showSectionId["No"];
  hide = hideSectionId["No"];
 }
 if (hide) hideSection(hide);
 if (show) showSection(show);
}

function getRelatedFieldFromSection(section, fieldName) {
 if (!section) return;
 var i, relatedFields, rfl;
 relatedFields = section.relatedFields;
 rfl = relatedFields.length;
 for (i = 0; i < rfl; i++) if (relatedFields[i].questionId == fieldName) return relatedFields[i];
}

function _getDialingPrefixData(e, ddId) {
 var show, hide, dialingPref, dialNum, countryCode, countryDD, country, section, showSectionId, hideSectionId, i;
 if (_checkStopEvent(e)) return;
 dialingPref = document.getElementById("phonePrefix");
 if (!ddId) return;
 countryDD = dropDownLookup[ddId];
 if (!countryDD) return;
 country = countryDD.getSelectedData();
 if (!country) return;
 section = getSection("countrySection");
 showSectionId = section.relatedFields[0].showSection;
 hideSectionId = section.relatedFields[0].hideSection;
 if (country.toUpperCase() === "US") {
  show = showSectionId["US"];
  hide = hideSectionId["US"];
  dialNum = "1";
  if (dialingPref) dialingPref.value = "+1";
  dialingPrefText = "+1";
  fullDialingPrefix = "001";
 } else {
  show = showSectionId["NonUS"];
  hide = hideSectionId["NonUS"];

  for (i = 0; i < countryList.length; i++) {
   countryCode = countryList[i].isoCode;
   if (country == countryCode) {
    dialNum = countryList[i].dialingPrefix;
    if (dialingPref) dialingPref.value = "+" + dialNum;
    dialingPrefText = "+" + dialNum;
    fullDialingPrefix = "00" + dialNum;
   }
  }
 }
 if (hide) hideSection(hide);
 if (show) showSection(show);
}

function _hideAll(sectionName) {
 var i, j;
 var section, relatedField, hideSections, els, el;
 section = getSection(sectionName);
 relatedField = section.relatedFields[0];
 hideSections = relatedField.hideSection.Yes;
 els = document.getElementsByClassName("hr");
 for (i = 0; i < els.length; i++) els[i].parentNode.style.display = "none";
 for (i = 0; i < hideSections.length; i++) {
  el = document.getElementsByName(hideSections[i]);
  for (j = 0; j < el.length; j++) {
   el[j].parentNode.style.display = "none";
  }
 }
 setPageHeight();
}

function _toggleAll(e) {
 var i, j, evt, trgt, sectionId, section, oldChecked;
 var relatedFieldId, relatedField, val, showSections, hideSections, els, el;
 //get params
 oldChecked = _inputRadio(e);
 if (inBuild) oldChecked = false;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 val = getRadioValue(relatedField.questionId);
 showSections = relatedField.showSection.No;
 hideSections = relatedField.hideSection.Yes;
 els = document.getElementsByClassName("hr");
 if (val == "Yes") {
  if (!oldChecked) {
   for (i = 0; i < els.length; i++) els[i].parentNode.style.display = "";
   for (i = 0; i < showSections.length; i++) {
    el = document.getElementsByName(showSections[i]);
    for (j = 0; j < el.length; j++) {
     if (e.type) el[j].checked = false; //set to un checked
     el[j].parentNode.style.display = "";
    }
   }
  }
 } else {
  for (i = 0; i < els.length; i++) els[i].parentNode.style.display = "none";
  for (i = 0; i < hideSections.length; i++) {
   el = document.getElementsByName(hideSections[i]);
   for (j = 0; j < el.length; j++) {
    if (el[j].value == "No") el[j].checked = true; //set to "No"
    hideSection(getRelatedField(hideSections[i]).hideSection.No); //hide any open answers
    el[j].parentNode.style.display = "none";
   }
  }
 }
 setPageHeight();
}

function selectUSNonUS() {
 var sectionId, section, showSectionId, hideSectionId, show, hide;
 document.getElementById("selectUSNonUS_Yes").checked = true;
 sectionId = "stepTwoIntro";
 section = getSection(sectionId);
 showSectionId = section.relatedFields[0].showSection;
 hideSectionId = section.relatedFields[0].hideSection;
 show = showSectionId["Yes"];
 hide = hideSectionId["Yes"];
 if (hide) hideSection(hide);
 if (show) showSection(show);
}

function _selectUS(e) {
 var evt, trgt, sectionId, section, relatedFieldId, relatedField;
 var selectedOption, selectedValue, val, countryId, extendedField;
 if (!inBuild && (document.activeElement.id != e.target.id)) return;
 _inputRadio(e);
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 selectedOption = relatedField.selectedOption;
 selectedValue = relatedField.selectedValue;
 val = getRadioValue(relatedField.questionId);
 if (selectedOption == val) {
  countryId = relatedField.actionParams[0];
  dropDownLookup[countryId].setSelectedData(selectedValue);
  extendedField = getRelatedField(countryId);
  if (extendedField.action) {
   if (extendedField.actionParams) {
    window[extendedField.action](e, countryId, extendedField.actionParams);
   } else {
    window[extendedField.action]();
   }
  }
 }
}

function _stateListCB(resp, _this, elementIds) {
 var state, residentialStateDD, selectedResidentialState, mailingStateDD, selectedMailingState, i;
 try {
  residentialStateDD = dropDownLookup[elementIds[0]];
  selectedResidentialState = getAnswer(elementIds[0]);
  residentialStateDD.clear();
  mailingStateDD = dropDownLookup[elementIds[1]];
  selectedMailingState = getAnswer(elementIds[1]);
  mailingStateDD.clear();
  stateList = JSON.parse(resp);
  for (i = 0; i < stateList.length; i++) {
   state = stateList[i];
   residentialStateDD.addItem(state.isoCode, state.name);
   mailingStateDD.addItem(state.isoCode, state.name);
  }
  if (selectedResidentialState) {
   residentialStateDD.setSelectedData(selectedResidentialState);
  }
  if (selectedMailingState) {
   mailingStateDD.setSelectedData(selectedMailingState);
  }
  statesLoaded = true;
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_STATE_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _getAboutUsData(params) { //params: [elementID]
 _thisRest.RESTget(AA.restPathPrefixes.aboutUs, this, _getAboutUsDataCB, _errorCB, params);
}

function _getAboutUsDataCB(resp, tmp, elementIds) {
 try {
  aboutUsObj = JSON.parse(resp);
  _buildAboutUs(elementIds);
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_ABOUT_US_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _buildAboutUs(elementIds) {
 var aboutUsTitle, ddId, aboutUsDD, selectedTitle, i;
 var sectionId, section, relatedFieldId, relatedField, fakeEvent;
 ddId = elementIds[0];
 aboutUsDD = dropDownLookup[ddId];
 selectedTitle = getAnswer(ddId);
 for (i = 0; i < aboutUsObj.length; i++) {
  aboutUsTitle = aboutUsObj[i];
  aboutUsDD.addItem(aboutUsTitle.title, aboutUsTitle.title);
 }
 if (selectedTitle) {
  aboutUsDD.setSelectedData(selectedTitle);
  sectionId = aboutUsDD.sectionId;
  section = getSection(sectionId);
  relatedFieldId = aboutUsDD.relatedField;
  relatedField = section.relatedFields[relatedFieldId];
  if (relatedField.action && window[relatedField.action]) {
   fakeEvent = {};
   fakeEvent.target = aboutUsDD.getEdit();
   clearMutex();
   if (relatedField.actionParams) {
    window[relatedField.action](fakeEvent, ddId, relatedField.actionParams);
   } else {
    window[relatedField.action](fakeEvent);
   }
  }
 }
}

function _getAboutUsDetailsData(e, referrerDD, params) {
 var details, specify, e, trgt, aboutUsDetailsData, aboutUsDD, aboutUsDetailsDD;
 var selected, aboutUsSubEl, aboutUsOtherEl, selectedSubTitle;
 var i, j;
 var sectionId, section, relatedFieldId, relatedField, fakeEvent;
 if (_checkStopEvent(e)) return;
 e = AA.event.getEvent(e);
 trgt = AA.event.getTarget(e);
 aboutUsDetailsData;
 aboutUsDD = dropDownLookup[referrerDD];
 aboutUsDetailsDD = dropDownLookup[params[0]];
 selected = aboutUsDD.getSelectedData();
 if (!selected) return;
 aboutUsSubEl = document.getElementById(params[0]);
 aboutUsOtherEl = document.getElementById(params[1]);
 selectedSubTitle = getAnswer(params[0]);
 for (i = 0; i < aboutUsObj.length; i++) {
  if (aboutUsObj[i].title == selected) {
   specify = aboutUsObj[i].canHaveFreeText;
   if (specify) {
    aboutUsOtherEl.parentNode.parentNode.style.display = "block";
    aboutUsSubEl.parentNode.parentNode.style.display = "none";
   } else {
    aboutUsOtherEl.parentNode.parentNode.style.display = "none";
    aboutUsDetailsData = aboutUsObj[i].subSections;
    if (aboutUsDetailsData) {
     aboutUsDetailsDD.clear();
     for (j = 0; j < aboutUsDetailsData.length; j++) {
      details = aboutUsDetailsData[j].title;
      aboutUsDetailsDD.addItem(details, details);
     }
    }
    aboutUsSubEl.parentNode.parentNode.style.display = "block";
    if (selectedSubTitle) {
     aboutUsDetailsDD.setSelectedData(selectedSubTitle);
     sectionId = aboutUsDetailsDD.sectionId;
     section = getSection(sectionId);
     relatedFieldId = aboutUsDetailsDD.relatedField;
     relatedField = section.relatedFields[relatedFieldId];
     if (relatedField.action && window[relatedField.action]) {
      fakeEvent = {};
      fakeEvent.target = aboutUsDetailsDD.getEdit();
      clearMutex();
      if (relatedField.actionParams) {
       window[relatedField.action](fakeEvent, referrerDD, relatedField.actionParams);
      } else {
       window[relatedField.action](fakeEvent);
      }
     }
    }
   }
  }
 }
 if (selectedSubTitle) aboutUsDetailsDD.setSelectedData(selectedSubTitle);
 setPageHeight();
}

function _getAboutUsOtherData(e) {
 var specify, e, trgt, sectionId, section, relatedFieldId, relatedField, aboutUsDetailsData;
 var selected, aboutUsOtherEl, selectedOtherTitle;
 var i, j;
 if (_checkStopEvent(e)) return;
 e = AA.event.getEvent(e);
 trgt = AA.event.getTarget(e);
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 selected = trgt.value;
 if (!selected) return;
 aboutUsOtherEl = document.getElementById(relatedField.actionParams[0]);
 selectedOtherTitle = getAnswer(relatedField.actionParams[0]);
 for (i = 0; i < aboutUsObj.length; i++) {
  aboutUsDetailsData = aboutUsObj[i].subSections;
  if (aboutUsDetailsData) {
   for (j = 0; j < aboutUsDetailsData.length; j++) {
    if (aboutUsDetailsData[j].title == selected) {
     specify = aboutUsDetailsData[j].canHaveFreeText;
     if (specify) {
      aboutUsOtherEl.parentNode.parentNode.style.display = "block";
     } else {
      aboutUsOtherEl.parentNode.parentNode.style.display = "none";
      if (aboutUsDetailsData) {
       aboutUsOtherEl.value = "";
      }
     }
    }
   }
  }
 }
 if (selectedOtherTitle) aboutUsOtherEl.value = selectedOtherTitle;
 setPageHeight();
}

function _inputRadio(e) {
 var evt, trgt, radioBtn, val, sectionId, section;
 var relatedFieldId, relatedField, oldChecked;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 radioBtn = trgt.parentNode.getElementsByTagName("INPUT")[0];
 oldChecked = radioBtn.checked;
 radioBtn.checked = true;
 _clearErr(e);
 val = trgt.getAttribute("optionValue");
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 if (relatedField.showSection != undefined || relatedField.hideSection != undefined) {
  showHideSection(e);
 } else if (_checkStopEvent(e)) return;
 radioBtn.value = val;
 return oldChecked;
}

function copyAddress(trgt, params, forceClear) {
 var i, checkBox, check;
 checkBox = trgt.parentNode.getElementsByTagName("DIV")[0];
 check = (checkBox.className.indexOf("checked") >= 0);
 if (check) {
  //copy values
  for (i = 0; i < params.length; i++) {
   elPair = params[i];
   if (dropDownLookup[elPair[1]]) dropDownLookup[elPair[0]].setSelectedData(dropDownLookup[elPair[1]].getSelectedData())
   else document.getElementById(elPair[0]).value = document.getElementById(elPair[1]).value;
  }
 } else if (forceClear) {
  //clear values
  for (i = 0; i < params.length; i++) {
   elPair = params[i];
   if (dropDownLookup[elPair[1]]) dropDownLookup[elPair[0]].setSelectedIndex(0)
   else document.getElementById(elPair[0]).value = "";
  }
  dropDownLookup["CorrespondenceAddressState"].getEdit().value = ""
 }
 return true;
}

function _DoNotHaveSSN(e) {
 var evt, trgt, checkBox, check, sectionId, section, relatedFieldId, relatedField;
 var isRequired, showSectionId, hideSectionId, disableBtnEl;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 checkBox = trgt.parentNode.getElementsByTagName("DIV")[0];
 check = checkBox.className == "checkbox";
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 isRequired = relatedField.requiredValue;
 showSectionId = relatedField.showSection;
 hideSectionId = relatedField.hideSection;
 if (getAnswer("Country") == "US") isUSA = true;
 if (check) {
  _clearErr(e);
  checkBox.className = "checkbox checked";
  checkBox.value = true;
  if (isUSA && evt.type) {
   //show warning msg popup
   AA.util.showAlert(AAc.ALERT_ICON, AAc.NO_SSN_TITLE, AAc.NO_SSN_TEXT, "", "", AAc.GOT_IT, "AA.util.hideAlert");
  }
  if (hideSectionId) hideSection(hideSectionId);
 } else {
  checkBox.className = "checkbox";
  checkBox.value = false;
  if (showSectionId) showSection(showSectionId);
 }
 AA.event.stopEvent(e);
}

function _addressMatchCheckbox(e) {
 var evt, trgt, checkBox, check, sectionId, section, relatedFieldId, relatedField;
 var params, isRequired, showSectionId, hideSectionId, disableBtnEl;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 checkBox = trgt.parentNode.getElementsByTagName("DIV")[0];
 check = checkBox.className == "checkbox";
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 params = section.sectionValidate.params;
 isRequired = relatedField.requiredValue;
 showSectionId = relatedField.showSection;
 hideSectionId = relatedField.hideSection;
 if (relatedField.disableBtnId) {
  disableBtnEl = document.getElementById(relatedField.disableBtnId);
 }
 if (check) {
  _clearErr(e);
  checkBox.className = "checkbox checked";
  checkBox.value = true;
  if (disableBtnEl) {
   disableBtnEl.className = "submitbtn";
   disableBtnEl.disabled = false;
   disableBtnEl.parentNode.className = "rowInitial";
  }
  if (hideSectionId) hideSection(hideSectionId);
 } else {
  checkBox.className = "checkbox";
  checkBox.value = false;
  if (isRequired) {
   trgt.parentNode.className = "rowError";
   if (disableBtnEl) {
    disableBtnEl.className = "submitbtn disablebtn";
    disableBtnEl.disabled = true;
    disableBtnEl.parentNode.className = "rowError";
   }
  }
  if (showSectionId) showSection(showSectionId);
 }
 AA.event.stopEvent(e);
 copyAddress(trgt, params, true);
}

function _inputCheckbox(e) {
 var evt, trgt, checkBox, check, sectionId, section;
 var relatedFieldId, relatedField, isRequired, showSectionId, hideSectionId, disableBtnEl;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 checkBox = trgt.parentNode.getElementsByTagName("DIV")[0];
 check = checkBox.className == "checkbox";
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 isRequired = relatedField.requiredValue;
 showSectionId = relatedField.showSection;
 hideSectionId = relatedField.hideSection;
 if (relatedField.disableBtnId) {
  disableBtnEl = document.getElementById(relatedField.disableBtnId);
 }
 if (check) {
  _clearErr(e);
  checkBox.className = "checkbox checked";
  checkBox.value = true;
  if (disableBtnEl) {
   disableBtnEl.className = "submitbtn";
   disableBtnEl.disabled = false;
   disableBtnEl.parentNode.className = "rowInitial";
  }
  if (showSectionId) showSection(showSectionId);
 } else {
  checkBox.className = "checkbox";
  checkBox.value = false;
  if (isRequired) {
   trgt.parentNode.className = "rowError";
   if (disableBtnEl) {
    disableBtnEl.className = "submitbtn disablebtn";
    disableBtnEl.disabled = true;
    disableBtnEl.parentNode.className = "rowError";
   }
  }
  if (hideSectionId) hideSection(hideSectionId);
 }
 AA.event.stopEvent(e);
}

function showSection(showSectionId) {
 var thisSection, i, showSection, showSections;
 showSections = [];
 if (typeof showSectionId == "string") {
  showSections.push(showSectionId)
 } else {
  showSections = showSectionId;
 }
 for (i = 0; i < showSections.length; i++) {
  if (document.getElementById(showSections[i])) {
   showSection = showSections[i];
   thisSection = document.getElementById(showSection);
   if (thisSection.getAttribute("sectionId")) {
    thisSection.parentNode.parentNode.style.display = "block";
   } else {
    thisSection.style.display = "block";
   }
  }
 }
 setPageHeight();
}

// Hide section and clear value of visible field and also hidden if id is added in hideSection Yes/No in JSON

function hideSection(hideSectionId) {
 var thisSection, hideSection, thisInput, thisInputs, thisTextarea, thisTextareas;
 var thisCheckboxes, o, i, hideSections, fakeEvent;
 hideSections = [];
 fakeEvent = [];
 if (typeof hideSectionId == "string") hideSections.push(hideSectionId);
 else hideSections = hideSectionId;
 for (i = 0; i < hideSections.length; i++) {
  if (document.getElementById(hideSections[i])) {
   hideSection = hideSections[i];
   thisSection = document.getElementById(hideSection);
   if (thisSection.getAttribute("sectionId")) {
    thisSection.parentNode.parentNode.style.display = "none";
    thisSection.value = "";
   } else {
    thisSection.style.display = "none";
    if (thisSection.childNodes[0].className == "rowError") {
     thisSection.childNodes[0].className = "rowInitial";
    }
    thisInputs = thisSection.getElementsByTagName("INPUT");
    for (o in thisInputs) {
     thisInput = thisInputs[o];
     if (thisInput.type) {
      thisInput.value = "";
      fakeEvent.target = thisInput;
      _clearErr(fakeEvent);
     }
    }
    thisTextareas = thisSection.getElementsByTagName("TEXTAREA");
    for (o in thisTextareas) {
     thisTextarea = thisTextareas[o];
     if (thisTextarea.type) {
      thisTextarea.value = "";
      fakeEvent.target = thisTextarea;
      _clearErr(fakeEvent);
     }
    }

    thisCheckboxes = thisSection.getElementsByClassName("checkbox");
    for (o in thisCheckboxes) {
     thisCheckboxes[o].className = "checkbox";
    }
   }
  }
 }
 setPageHeight();
}

function _checkIfUS(params) {
 var elSSNQuestion, elSSN, elNIN;
 elSSNQuestion = params[0];
 elSSN = params[1];
 elNIN = params[2];
 if (isUSA) {
  hideSection(elSSNQuestion);
  showSection(elSSN);
  hideSection(elNIN);
  //default SSN question to true for US leads
  var tempEl = document.getElementById(elSSNQuestion);
  var tempOption = tempEl.getElementsByTagName("input")[0];
  tempOption.checked = true;
  tempOption.value = "Yes";
 } else {
  showSection(elSSNQuestion);
  var tempEl = document.getElementById(elSSNQuestion);
  if (tempEl.getElementsByTagName("input")[1].checked) hideSection(elSSN)
  else if (tempEl.getElementsByTagName("input")[0].checked) hideSection(elNIN);
 }
}

function getRadioValue(elName) {
 var k;
 if (document.getElementsByName(elName)) {
  radioOptionList = document.getElementsByName(elName);
  for (k = 0; k < radioOptionList.length; k++) {
   if (radioOptionList[k].checked) return radioOptionList[k].value;
  }
 }
 return "";
}

function showHideSection(e) {
 var hide, show, sectionId, section, relatedFieldId, relatedField, selText, val, optionValue, evt, trgt;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 relatedField = getRelatedField(trgt.id);
 sectionId = trgt.getAttribute("sectionId");
 if (relatedField) {
  selText = dropDownLookup[relatedField.questionId].getSelectedText();
  show = relatedField.showSection[selText];
  hide = relatedField.hideSection[selText];
 }
 if (sectionId) {
  section = getSection(sectionId);
  relatedFieldId = trgt.getAttribute("relatedField");
  relatedField = section.relatedFields[relatedFieldId];
  if (relatedField.inputType == RADIO) val = getRadioValue(relatedField.questionId);
  else val = trgt.value;
  optionValue = trgt.getAttribute("optionValue");
  show = relatedField.showSection[val];
  hide = relatedField.hideSection[val];
 }
 if (hide) hideSection(hide);
 if (show) showSection(show);
 AA.event.stopEvent(e);
}

// Validate all fields on the page
//var delayedCallback;

function fullValidate() {
 var i, submitBtn, validator, thisValid, sections, section, relatedFields, relatedField;
 var regex, trgt, errId, thisVal, required, forceRequired, txtName, fakePassword, radioSet, rowEl;
 forceAndroidBlur();
 inFullValidate = true;
 submitBtn = document.getElementsByClassName("submitbtn")[0];
 isFullValid = true;
 errorList = [];
 txtName = document.getElementById("txtName");
 fakePassword = document.getElementById("fakePassword");
 for (sections in appForm.sections) {
  section = appForm.sections[sections];
  for (relatedFields in section.relatedFields) {
   thisVal = "";
   relatedField = section.relatedFields[relatedFields];
   thisValid = true;
   //validate this field
   if (validation[relatedField.validationType]) {
    validator = validation[relatedField.validationType]
   } else validator = null;
   if (relatedField.inputType == DROPDOWN) {
    trgt = document.getElementById("ddDropDown_" + relatedField.questionId);
    if (!trgt) continue;
    if (getComputedStyle(trgt.parentNode.parentNode.parentNode.parentNode.parentNode, '')["display"] == "none") {
     continue;
    }
    thisVal = trgt.value;
   } else if (relatedField.inputType == RADIO) {
    //thisVal = getRadioValue(relatedField.questionId); // replace
    radioSet = document.getElementsByName(relatedField.questionId);
    if (radioSet.length == 0) continue;
    if (radioSet) {
     for (i = 0; i < radioSet.length; i++) {
      trgt = radioSet[i];
      if (trgt.checked) {
       thisVal = trgt.value;
      }
     }
    }
   } else {
    trgt = document.getElementById(relatedField.questionId);
    if (!trgt) continue;
    if (getComputedStyle(trgt.parentNode.parentNode.parentNode, '')["display"] == "none") {
     continue;
    }
    thisVal = trgt.value;
   }
   if (section.sectionValidate && window[section.sectionValidate.
   function]) {
    if (!window[section.sectionValidate.
    function](trgt, section.sectionValidate.params)) {
     errorList.push(relatedField.questionId);
     thisValid = false;
    }
   }
   if (thisVal) {
    thisVal = AA.trim(thisVal);
   }
   required = relatedField.requiredValue;
   forceRequired = relatedField.forceRequired;

   if (trgt.disabled) forceRequired = false;

   if (validator && validator.validRegex) {
    regex = new RegExp(validator.validRegex)
   } else {
    regex = new RegExp(defaultAllowed);
   }
   if ((isVisible(trgt) || forceRequired) && (("" + required == "true") || ((thisVal != null) && ("" + thisVal != "") && (thisVal != "false")))) {
    if (trgt) {
     if (validator && validator.replace && window[validator.replace]) {
      thisVal = window[validator.replace](thisVal);
     }
     if (validator && regex && (!regex.test(thisVal))) {
      if (thisValid) errorList.push(relatedField.questionId);
      thisValid = false;
     }
     if (required && (("" + thisVal == "false") || (thisVal == null) || (thisVal.length == 0))) {
      if (thisValid) errorList.push(relatedField.questionId);
      thisValid = false;
     }
    }
   }
   rowEl = trgt;
   while ((rowEl.parentNode) && (rowEl.className != "rowError") && (rowEl.className != "rowInitial") && (rowEl.className != "rowDisable")) {
    rowEl = rowEl.parentNode;
   }

   if (!thisValid) {
    if (section.errorParams) {
     for (i = 0; i < section.errorParams.length; i++) {
      errId = section.errorParams[i];
      if (document.getElementById(errId)) {
       document.getElementById(errId).parentNode.className = "rowError";
      }
     }
    } else {
     rowEl.className = "rowError";
    }
    if (trgt.id == "PasswordRetype" && fakePassword) {
     fakePassword.parentNode.parentNode.className = "colm wrap";
    }
    if (trgt.id == "Username") {
     document.getElementById("Username").nextElementSibling.className = "errortxt";
    }
    if (trgt.id == "Email") {
     document.getElementById("Email").nextElementSibling.className = "errortxt";
    }
   }
   if (!thisValid) {
    isFullValid = false;
    delayedCB = null;
    if (submitBtn != null) {
     submitBtn.className = "submitbtn disablebtn";
     submitBtn.disabled = true;
     submitBtn.parentNode.className = "rowError";
    }
   }

   /* element with blur action - blur action will be called if field is valid */

   if (relatedField && relatedField.onblurAction && window[relatedField.onblurAction]) {
    if (relatedField.waitForCallback) {
     //          delayedCallback++;
     if (relatedField.onblurParams) {
      validateActionCache.push([relatedField.onblurAction, true, trgt, relatedField.onblurParams]);
     } else {
      validateActionCache.push([relatedField.onblurAction, true, trgt, null]);
     }
    } else {
     if (relatedField.onblurParams) {
      window[relatedField.onblurAction](thisValid, trgt, relatedField.onblurParams)
     } else {
      window[relatedField.onblurAction](thisValid, trgt);
     }
    }
   }
  }
 }
 if (errorList.length > 0) genericAccountErrorEvent(AAc.VALIDATION_ERROR, errorList.join(", "), 1);
 setPageHeight();
 AA.log("fullValidate");
 processValidationActionCache();
}

function processValidationActionCache() {
 var thisAction;
 AA.log("validateActionCache.length = " + validateActionCache.length);
 if (validateActionCache.length == 0) {
  if (isFullValid) {
   if (delayedCB) {
    delayedCB();
   }
  }
  delayedCB = null;
  inFullValidate = false;
  return;
 }
 thisAction = validateActionCache.pop(); //pop instead of shift to do fields from bottom to top
 if (thisAction[0] && window[thisAction[0]]) window[thisAction[0]](thisAction[1], thisAction[2], thisAction[3]);
}

function isVisible(el) {
 var vis = true;
 while (el.parentNode) {
  if (el.style.display == "none") vis = false;
  el = el.parentNode;
 }
 return vis;
}

function checkEmail(isValid, trgt) {
 if (isValid) {
  _loadedPage = _currentPage;
  if ((!trgt.disabled) && (trgt.value != "")) {
   checkStatusObj.credentialType = "EMAIL";
   checkStatusObj.credentialValue = trgt.value.toLowerCase();
   if (inFullValidate) {
    _requestStatus(JSON.stringify(checkStatusObj), _checkEmailFullCB);
   } else {
    _requestStatus(JSON.stringify(checkStatusObj), _checkEmailCB);
   }
  } else if (inFullValidate) {
   processValidationActionCache();
  }
 }
}

function checkUsername(isValid, trgt) {
 if (isValid) {
  _loadedPage = _currentPage;
  if ((!trgt.disabled) && (trgt.value != "")) {
   checkStatusObj.credentialType = "USERNAME";
   checkStatusObj.credentialValue = trgt.value.toUpperCase();
   checkDemoStatusObj.credentialType = "USERNAME";
   checkDemoStatusObj.credentialValue = "DEMO" + trgt.value.toUpperCase();
   if (inFullValidate) {
    if (_currentPage == DEMOPAGE) {
     _requestStatus(JSON.stringify(checkDemoStatusObj), _checkUsernameFullCB);
    } else _requestStatus(JSON.stringify(checkStatusObj), _checkUsernameFullCB);
   } else {
    if (_currentPage == DEMOPAGE) {
     _requestStatus(JSON.stringify(checkDemoStatusObj), _checkUsernameCB);
    } else _requestStatus(JSON.stringify(checkStatusObj), _checkUsernameCB);
   }
  } else if (inFullValidate) {
   processValidationActionCache();
  }
 }
}

function _requestStatus(data, CB) {
 _thisRest.RESTput(AA.restPathPrefixes.checkStatus, this, data, CB, CB);
}

function _checkEmailFullCB(resp) {
 _checkEmailCB(resp);
 processValidationActionCache();
}

function _checkEmailCB(resp) {
 var emailEl, respObj, status;
 // Process response if the email field is on page 1
 if (_currentPage == _loadedPage && document.getElementById("Email")) {
  try {
   emailEl = document.getElementById("Email");
   respObj = JSON.parse(resp);
   status = (respObj.header) ? respObj.header.responseStatus : null;
   if (status === "ACTIVE_APPLICATION") {
    isFullValid = false;
    genericAccountErrorEvent(AAc.VALIDATION_ERROR, AAc.EMAIL_IN_USE, 1);
    if (_currentPage == DEMOPAGE) {
     showErrorMessage(AAc.DEMO_EMAIL_IN_USE_LINK)
    } else {
     showDialog(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.LEAD_IN_USE, AAc.RESUME, "_goToResumePage");
    }
    emailEl.parentNode.className = "rowError";
    if (emailEl.nextElementSibling.className == "errortxt") {
     emailEl.nextElementSibling.className = "hide errortxt";
    }
   } else if (status === "COMPLETED_APPLICATION" || status === "ACTIVE_MEMBER") {
    isFullValid = false;
    genericAccountErrorEvent(AAc.VALIDATION_ERROR, AAc.EMAIL_ALREADY_MEMBER, 1);
    if (_currentPage == DEMOPAGE) {
     showErrorMessage(AAc.DEMO_EMAIL_IN_USE_LINK)
    } else {
     if (isDesktop) {
      showDialog(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.EXISTING_MEMBER, AAc.LOG_IN, "_goToLoginPage");
     } else {
      showErrorMessage(AAc.EMAIL_IN_USE_LINK);
     }
    }
    emailEl.parentNode.className = "rowError";
    if (emailEl.nextElementSibling.className == "errortxt") {
     emailEl.nextElementSibling.className = "hide errortxt";
    }
   } else if (status === "BLACKLISTED") {
    isFullValid = false;
    genericAccountErrorEvent(AAc.VALIDATION_ERROR, AAc.EMAIL_BLACKLISTED, 1);
    showErrorMessage(AAc.EMAIL_BLACKLISTED);
    emailEl.parentNode.className = "rowError";
    if (emailEl.nextElementSibling.className == "errortxt") {
     emailEl.nextElementSibling.className = "hide errortxt";
    }
   }
  } catch (e) {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.GENERIC_EMAIL_ERROR, 0);
   showGenericError();
   AA.debug("REST response error: " + e);
  }
 }
}

function _checkUsernameFullCB(resp) {
 _checkUsernameCB(resp);
 processValidationActionCache();
}

function _checkUsernameCB(resp) {
 var usernameEl, respObj, status;
 // Process response if the username field is on page 1
 if (_currentPage == _loadedPage && document.getElementById("Username")) {
  try {
   usernameEl = document.getElementById("Username");
   respObj = JSON.parse(resp);
   status = (respObj.header) ? respObj.header.responseStatus : null;
   if (status === "ACTIVE_APPLICATION") {
    isFullValid = false;
    genericAccountErrorEvent(AAc.VALIDATION_ERROR, AAc.USERNAME_IN_USE, 1);
    showErrorMessage(AAc.USERNAME_IN_USE);
    usernameEl.parentNode.className = "rowError";
    if (usernameEl.nextElementSibling.className == "errortxt") {
     usernameEl.nextElementSibling.className = "hide errortxt";
    }
   } else if (status === "COMPLETED_APPLICATION" || status === "ACTIVE_MEMBER") {
    isFullValid = false;
    genericAccountErrorEvent(AAc.VALIDATION_ERROR, AAc.USERNAME_IS_MEMBER, 1);
    showErrorMessage(AAc.USERNAME_IN_USE);
    usernameEl.parentNode.className = "rowError";
    if (usernameEl.nextElementSibling.className == "errortxt") {
     usernameEl.nextElementSibling.className = "hide errortxt";
    }
   }
  } catch (e) {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.GENERIC_USERNAME_ERROR, 0);
   showGenericError();
   AA.debug("REST response error: " + e);
  }
 }
}

// Field Validation

function _checkError(e) {
 var submitBtn, i, forceRequired, isValid, evt, trgt, sectionId;
 var section, relatedFieldId, relatedField, validateType, requiredValue;
 var errId, thisValid, thisVal, fakePassword, txtName, validator, regex, rowEl, fakeEvent;
 submitBtn = document.getElementsByClassName("submitbtn")[0];
 if (!submitBtn) return; // if no submit button, then we are on unified view - so no need to check for errors
 if (submitBtn.disabled) return; // mutex to stop refocusing to the previous element if target is disabled on android
 isValid = true;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 validateType = relatedField.validationType;
 requiredValue = relatedField.requiredValue;
 fakePassword = document.getElementById("fakePassword");
 txtName = document.getElementById("txtName");
 if (relatedField.inputType == CHECKBOX) {
  thisVal = (("" + trgt.value).toLowerCase() == "true");
 }
 if (relatedField.inputType == INVERTED_CHECKBOX) {
  thisVal = (("" + trgt.value).toLowerCase() != "true");
 } else {
  thisVal = trgt.value;
 }
 if (thisVal) {
  trgt.value = thisVal = AA.trim(thisVal);
 }

 validator = validation[validateType];
 if (validator && validator.validRegex) {
  regex = new RegExp(validator.validRegex)
 } else {
  regex = new RegExp(defaultAllowed);
 }
 thisValid = true;

 if (section.sectionValidate && window[section.sectionValidate.
 function]) {
  if (!window[section.sectionValidate.
  function](trgt, section.sectionValidate.params)) {
   thisValid = false;
  }
 }

 forceRequired = relatedField.forceRequired;
 if (trgt.disabled) forceRequired = false;

 if ((isVisible(trgt) || forceRequired) && (("" + requiredValue == "true") || ((thisVal != null) && ("" + thisVal != "") && (thisVal != "false")))) {
  if (trgt) {
   if (validator && validator.replace && window[validator.replace]) {
    thisVal = window[validator.replace](thisVal);
   }
   if (validator && regex && (!regex.test(thisVal))) {
    thisValid = false;
   }
   if (requiredValue && ((thisVal == null) || (thisVal.length == 0) || (thisVal === false))) {
    thisValid = false;
   }
  }
 }
 rowEl = trgt;
 while ((rowEl.parentNode) && (rowEl.className != "rowError") && (rowEl.className != "rowInitial") && (rowEl.className != "rowDisable")) {
  rowEl = rowEl.parentNode;
 }
 if (section.errorParams && singleErrorCheck && (section.sectionId != "dobSection")) {
  singleErrorCheck = false;
  try {
   for (i = 0; i < section.errorParams.length; i++) {
    errId = section.errorParams[i];
    if (document.getElementById(errId)) {
     fakeEvent = {};
     fakeEvent.target = document.getElementById(errId);
     if (!_checkError(fakeEvent)) thisValid = false;
    }
   }
  } catch (ee) {}
  singleErrorCheck = true;
 }
 if (!thisValid) {
  if (section.errorParams) {
   for (i = 0; i < section.errorParams.length; i++) {
    errId = section.errorParams[i];
    if (document.getElementById(errId)) {
     document.getElementById(errId).parentNode.className = "rowError";
    }
   }
  } else {
   rowEl.className = "rowError";
  }
  if (trgt.id == "PasswordRetype" && fakePassword) {
   fakePassword.parentNode.parentNode.className = "colm wrap"
  }
  if (trgt.id == "Username") {
   document.getElementById("Username").nextElementSibling.className = "errortxt";
  }
  if (trgt.id == "Email") {
   document.getElementById("Email").nextElementSibling.className = "errortxt";
  }
 } else {
  rowEl.className = "rowInitial";
  if (trgt.id == "PasswordRetype" && fakePassword) {
   fakePassword.parentNode.parentNode.className = "colm"
  }
  if (relatedField.questionId == trgt.id && relatedField.inputType == CHECKBOX && "" + requiredValue == "true") {
   document.getElementById(trgt.id).parentNode.parentNode.className = relatedField.className;
  }
 }
 if (!thisValid) {
  isValid = false;
 }
 if (relatedField && relatedField.onblurAction && window[relatedField.onblurAction]) {
  if (relatedField.onblurParams) {
   window[relatedField.onblurAction](isValid, trgt, relatedField.onblurParams)
  } else {
   window[relatedField.onblurAction](isValid, trgt);
  }
 }
 setPageHeight();
 return isValid;
}

// Clear Error Indicators

function _clearErr(e) {
 var row, i, errId, submitBtn, evt, trgt, sectionId, section, relatedFieldId, relatedField, txtName;
 submitBtn = document.getElementsByClassName("submitbtn")[0];
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 sectionId = trgt.getAttribute("sectionId");
 if (!sectionId) return;
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 txtName = document.getElementById("txtName");

 if (section.errorParams) {
  for (i = 0; i < section.errorParams.length; i++) {
   errId = section.errorParams[i];
   row = document.getElementById(errId);
   if (row) {
    while (row.className != "rowError" && row.parentNode) row = row.parentNode;
    if (row.className == "rowError") {
     row.className = "rowInitial";
    }
   }
  }
 } else {
  row = trgt;
  while (row.className != "rowError" && row.parentNode) row = row.parentNode;
  if (row.className == "rowError") {
   row.className = "rowInitial";
  }
 }
 if (submitBtn != null) {
  submitBtn.className = "submitbtn";
  submitBtn.disabled = false;
  submitBtn.parentNode.className = "rowInitial";
 }
 if ((relatedField) && (relatedField.onfocusAction != undefined)) {
  if (relatedField.onfocusAction && window[relatedField.onfocusAction]) {
   window[relatedField.onfocusAction](true, trgt);
  }
 }
 setPageHeight();
 e.target.focus();
}

// validation replace functions

function toLowerCase(val) {
 return val.toLowerCase();
}

function toUpperCase(val) {
 return val.toUpperCase();
}

// validate Social Security Number

function validateSSN(e, params) {
 var isError, thisValue;
 mergeValues(e, params);
 isError = false;
 thisValue = AA.trim(document.getElementById(params[1]).value);
 if ((thisValue.length > 0) && ((thisValue == "000") || (thisValue == "666"))) {
  isError = true;
 }
 thisValue = AA.trim(document.getElementById(params[2]).value);
 if ((thisValue.length > 0) && (thisValue == "00")) {
  isError = true;
 }
 thisValue = AA.trim(document.getElementById(params[3]).value);
 if ((thisValue.length > 0) && (thisValue == "0000")) {
  isError = true;
 }
 return !isError
}

// Get and set answer

function getAnswer(questionId) {
 var i;
 if (!answers) return "";
 for (i = 0; i < answers.length; i++) {
  if (answers[i].questionKey == questionId) {
   return answers[i].answerValue;
  }
 }
}

function setAnswer(questionId, val) {
 var i;
 if (!answers) return "";
 for (i = 0; i < answers.length; i++) {
  if (answers[i].questionKey == questionId) {
   answers[i].answerValue = val;
   return;
  }
 }
 answers.push({
  "questionKey": questionId,
  "answerValue": val
 });
}

function addAnswer(answers, questionId, val) {
 var i;
 for (i = 0; i < answers.length; i++) {
  if (answers[i].questionKey == questionId) {
   answers[i].answerValue = val;
   return answers;
  }
 }
 answers.push({
  "questionKey": questionId,
  "answerValue": val
 });
 return answers;
}

// Get AA section

function getSection(sectionId) {
 var i;
 for (i = 0; i < appForm.sections.length; i++) if (appForm.sections[i].sectionId == sectionId) return appForm.sections[i];
}

// Get AA fields

function getRelatedField(fieldKey) { // todo: replace in used cases
 var i, sections, section, relatedFields;
 for (sections in appForm.sections) {
  try {
   section = appForm.sections[sections];
   relatedFields = section.relatedFields;
   for (i = 0; i < relatedFields.length; i++) {
    if (relatedFields[i].questionId == fieldKey) return relatedFields[i];
   }
  } catch (e) {}
 }
}

/*********************
 * Submission Area
 *********************/


// Compose Member Object - Prod and Demo Form

function memberObj() {
 thisSubmitMemObj.username = getAnswer("Username").toUpperCase();
 thisSubmitMemObj.password = getAnswer("Password");
 if (thisSubmitMemObj.username && thisSubmitMemObj.password) {
  return JSON.stringify(thisSubmitMemObj);
 } else {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_OBJECT_ERROR, 0);
  showGenericError();
 }
}

// Submit Lead - PROD and DEMO Form

function _submitDemoLead(e) {
 var data;
 if (_checkStopEvent(e)) return;
 fullValidate();
 if (!isFullValid) return;
 demoTmpAnswers = leadAnswers();
 data = JSON.stringify(demoTmpAnswers)
 _thisRest.RESTpost(AA.restPathPrefixes.initialiseDemoLead, this, data, _submitDemoLeadCB, _demoLeadErrorCB);
}

function _submitDemoLeadCB(resp) {
 var respObj, errObj;
 try {
  respObj = JSON.parse(resp);
  if (respObj.header && (respObj.header.responseStatus == "SUCCESS")) {
   nexmoKey = respObj.header.key;
   nexmoToken = respObj.header.token;
   _gotoNextPage();
  } else {
   errObj = AAc.DEMO_ERROR_OTHER;
   genericAccountErrorEvent(AAc.GENERIC_ERROR, "Generic failed to submit lead error. Error text: " + respObj.errorText, 0);
   showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   AA.debug("Demo Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.SUBMIT_LEAD_ERROR, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

//add key and token to updateDemoLead

function _sendDemoLead() {
 var tmpAnswers, data;
 if (!isFullValid) return;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 if (isFullValid) {
  setValidate();
  tmpAnswers = leadAnswers();
  if (_currentPage == DEMOPAGE) tmpAnswers.answers = addAnswer(tmpAnswers.answers, "Username", "DEMO" + getAnswer("Username").toUpperCase());
  if (_currentPage == PAGEONE) tmpAnswers.answers = addInMockLeadData(tmpAnswers.answers);
  if (isDebug) tmpAnswers.debug = JSON.stringify(answers);
  data = JSON.stringify(tmpAnswers);
  _postLead(data, _createLeadSuccessCB);
 }
}

var SHOW_SEND_CODE = 0;
var SHOW_NEXMO_CODE = 1;
var SHOW_NEXT_PAGE_ONLY = 2;

function showSendCode() {
 toggleSendCode(SHOW_SEND_CODE);
}

function toggleSendCode(toggle) {
 if (toggle != SHOW_SEND_CODE) document.getElementById("sendCodeSection").style.display = "none" //hide Send Code button section
 else document.getElementById("sendCodeSection").style.display = "block"; //show Send Code button section
 setPageHeight();
}

function toggleNexmoCodeRequired(toggle) {
 var section, relatedField;
 section = getSection("nexmoCodeSection");
 relatedField = getRelatedFieldFromSection(section, "nexmoCode");
 if (toggle) relatedField.requiredValue = true;
 else relatedField.requiredValue = false;
}

function toggleNexmoSections(toggle) {
 var oldToggle, nexmoCodeSection, verifyAndSaveSection;
 nexmoCodeSection = document.getElementById("nexmoCodeSection");
 verifyAndSaveSection = document.getElementById("verifyAndSaveSection");

 if (nexmoCodeSection.style.display == "block") oldToggle = SHOW_NEXMO_CODE
 else if (verifyAndSaveSection.style.display == "block") oldToggle = SHOW_NEXT_PAGE_ONLY
 else oldToggle = SHOW_SEND_CODE;

 if (toggle == SHOW_NEXT_PAGE_ONLY) {
  //set nexmo code to not required
  toggleNexmoCodeRequired(false);
  verifyAndSaveSection.style.display = "block";
 } else if (toggle == SHOW_NEXMO_CODE) {
  toggleNexmoCodeRequired(true);
  nexmoCodeSection.style.display = "block";
  verifyAndSaveSection.style.display = "block";
 } else {
  //set nexmo code to not required
  toggleNexmoCodeRequired(false);
  nexmoCodeSection.style.display = "none";
  verifyAndSaveSection.style.display = "none";
 }
 toggleSendCode(toggle);
 setPageHeight();
 return oldToggle;
}

function _requestNexmoCode(e) {
 var tmpAnswers, data;
 if (_checkStopEvent(e)) return;

 //blur input
 document.activeElement.blur();

 toggleNexmoSections(SHOW_SEND_CODE);
 fullValidate();
 if (!isFullValid) return;
 tmpAnswers = {};
 tmpAnswers.username = getAnswer("Username");
 tmpAnswers.email = getAnswer("Email");
 data = JSON.stringify(tmpAnswers)
 _thisRest.RESTpost(AA.restPathPrefixes.generateNexmoToken, this, data, _submitRequestNexmoCodeCB, _nexmoCodeErrorCB);
}

function _submitRequestNexmoCodeCB(resp) {
 var respObj, errObj;
 try {

  respObj = JSON.parse(resp);
  nexmoKey = respObj.key;
  nexmoToken = respObj.token;

  tmpAnswers = {};
  tmpAnswers.answers = {};
  tmpAnswers = leadAnswers()
  tmpAnswers.answers = AA.copyObject(answers);
  if (fullDialingPrefix == undefined) fullDialingPrefix = "001"; //If no prefix then US prefix (001)
  addAnswer(tmpAnswers.answers, "countryPrefix", fullDialingPrefix);
  addAnswer(tmpAnswers.answers, "Key", nexmoKey);
  addAnswer(tmpAnswers.answers, "Token", nexmoToken);
  addAnswer(tmpAnswers.answers, "phoneNumber", document.getElementById('PhonePrimary').value);

  data = JSON.stringify(tmpAnswers);
  _thisRest.RESTpost(AA.restPathPrefixes.requestNexmoCode, this, data, _nexmoCodeRequestedCB, _nexmoCodeErrorCB);
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _nexmoCodeRequestedCB(resp) {
 var respObj, errObj, section, relatedField;
 try {
  respObj = JSON.parse(resp);
  if (respObj.statusCode == 201) { //Phone Number Already Present
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_EXISTS, 0);
   dialogBox(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.EXISTING_MEMBER, "", "", AAc.LOG_IN, "_goToLoginPage");
   toggleNexmoSections(SHOW_SEND_CODE);
  } else if (respObj.statusCode == 208) {
   requestId = respObj.requestId;

   //hide nexmo section
   toggleNexmoSections(SHOW_NEXT_PAGE_ONLY);

   showNoIconDialog(AAc.NEXMO_CODE, AAc.ALREADY_VERIFIED);
   genericAccountErrorEvent(AAc.GENERIC_INFO, AAc.ALREADY_VERIFIED, 0);
  } else if (respObj.statusMessage == "OK") {
   requestId = respObj.requestId;

   //show hidden section...
   toggleNexmoSections(SHOW_NEXMO_CODE);
  } else if (AAc["ERROR_" + respObj.statusCode]) {
   errObj = AAc["ERROR_" + respObj.statusCode];
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_MEMBER_CREATE, 0);
   showErrorMessage(errObj.errorText);
  } else {
   errObj = AAc.ERROR_OTHER;
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
   showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   AA.debug("Nexmo Code Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
 setPageHeight();
}

function _resendNexmoCode(e) {
 try {
  tmpAnswers = {};
  tmpAnswers.answers = {};
  tmpAnswers = leadAnswers()
  tmpAnswers.answers = AA.copyObject(answers);
  if (fullDialingPrefix == undefined) fullDialingPrefix = "001"; //If no prefix then US prefix (001)
  addAnswer(tmpAnswers.answers, "countryPrefix", fullDialingPrefix);
  addAnswer(tmpAnswers.answers, "Key", nexmoKey);
  addAnswer(tmpAnswers.answers, "Token", nexmoToken);
  addAnswer(tmpAnswers.answers, "phoneNumber", document.getElementById('PhonePrimary').value);

  data = JSON.stringify(tmpAnswers);
  _thisRest.RESTpost(AA.restPathPrefixes.requestNexmoCode, this, data, _nexmoCodeResendCB, _nexmoCodeErrorCB);
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _nexmoCodeResendCB(resp) {
 var respObj, errObj, section, relatedField;
 try {
  respObj = JSON.parse(resp);
  if (respObj.statusCode == 201) { //Phone Number Already Present
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_EXISTS, 0);
   dialogBox(AAc.NO_ICON, AAc.WELCOME_BACK_TITLE, AAc.EXISTING_MEMBER, "", "", AAc.LOG_IN, "_goToLoginPage");
   toggleNexmoSections(SHOW_SEND_CODE);
  } else if (respObj.statusCode == 208) { //Nexmo code already verified
   requestId = respObj.requestId;

   //hide nexmo code, show next page button
   toggleNexmoSections(SHOW_NEXT_PAGE_ONLY);

   showNoIconDialog(AAc.NEXMO_CODE, AAc.ALREADY_VERIFIED);
   genericAccountErrorEvent(AAc.GENERIC_INFO, AAc.ALREADY_VERIFIED, 0);
  } else if (respObj.statusMessage == "OK") {
   requestId = respObj.requestId;

   //show hidden section...
   toggleNexmoSections(SHOW_NEXMO_CODE);

   //alert, code sent...
   showNoIconDialog(AAc.NEXMO_CODE, AAc.CODE_SENT);

  } else if (AAc["ERROR_" + respObj.statusCode]) {
   errObj = AAc["ERROR_" + respObj.statusCode];
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_MEMBER_CREATE, 0);
   showErrorMessage(errObj.errorText);
  } else {
   errObj = AAc.ERROR_OTHER;
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
   showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   AA.debug("Nexmo Code Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
  toggleNexmoSections(SHOW_SEND_CODE);
 }
 setPageHeight();
}

function _nexmoCodeErrorCB(resp) {
 genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_REQUEST_SMS, 0);
 showGenericError();
 AA.debug("REST response error: " + e);
}

function _submitNexmoRequest(e) {
 var tmpAnswers, data;
 if (_checkStopEvent(e)) return;
 fullValidate();
 if (!isFullValid) return;
 setAnswer("nexmoValidationCode", ""); //clear out any pre-existing nexmo validation code
 tmpAnswers = leadAnswers()
 tmpAnswers.answers = AA.copyObject(answers);
 if (fullDialingPrefix == undefined) fullDialingPrefix = "001"; //If no prefix then US prefix (001)
 addAnswer(tmpAnswers.answers, "countryPrefix", fullDialingPrefix);
 addAnswer(tmpAnswers.answers, "Key", nexmoKey);
 addAnswer(tmpAnswers.answers, "Token", nexmoToken);
 data = JSON.stringify(tmpAnswers);
 _thisRest.RESTpost(AA.restPathPrefixes.updateDemoLead, this, data, _updateDemoCB, _demoLeadErrorCB);
}

function _updateDemoCB(resp) {
 var respObj, errObj;
 nexmoReqXLTS = new Date();
 try {
  respObj = JSON.parse(resp);
  if (respObj.statusCode == 0) {
   AA.util.toggleInProgress("none");
   AA.util.hideAlert();
   AA.util.hideModal();
   requestId = respObj.requestId;
   _gotoNextPage();
  } else {
   if (AAc["ERROR_" + respObj.statusCode]) {
    errObj = AAc["ERROR_" + respObj.statusCode];
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.DEMO_LEAD_ERROR, 0);
    showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   } else if (AAc["DEMO_ERROR_" + respObj.statusCode]) {
    errObj = AAc["DEMO_ERROR_" + respObj.statusCode];
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.DEMO_LEAD_ERROR, 0);
    showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   } else {
    errObj = AAc.DEMO_ERROR_OTHER;
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.DEMO_LEAD_ERROR, 0);
    showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
    AA.debug("Demo Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
   }
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.DEMO_LEAD_ERROR, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _demoLeadErrorCB(errorStatus, responseText, _this, callbackObject, resp) {
 var respObj, errList, errorDetails, responsePage;
 AA.util.toggleInProgress("none");
 delayedCB = null;
 try {
  if (errorStatus === 503) {
   loadPage(LINKS["NEW"]["pageUnavailable"])
   genericAccountErrorEvent(AAc.PAGE_UNAVAILABLE, AAc.NONE_GENERIC, 0);
  } else {
   if (errorStatus >= 400) {
    AA.util.hideAlert();
    respObj = JSON.parse(resp);
    if ((respObj.responseStatus == "FAILURE") && (respObj.errorReason == "VALIDATION_ERROR")) {
     //alert first validation error
     errList = respObj.invalidQuestionIds;
     errorDetails = getFirstFailure(errList);
     if (errorDetails && (errorDetails.pageNo < 100)) {
      if (errorDetails.fieldTitle == "") {
       AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, "Validation error on Step " + errorDetails.pageNo, "", "", "Goto Stage " + errorDetails.pageNo, "_gotoPage" + errorDetails.pageNo);
       genericAccountErrorEvent("Validation error on Step " + errorDetails.pageNo, AAc.NONE_GENERIC, 1);
      } else {
       AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, "Validation failed for " + errorDetails.fieldTitle + " on Step " + errorDetails.pageNo, "", "", "Goto Stage " + errorDetails.pageNo, "_gotoPage" + errorDetails.pageNo);
       genericAccountErrorEvent("Validation failed for " + errorDetails.fieldTitle + " on Step " + errorDetails.pageNo, errorDetails.fieldTitle, 1);
      }
      scrollToTop();
      return;
     }
    }
    responsePage = respObj.irpUri;
    if ((responsePage != null) && (responsePage != "")) {
     genericAccountErrorEvent(respObj.responseStatus + ". Redirecting to: " + responsePage, AAc.NONE_GENERIC, 0);
     _gotIRPPage(responsePage);
    } else {
     if (respObj.header && respObj.header.responseStatus && AAc[respObj.header.responseStatus]) {
      genericAccountErrorEvent(AAc[respObj.header.responseStatus], AAc.NONE_GENERIC, 0);
      showErrorMessage(AAc[respObj.header.responseStatus]);
     } else if (respObj.header && respObj.header.responseMessage) {
      genericAccountErrorEvent(respObj.header.responseMessage, AAc.NONE_GENERIC, 0);
      showErrorMessage(respObj.header.responseMessage);
     } else if (responseText) {
      genericAccountErrorEvent(responseText, AAc.NONE_GENERIC, 0);
      showErrorMessage(responseText);
     } else {
      genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
      showGenericError();
     }
    }
   } else {
    if (responseText) {
     genericAccountErrorEvent(responseText, AAc.NONE_GENERIC, 0);
     showErrorMessage(responseText);
    } else {
     genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
     showGenericError();
    }
   }
   AA.debug("REST call error: " + errorStatus + " responseText = " + responseText);
   if (_currentPage == 1) {
    document.getElementById("submitBtn").className = "submitbtn";
    document.getElementById("submitBtn").disabled = false;
   }
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
  showGenericError();
 }
}

function _submitLeadVerify(e) {
 if (_checkStopEvent(e)) return;
 //check that number has either been verified (nexmo code is visible) or is not required
 section = getSection("nexmoCodeSection");
 relatedField = getRelatedFieldFromSection(section, "nexmoCode");
 if (relatedField.requiredValue && document.getElementById("nexmoCodeSection").style.display == "none") {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.VERIFICATION_REQUIRED, 0);
  showErrorMessage(AAc.VERIFICATION_REQUIRED);
  isFullValid = false;
  delayedCB = null;
  return;
 }
 if (document.getElementById("nexmoCodeSection").style.display == "none") delayedCB = _sendLead
 else delayedCB = _sendLeadVerify;
 fullValidate();
}

function _submitLead(e) {
 if (_checkStopEvent(e)) return;
 delayedCB = _sendLead;
 fullValidate();
}

function _sendLeadVerify() {
 var tmpAnswers, data;
 if (!isFullValid) return;
 tmpAnswers = {};
 tmpAnswers.requestId = requestId;
 tmpAnswers.nexmoCode = document.getElementById('nexmoCode').value;
 data = JSON.stringify(tmpAnswers);
 _thisRest.RESTpost(AA.restPathPrefixes.verifyNexmoCode, this, data, nexmoCodeVerifiedCB, nexmoCodeFailedCB);
}

function nexmoCodeVerifiedCB(resp) {
 try {
  AA.util.hideAlert();
  respObj = JSON.parse(resp);
  if ((respObj.statusCode != undefined) && (respObj.statusCode != 0)) {
   if (AAc["ERROR_" + respObj.statusCode]) {
    errObj = AAc["ERROR_" + respObj.statusCode];
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_NEXMO_CODE, 0);
    showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   } else {
    errObj = AAc.ERROR_OTHER;
    genericAccountErrorEvent(AAc.GENERIC_ERROR, "Failed to validate nexmo code. Error text: " + respObj.errorText, 0);
    showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
    AA.debug("Prod Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
   }
  } else {
   //if good
   _sendLead()
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "Failed to validate nexmo code.", 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function nexmoCodeFailedCB(resp) {
 errObj = AAc.ERROR_OTHER;
 genericAccountErrorEvent(AAc.GENERIC_ERROR, "Failed to validate nexmo code. Error text: " + respObj.errorText, 0);
 showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
 AA.debug("Prod Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
}

function _sendLead() {
 var tmpAnswers, data;
 if (!isFullValid) return;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 if (isFullValid) {
  setValidate();
  tmpAnswers = leadAnswers();
  if (_currentPage == PAGEONE) tmpAnswers.answers = addInMockLeadData(tmpAnswers.answers);
  if (isDebug) tmpAnswers.debug = JSON.stringify(answers);
  data = JSON.stringify(tmpAnswers);
  _postLead(data, _createLeadSuccessCB);
 }
}

function _saveLead(e) {
 var tmpAnswers, data;
 if (_checkStopEvent(e)) return;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 unsetValidate();
 tmpAnswers = leadAnswers();
 if (isDebug) tmpAnswers.debug = JSON.stringify(answers);
 data = JSON.stringify(tmpAnswers);
 _postSaveLead(data);
}

// Submit Member - PROD and DEMO Form


function _submitMemberPrint(e) {
 openAllPages = true;
 _submitMember(e);
}

function _submitDemoLeadToMember(e) {
 var tmpAnswers, tmpObj, memObj;
 delayedCB = null;
 if (_checkStopEvent(e)) return;
 fullValidate();
 tmpAnswers = leadAnswers();
 tmpAnswers.answers = AA.copyObject(answers);
 tmpAnswers.answers = addAnswer(tmpAnswers.answers, "Username", "DEMO" + getAnswer("Username").toUpperCase());
 if (isFullValid) {
  setValidate();
  tmpAnswers.answers = addInMockMemberData(tmpAnswers.answers);
  tmpAnswers.answers = addAffiliateFromCookie(tmpAnswers.answers);
  AA.util.toggleInProgress("block");
  AA.util.hideAlert();
  scrollToTop();
  try {
   tmpObj = {};
   tmpObj.requestId = requestId;
   tmpObj.nexmoCode = document.getElementById("nexmoValidationCode").value;
   tmpObj.lead = tmpAnswers;
   tmpObj.lead.username = getAnswer("Username").toUpperCase();
   tmpObj.lead.password = getAnswer("Password");
   memObj = JSON.stringify(tmpObj);
   _postDemoMember(memObj);
  } catch (e) {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_UPSERT_DEMO, 0);
   showGenericError();
   AA.debug("REST response error: " + e);
  }
 }
}

function _validateMember(e) {
 var tmpAnswers, data;
 delayedCB = null;
 if (_checkStopEvent(e)) return;
 fullValidate();
 tmpAnswers = leadAnswers();
 if (isFullValid) {
  setValidate();
  tmpAnswers.answers = addInMockMemberData(tmpAnswers.answers);
  tmpAnswers.answers = addAffiliateFromCookie(tmpAnswers.answers);
  data = JSON.stringify(tmpAnswers);
  _postLeadValidate(data, _sendMemberValidate);
 }
}

function _submitMember(e) {
 var tmpAnswers, data;
 delayedCB = null;
 if (_checkStopEvent(e)) return;
 fullValidate();
 tmpAnswers = leadAnswers();
 if (isFullValid) {
  setValidate();
  tmpAnswers.answers = addInMockMemberData(tmpAnswers.answers);
  tmpAnswers.answers = addAffiliateFromCookie(tmpAnswers.answers);
  data = JSON.stringify(tmpAnswers);
  _postLead(data, _sendMember);
 }
}

// Submit Member - Demo Form

function _submitDemoMember(e) {
 if (_checkStopEvent(e)) return;
 delayedCB = _sendDemoMember;
 fullValidate();
}

function _sendDemoMember() {
 var tmpAnswers, data;
 if (!isFullValid) return;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 tmpAnswers = leadAnswers();
 if (isFullValid) {
  tmpAnswers.answers = addAnswer(tmpAnswers.answers, "Username", "DEMO" + getAnswer("Username").toUpperCase());
  tmpAnswers.answers = addInMockLeadData(tmpAnswers.answers);
  tmpAnswers.answers = addInMockMemberData(tmpAnswers.answers);
  tmpAnswers.answers = addAffiliateFromCookie(tmpAnswers.answers);
  data = JSON.stringify(tmpAnswers);
  _postLead(data, _sendMember);
 }
}

// Send Member - Prod and Demo Form

function _sendMemberValidate(resp) {
 var tmpObj, memObj, data;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 try {
  tmpObj = JSON.parse(resp);
  memObj = {};
  memObj.username = getAnswer("Username").toUpperCase();
  memObj.password = getAnswer("Password");
  if (fullDialingPrefix == undefined) fullDialingPrefix = "001"; //If no prefix then US prefix (001)
  memObj.countryPrefix = fullDialingPrefix;
  memObj.phoneNumber = getAnswer("PhonePrimary");
  if (memObj.username && memObj.password && memObj.countryPrefix && memObj.phoneNumber) {
   data = JSON.stringify(memObj);
   _postMemberValidate(data);
  } else {
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.MEMBER_OBJECT_ERROR, 0);
   showGenericError();
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_SEND_MEMBER, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _sendMember(resp) {
 var tmpObj, memObj;
 AA.util.toggleInProgress("block");
 AA.util.hideAlert();
 scrollToTop();
 try {
  tmpObj = JSON.parse(resp);
  memObj = memberObj();
  _postMember(memObj);
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_SEND_MEMBER, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

//  Compose submission object

function leadAnswers() {
 var i, j, k;
 var thisAnswers, thisQuestionKey, thisSection, thisField, thisType, thisValidationType, thisAnswerValue, ddElement, tmpObj;
 var radioOptionList, thisPageSection;
 thisAnswers = {
  "formVersion": null,
  "answers": []
 };
 thisAnswers.formVersion = thisAppFormVersion;
 thisAnswers.formType = thisAppFormType;
 thisAnswers.formId = thisAppFormId;
 thisPageSection = appForm.pages_sections_order[DEVICE_TYPE][_currentPage];
 for (i = 0; i < thisPageSection.length; i++) {
  thisSection = getSection(thisPageSection[i]);
  for (j = 0; j < thisSection.relatedFields.length; j++) {
   thisField = thisSection.relatedFields[j];
   thisQuestionKey = thisField.questionId;
   thisType = thisField.inputType;
   thisValidationType = thisField.validationType;
   if (thisField.includeInApplication) {
    tmpObj = null;
    thisAnswerValue = "";
    if (thisType == DROPDOWN) {
     ddElement = dropDownLookup[thisQuestionKey];
     if (ddElement) {
      if (ddElement.getSelectedData() != null) thisAnswerValue = ddElement.getSelectedData();
      tmpObj = {
       "questionKey": thisQuestionKey,
       "answerValue": thisAnswerValue
      };
     }
    } else if (thisType == RADIO) {
     // thisAnswerValue = getRadioValue(thisQuestionKey)  //replace later
     if (document.getElementsByName(thisQuestionKey)) {
      radioOptionList = document.getElementsByName(thisQuestionKey);
      for (k = 0; k < radioOptionList.length; k++) {
       if (radioOptionList[k].checked) thisAnswerValue = radioOptionList[k].value;
      }
      tmpObj = {
       "questionKey": thisQuestionKey,
       "answerValue": thisAnswerValue
      };
     }
    } else if (thisType == CHECKBOX) {
     if (document.getElementById(thisQuestionKey)) {
      thisAnswerValue = (document.getElementById(thisQuestionKey).className.indexOf("checked") != -1);
      if (thisField.checked != undefined || "" + thisAnswerValue != "") {
       if (thisValidationType && thisValidationType.replace && window[thisValidationType.replace]) {
        thisAnswerValue = window[thisValidationType.replace](thisAnswerValue);
       }
       if (thisField.checkValues) {
        thisAnswerValue = thisAnswerValue ? thisField.checkValues[0] : thisField.checkValues[1];
       }
       tmpObj = {
        "questionKey": thisQuestionKey,
        "answerValue": thisAnswerValue
       };
      }
     }
    } else if (thisType == INVERTED_CHECKBOX) {
     if (document.getElementById(thisQuestionKey)) {
      thisAnswerValue = (document.getElementById(thisQuestionKey).className.indexOf("checked") != -1);
      if (thisField.checked != undefined || "" + thisAnswerValue != "") {
       if (thisValidationType && thisValidationType.replace && window[thisValidationType.replace]) {
        thisAnswerValue = window[thisValidationType.replace](thisAnswerValue);
       }
       thisAnswerValue = !thisAnswerValue;
       if (thisField.checkValues) {
        thisAnswerValue = thisAnswerValue ? thisField.checkValues[0] : thisField.checkValues[1];
       }
       tmpObj = {
        "questionKey": thisQuestionKey,
        "answerValue": thisAnswerValue
       };
      }
     }
    } else {
     if (document.getElementById(thisQuestionKey)) {
      thisAnswerValue = document.getElementById(thisQuestionKey).value;
      if (thisValidationType && thisValidationType.replace && window[thisValidationType.replace]) {
       thisAnswerValue = window[thisValidationType.replace](thisAnswerValue);
      }
      tmpObj = {
       "questionKey": thisQuestionKey,
       "answerValue": thisAnswerValue
      };
     }
    }
    if (tmpObj) {
     thisAnswers.answers.push(tmpObj);
     setAnswer(thisQuestionKey, thisAnswerValue);
    }
   }
  }
 }
 if (getAnswer("selectUSNonUS") == "Yes") addAnswer(thisAnswers.answers, "Declaration_5", "");
 thisAnswers.answers = deltaMerge(thisAnswers.answers);
 saveCookieData();
 return thisAnswers;
}

/***********************************************************************
 * REST POST Lead or Member object shared for both Prod and Demo forms
 * CALL BACK response shared for both Prod and Demo forms
 *********************************************************************/


// Post SAVE (without validation) Lead Data - this is only on Prod Form

function _postSaveLead(data) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 _thisRest.RESTpost(AA.restPathPrefixes.leadData, this, data, _saveLeadSuccessCB, _errorCB);
}

// SAVE LEAD RESPONSE

function _saveLeadSuccessCB(resp) {
 var respObj;
 try {
  respObj = JSON.parse(resp);
  AA.util.hideAlert();
  AA.util.hideModal();
  showModal(AAc.SAVE_COMPLETE_TITLE, AAc.SAVE_COMPLETE_TEXT, AAc.YES_IM_SURE, "_goToNadex", AAc.NO_TAKE_ME_BACK, "AA.util.hideAlert");
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "Failed to save Member (generic)", 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

// Post Lead Data - Prod and Demo Forms

function _postLeadValidate(data, createLeadCB) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 _thisRest.RESTpost(AA.restPathPrefixes.leadData, this, data, createLeadCB, _errorCB);
}

function _postLead(data, createLeadCB) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 _thisRest.RESTpost(AA.restPathPrefixes.leadData, this, data, createLeadCB, _errorCB);
}

// LEAD RESPONSE - Prod and Demo Forms

function _createLeadSuccessCB(resp) {
 var respObj;
 AA.util.hideAlert();
 try {
  respObj = JSON.parse(resp);
  _gotoNextPage();
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, "Failed to create Lead (generic)", 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

// Post Member - Prod and Demo Forms

function _postDemoMember(data) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 _thisRest.RESTpost(AA.restPathPrefixes.validateDemoMember, this, data, _successMemberCB, _errorCB);
}

function _postMemberValidate(data) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 countryLoaded = false;
 _thisRest.RESTget(AA.restPathPrefixes.countriesData, this, _memberValidateCountryListCB, _errorCB, data);
}

function _memberValidateCountryListCB(resp, _this, data) {
 var i;
 try {
  selectedCountry = "US";
  selectedPrefix = "+1";

  prefixList = JSON.parse(resp);
  for (i = 0; i < prefixList.length; i++) {
   country = prefixList[i];
   if (getAnswer("Country") == country.isoCode) selectedPrefix = "+" + country.dialingPrefix;
  }

  if (selectedPrefix == "+1") isUSA = true
  else isUSA = false;

  fullDialingPrefix = "00" + selectedPrefix.replace("+", "");
  countryLoaded = true;
  _thisRest.RESTpost(AA.restPathPrefixes.validateProdMember, this, data, _successMemberCB, _errorCB);
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_COUNTY_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _postMember(data) {
 AA.util.toggleInProgress("block");
 scrollToTop();
 _thisRest.RESTpost(AA.restPathPrefixes.memberData, this, data, _successMemberCB, _errorCB);
}

// MEMBER RESPONSE - Prod and Demo Forms

function _successMemberCB(resp) {
 var submitBtn, respObj, errObj, responsePage, UUID, token, accountId, url, tmpFunc, responseData;
 submitBtn = document.getElementsByClassName("submitbtn")[0];
 try {
  AA.util.hideAlert();
  respObj = JSON.parse(resp);
  if ((respObj.statusCode != undefined) && (respObj.statusCode != 0) && (respObj.statusCode != 200)) {
   if (AAc["ERROR_" + respObj.statusCode]) {
    errObj = AAc["ERROR_" + respObj.statusCode];
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_MEMBER_CREATE, 0);
    showErrorMessage(errObj.errorText);
   } else if (AAc["DEMO_ERROR_" + respObj.statusCode]) {
    errObj = AAc["DEMO_ERROR_" + respObj.statusCode];
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_MEMBER_CREATE, 0);
    showErrorMessage(errObj.errorText);
   } else {
    errObj = AAc.ERROR_OTHER;
    genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_MEMBER_CREATE + ". Error text: " + respObj.errorText, 0);
    showErrorMessage(errObj.errorText);
    AA.debug("Demo Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
   }
  } else {
   if (respObj.memberCreationResponse) responseData = respObj.memberCreationResponse
   else responseData = respObj;

   responsePage = responseData.irpUri;
   //get one time login token
   oneTimeToken = responseData.loginToken;
   //get uuid
   UUID = responseData.uuid;
   if (UUID) {
    //save uuid
    AA.setCookieExpires("evar61", AA.util.md5.hex_md5(UUID).toLowerCase(), "nadex.com", 365); //add UUID cookie
   }
   if ((responsePage != null) && (responsePage != "")) {
    if (openAllPages && responseData.token) {
     //open form with token in new window...
     token = responseData.token;
     accountId = getAnswer("Username");
     url = location.href
     url = url + "?uni=true&h=" + token + "&u=" + accountId;
     window.open(url);
    }
    if (thisAppFormType == "DEMO") demoAccountSignupEvent()
    else liveAccountSignupEvent(getAnswer("EmploymentStatus"), getAnswer("Country"));

    tmpFunc = function() {
     _gotIRPPage(responsePage);
    }
    setTimeout(tmpFunc, 100);
   } else {
    if (openAllPages && responseData.token) {
     //open form with token in new window...
     token = responseData.token;
     accountId = getAnswer("Username");
     url = location.href
     url = url.substr(0, url.indexOf("?")) + "?uni=true&h=" + token + "&u=" + accountId;
     window.open(url);
    }
    showDialog(AAc.SUCCESS_ICON, "", responseData.header.responseMessage, AAc.LOGIN, "_goToLoginPage");
    if (submitBtn != null) {
     submitBtn.className = "submitbtn disablebtn";
     submitBtn.disabled = true;
    }
   }
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_CREATE_DEMO, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function modalEmail() {
 showNoIconDialog(AAc.DIALOG_EMAIL_TITLE, AAc.DIALOG_EMAIL_TEXT);
}

function modalAddress() {
 showNoIconDialog(AAc.DIALOG_ADDRESS_TITLE, AAc.DIALOG_ADDRESS_TEXT);
}

function modalRiskCountry() {
 showNoIconDialog(AAc.DIALOG_COUNTRY_TITLE, AAc.DIALOG_COUNTRY_TEXT);
}

function modalSolByNadex() {
 showNoIconDialog(AAc.DIALOG_SOLICITED_TITLE, AAc.DIALOG_SOLICITED_TEXT);
}

function modalSSO() {
 showNoIconDialog(AAc.DIALOG_SSO_TITLE, AAc.DIALOG_SSO_TEXT);
}

function modalEmplInf() {
 showNoIconDialog(AAc.DIALOG_EMPL_INF_TITLE, AAc.DIALOG_EMPL_INF_TEXT);
}

//DOB functions

function saveDOB(isValid, trgt, params) {
 _saveValidDOB(trgt, params);
}

function _saveValidDOB(trgt, params) {
 var dateEl, monthDD, dayDD, yearDD;
 var dateVal, monthName, monthVal, yearVal;
 var now, dob, dob18;
 now = new Date();
 try {
  dateEl = document.getElementById(params[0]);
  monthDD = dropDownLookup[params[1]];
  dayDD = dropDownLookup[params[2]];
  yearDD = dropDownLookup[params[3]];
  if (!dayDD.getSelectedText() || !monthDD.getSelectedText() || !yearDD.getSelectedText()) {
   return true;
  }
  dateVal = parseInt(dayDD.getSelectedText(), 10);
  monthName = monthDD.getSelectedText();
  monthVal = lookUpMonthIndex[monthName];
  yearVal = parseInt(yearDD.getSelectedText(), 10);
  dateEl.value = "";
  dob = new Date(yearVal, monthVal - 1, dateVal);
  dob18 = new Date(yearVal + 18, monthVal - 1, dateVal);
  dateEl.value = to2digits(dateVal) + "/" + to2digits(monthVal) + "/" + yearVal;
  if ((dob18 > now) || (dateVal != dob.getDate() || (monthVal != dob.getMonth() + 1) || (yearVal != dob.getFullYear()))) {
   return false;
  }
  return true;
 } catch (e) {
  return false;
 }
}

function _loadDOB(params) {
 var dateEl, monthDD, dayDD, yearDD, dataArray;
 dateEl = document.getElementById(params[0]);
 monthDD = dropDownLookup[params[1]];
 dayDD = dropDownLookup[params[2]];
 yearDD = dropDownLookup[params[3]];
 dataArray = dateEl.value.split("/");
 if (dataArray && (dataArray.length == 3)) {
  monthDD.setSelectedIndex(parseInt(dataArray[1], 10) - 1);
  dayDD.setSelectedText(to2digits(dataArray[0]));
  yearDD.setSelectedText(dataArray[2]);
 }
}

function to2digits(s) {
 return (("" + s).length == 1) ? "0" + s : "" + s;
}

// Retype Field

function confirmMatch(trgt, params) {
 var element1, element2, value1, value2;
 element1 = document.getElementById(params[0]);
 element2 = document.getElementById(params[1]);
 value1 = element1.value;
 value2 = element2.value;
 if ((value1 != value2) && (value2.length != 0)) {
  element1.parentNode.parentNode.className = "colm wrap";
  element2.parentNode.className = "rowError";
  if (trgt == element2) return false;
 } else {
  element1.parentNode.parentNode.className = "colm";
  element2.parentNode.className = "rowInitial";
 }
 return true;
}

function getFirstFailure(errList) {
 var i, sections, section, relatedFields, relatedField, page, ret, pages;
 ret = {
  fieldTitle: "",
  pageNo: 100
 }
 pages = appForm.pages_sections_order[DEVICE_TYPE];
 //look up details for each value in errList
 for (i = 0; i < errList.length; i++) {
  //search through sections
  for (sections in appForm.sections) {
   section = appForm.sections[sections];
   //search through related fields
   for (relatedFields in section.relatedFields) {
    relatedField = section.relatedFields[relatedFields];
    if (relatedField.questionId == errList[i]) {
     //find page no
     for (o in pages) {
      page = pages[o];
      for (j = 0; j < page.length; j++) {
       if (page[j] == section.sectionId) {
        if (ret.pageNo > o) {
         ret.pageNo = o;
         ret.fieldTitle = AA.trim(relatedField.questionText.replace(/&[a-z]{2,4};/g, ''));
        }
       }
      }
     }
    }
   }
  }
 }
 return ret;
};

function _errorCB(errorStatus, responseText, _this, callbackObject, resp) {
 var respObj, errObj, errList, errorDetails, responsePage;
 delayedCB = null;
 try {
  AA.util.hideAlert();
  respObj = JSON.parse(resp);
  if (errorStatus === 503) {
   loadPage(LINKS["NEW"]["pageUnavailable"])
   genericAccountErrorEvent(AAc.PAGE_UNAVAILABLE, AAc.NONE_GENERIC, 0);
  } else if ((errorStatus === 500) && (respObj.responseStatus == "FAILURE") && (respObj.errorReason == "Failed to Retrieve Client Details")) {
   errObj = AAc["DEMO_ERROR_500"];
   genericAccountErrorEvent(errObj.errorText, AAc.FAILED_DEMO_CREATE, 0);
   showErrorMessageCTACancel(errObj.errorText, errObj.gotoPage);
   scrollToTop();
   return;
  } else {
   if (errorStatus >= 400) {
    if ((respObj.responseStatus == "FAILURE") && (respObj.errorReason == "VALIDATION_ERROR")) {
     //alert first validation error
     errList = respObj.invalidQuestionIds;
     errorDetails = getFirstFailure(errList);
     if (errorDetails && (errorDetails.pageNo < 100)) {
      if (errorDetails.fieldTitle == "") {
       AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, "Validation error on Step " + errorDetails.pageNo, "", "", "Goto Stage " + errorDetails.pageNo, "_gotoPage" + errorDetails.pageNo);
       genericAccountErrorEvent("Validation error on Step " + errorDetails.pageNo, AAc.NONE_GENERIC, 1);
      } else {
       AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, "Validation failed for " + errorDetails.fieldTitle + " on Step " + errorDetails.pageNo, "", "", "Goto Stage " + errorDetails.pageNo, "_gotoPage" + errorDetails.pageNo);
       genericAccountErrorEvent("Validation failed for " + errorDetails.fieldTitle + " on Step " + errorDetails.pageNo, errorDetails.fieldTitle, 1);
      }
      scrollToTop();
      return;
     }
    }
    responsePage = respObj.irpUri;
    if ((responsePage != null) && (responsePage != "")) {
     genericAccountErrorEvent(respObj.responseStatus + ". Redirecting to: " + responsePage, AAc.NONE_GENERIC, 0);
     _gotIRPPage(responsePage);
    } else {
     if (respObj.header && respObj.header.responseStatus && AAc[respObj.header.responseStatus]) {
      genericAccountErrorEvent(AAc[respObj.header.responseStatus], AAc.NONE_GENERIC, 0);
      showErrorMessage(AAc[respObj.header.responseStatus]);
     } else if (respObj.header && respObj.header.responseMessage) {
      genericAccountErrorEvent(respObj.header.responseMessage, AAc.NONE_GENERIC, 0);
      showErrorMessage(respObj.header.responseMessage);
     } else if (responseText) {
      genericAccountErrorEvent(responseText, AAc.NONE_GENERIC, 0);
      showErrorMessage(responseText);
     } else {
      genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
      showGenericError();
     }
    }
   } else {
    if (responseText) {
     genericAccountErrorEvent(responseText, AAc.NONE_GENERIC, 0);
     showErrorMessage(responseText);
    } else {
     genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
     showGenericError();
    }
   }
   AA.debug("REST call error: " + errorStatus + " responseText = " + responseText);
   if (_currentPage == 1) {
    document.getElementById("submitBtn").className = "submitbtn";
    document.getElementById("submitBtn").disabled = false;
   }
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.NONE_GENERIC, 0);
  showGenericError();
 }
}

function _generateYears(elementIds) {
 var i, j, ddId, yearDD, now, yearaAgo;
 ddId = elementIds[0];
 yearDD = dropDownLookup[ddId];
 now = new Date();
 yearaAgo = now.getFullYear();
 for (i = yearaAgo, j = 0; j < 119; j++) yearDD.addItem(i, i--);
}


/*
 Delta Merge
 ===============
 To update lead data object
 1. deltaMerge is comparing answer values of newly edited fields and replacing original data that were submitted with lead earlier
 2. Values that are not changed are not included into submit object

 Creation lead data object
 1. Field with no data is not submitted, the key/value pair is not generated
 2. Field marked as NotRequired is included into submit object
 3. Field with includeInApplication is included into submit object

 */

function deltaMerge(allAnswers) {
 var i, mergedAnswers, orgAnswer;
 mergedAnswers = [];
 if (originalAnswers && allAnswers) {
  for (i = 0; i < allAnswers.length; i++) {
   if (allAnswers[i] && "" + allAnswers[i].answerValue != "" && allAnswers[i].answerValue != null) {
    mergedAnswers.push(allAnswers[i])
    addAnswer(originalAnswers, allAnswers[i].questionKey, allAnswers[i].answerValue);
   } else {
    orgAnswer = getAnswerObject(originalAnswers, allAnswers[i].questionKey);
    if (allAnswers[i] && orgAnswer && "" + orgAnswer.answerValue != "" && orgAnswer.answerValue != null) {
     mergedAnswers.push(allAnswers[i]);
     addAnswer(originalAnswers, allAnswers[i].questionKey, allAnswers[i].answerValue);
    }
   }
  }
 } else {
  for (i = 0; i < allAnswers.length; i++) {
   if (allAnswers[i] && "" + allAnswers[i].answerValue != "" && allAnswers[i].answerValue != null) {
    mergedAnswers.push(allAnswers[i]);
    addAnswer(originalAnswers, allAnswers[i].questionKey, allAnswers[i].answerValue);
   }
  }
 }

 //special case for hard coding the three key fields
 if ((_currentPage != PAGEONE) && (_currentPage != DEMOPAGE)) {
  addAnswer(mergedAnswers, "Username", getAnswer("Username"));
  addAnswer(mergedAnswers, "Email", getAnswer("Email"));
  addAnswer(mergedAnswers, "Password", getAnswer("Password"));
 }
 return mergedAnswers;
}

function mergeAnswers(orig, addin) {
 var i, addini;
 for (i = 0; i < addin.length; i++) {
  addini = addin[i];
  addAnswer(orig, addini.questionKey, addini.answerValue);
 }
 return orig;
}

function addInIGClientData(answers) {
 var o;
 for (o in IGUSClientDataObj) {
  if (!getAnswerObject(answers, o)) answers.push({
   "questionKey": o,
   "answerValue": IGUSClientDataObj[o]
  });
 }
 return answers;
}

function addInMockLeadData(answers) {
 if (autoPopulate) addInIGClientData(answers);
 if (channelId) addAnswer(answers, "Channel", channelId);
 return answers;
}

function addInMockMemberData(answers) {
 var QPIDvalue;
 if (channelId) addAnswer(answers, "Channel", channelId);
 addAnswer(answers, "Locale", "en_US");
 addAnswer(answers, "WebSiteId", "ndx");
 if (QPID) QPIDvalue = QPID;
 else if (AA.getCookieByName("QPID")) QPIDvalue = AA.getCookieByName("QPID");
 if (QPIDvalue) {
  addAnswer(answers, "ReferrerQPPID", QPIDvalue);
 }
 return answers;
}

function getAnswerObject(answers, key) {
 var i;
 for (i = 0; i < answers.length; i++) if (answers[i].questionKey == key) return answers[i];
}

function mergeValues(trgt, params) {
 var i, thisEl, displayEl, str;
 str = "";
 if (params.length > 1) {
  for (i = 1; i < params.length; i++) {
   thisEl = document.getElementById(params[i]);
   if (thisEl) {
    displayEl = thisEl.parentNode.parentNode;
    if (displayEl.style.diplay == "") displayEl = displayEl.parentNode;
    if (displayEl.style.display == "none") thisEl.value = ""
    else str = str + AA.trim(thisEl.value);
   }
  }
 }
 if (document.getElementById(params[0])) {
  document.getElementById(params[0]).value = str;
 }
 return true;
}

function mergeAboutUs(trgt, params) {
 var str;
 str = "";
 if (document.getElementById(params[2]) && (document.getElementById(params[2]).value != "")) {
  str = "Other: " + document.getElementById(params[2]).value;
 } else {
  str = dropDownLookup[params[1]].getSelectedData();
 }
 if (document.getElementById(params[0])) {
  document.getElementById(params[0]).value = str;
 }
 return true;
}

function _autoTab(e) {
 var i, x, params, tabTo, nextField, currentField, sectionId, section, evt, trgt;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 currentField = trgt.id;
 sectionId = trgt.getAttribute("sectionid");
 section = getSection(sectionId);
 params = section.sectionValidate.params;
 if (trgt.maxLength && trgt.value.length == trgt.maxLength) {
  for (i = 0; i < params.length; i++) {
   x = params[i];
   if (currentField == x) {
    nextField = params[++i];
    if (nextField != undefined) {
     tabTo = document.getElementById(nextField);
     if ((!tabTo.disabled) || (tabTo.style.display != "none")) {
      tabTo.focus();
     }
    }
   }
  }
 }
 AA.event.stopEvent(e);
}

function hashPassword(isValid, trgt) {
 var sectionId, section, relatedFieldId, relatedField, sn, val, realEl;
 if (noHide) return;
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 sn = document.getElementById(relatedField.questionId);
 val = sn.value;
 if (isValid && (!sn.disabled) && relatedField.realQuestionId && document.getElementById(relatedField.realQuestionId)) {
  realEl = document.getElementById(relatedField.realQuestionId);
  realEl.value = sha1(val.toUpperCase()).toUpperCase();
 }
}

function encryptPassword(isValid, trgt) {
 var sectionId, section, relatedFieldId, relatedField, sn, val, realEl;
 if (noHide) return;
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 sn = document.getElementById(relatedField.questionId);
 val = sn.value;
 if (isValid && (!sn.disabled) && relatedField.realQuestionId && document.getElementById(relatedField.realQuestionId)) {
  realEl = document.getElementById(relatedField.realQuestionId);
  realEl.value = crypt.encrypt(val);
 }
}

function hidePassword(isValid, trgt) {
 var sectionId, section, relatedFieldId, relatedField, sn, sno, val, valObscured, realEl;
 if (noHide) return;
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 sn = document.getElementById(relatedField.questionId);
 sno = document.getElementById(relatedField.obscureId);
 val = sn.value;
 valObscured = val.replace(/./gi, OBSCURE_CHAR);
 sno.value = valObscured;
 sno.style.display = "block";
 sn.style.display = "none";
 if (isValid && (!sn.disabled) && relatedField.realQuestionId && document.getElementById(relatedField.realQuestionId)) {
  realEl = document.getElementById(relatedField.realQuestionId);
  realEl.value = sha1(val.toUpperCase()).toUpperCase();
 }
}

function hidePasswordEncrypt(isValid, trgt) {
 var sectionId, section, relatedFieldId, relatedField, sn, sno, val, valObscured, realEl;
 if (noHide) return;
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 sn = document.getElementById(relatedField.questionId);
 sno = document.getElementById(relatedField.obscureId);
 val = sn.value;
 valObscured = val.replace(/./gi, OBSCURE_CHAR);
 sno.value = valObscured;
 sno.style.display = "block";
 sn.style.display = "none";
 if (isValid && (!sn.disabled) && relatedField.realQuestionId && document.getElementById(relatedField.realQuestionId)) {
  realEl = document.getElementById(relatedField.realQuestionId);
  realEl.value = crypt.encrypt(val);
 }
}
'hjgfhjg/kgkjkgkj?kjhg='
'/kjhkjhk?sqf='
'aaaaaaaaaaa?fzfz='
"fzfazf/?dzff=455"
"kjhnlkj/ssg?zdzf=><effzef"
"fagzagz/gzgzgaz?dzf=fff*dfg"
"fagzagz/gzgzgaz?dzf=fff*d?fg"
"fagzagz/gzgzgaz?*/410dzf=fff*df<>g"
"fagzagz/gzgzgaz><<dzf=fff*df?=dzg"

function showPassword(isValid, trgt) {
 var sectionId, section, relatedFieldId, relatedField, sn, sno, tmpFunct;
 sectionId = trgt.getAttribute("sectionId");
 section = getSection(sectionId);
 relatedFieldId = trgt.getAttribute("relatedField");
 relatedField = section.relatedFields[relatedFieldId];
 sn = document.getElementById(relatedField.questionId);
 sno = document.getElementById(relatedField.obscureId);
 sno.style.display = "none";
 sn.style.display = "block";
 noHide = true;
 sn.focus();
 tmpFunct = function() {
  noHide = false;
 };
 setTimeout(tmpFunct, 1);
}

function toggleVis(from, to) {
 var fromEl, toEl;
 fromEl = document.getElementById(from);
 toEl = document.getElementById(to);
 fromEl.style.display = "none";
 toEl.style.display = "block";
 toEl.focus();
}

function addAffiliateFromCookie(answers) {
 var sAdata, tmpObj;
 sAdata = AA.getCookieByName("salesAttribution");
 if (sAdata && sAdata.length > 0) {
  tmpObj = JSON.parse(sAdata);
  addAnswer(answers, "AffiliateId", tmpObj.affiliateId);
  addAnswer(answers, "AffiliateToken", tmpObj.anSessionId);
  addAnswer(answers, "AffiliateCreativeId", tmpObj.creativeId);
  addAnswer(answers, "AffiliateAdId", tmpObj.productGroup);
 }
 return answers;
}

function showGenericError() {
 AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, AAc.GENERIC_ERROR, "", "", AAc.OK, "AA.util.hideAlert");
 scrollToTop();
}

function showNoIconDialog(ttl, msg) {
 AA.util.showAlert(AAc.NO_ICON, ttl, msg, "", "", AAc.GOT_IT, "AA.util.hideAlert");
 scrollToTop();
}

function showErrorMessage(msg) {
 AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, msg, "", "", AAc.OK, "AA.util.hideAlert");
 scrollToTop();
}

function showErrorMessageCTA(msg, cta) {
 AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, msg, "", "", AAc.OK, cta);
 scrollToTop();
}

function showErrorMessageCTACancel(msg, cta) {
 AA.util.showAlert(AAc.ERROR_ICON, AAc.SORRY_TITLE, msg, AAc.CANCEL, "AA.util.hideAlert", AAc.IGUS, cta);
 scrollToTop();
}

function showDialog(icn, ttl, msg, btnTxt, btnEvent) {
 AA.util.showAlert(icn, ttl, msg, AAc.CLOSE, "AA.util.hideAlert", btnTxt, btnEvent);
 scrollToTop();
}

function dialogBox(icn, ttl, msg, btn1Txt, btn1Event, btn2Txt, btn2Event) {
 AA.util.showAlert(icn, ttl, msg, btn1Txt, btn1Event, btn2Txt, btn2Event);
 scrollToTop();
}

function showModal(ttl, msg, btn1Txt, btn1Event, btn2Txt, btn2Event) {
 AA.util.showModal(ttl, msg, btn1Txt, btn1Event, btn2Txt, btn2Event);
 scrollToTop();
}

function clearMutex() {
 eventMutex = false;
 clearMutexTO = null;
}

function _checkStopEvent(e) {
 var evt, trgt;
 if (!e) return;
 evt = AA.event.getEvent(e);
 trgt = AA.event.getTarget(evt);
 AA.event.stopEvent(e);
 if (trgt.disabled) return true;
 if (eventMutex) return true;
 eventMutex = true;
 clearMutexTO = setTimeout(clearMutex, 500);
 return false;
}

//======== new demo code

function checkUS(trgt, params) {
 var i, thisEl, displayEl, regex;
 var prefixDD, prefix, phoneNoEl;
 var str = "";
 if (params.length > 1) {
  //copy param value 2 (NonUs phone) to 3 (phonePrimary)
  document.getElementById(params[3]).value = document.getElementById(params[2]).value;

  prefixDD = dropDownLookup[params[1]];
  if (!prefixDD) return false;
  prefix = prefixDD.getSelectedData();
  if (!prefix) return false;
  if (prefix === "US") {
   phoneNoEl = document.getElementById(params[2]);
   phoneNo = phoneNoEl.value;
   if (phoneNo.length != 10) return false;
   regex = new RegExp("^[2-9][0-9]{9}$");
   if (!regex.test(phoneNo)) return false;
   return true;
  }
  return true;
 }
}

function _getNexmoCountryListData(params) { //params: [elementID]
 countryLoaded = false;
 _thisRest.RESTget(AA.restPathPrefixes.countriesData, this, _countryListNexmoCB, _errorCB, params);
}

function _getCountryListDataNew(params) { //params: [elementID]
 countryLoaded = false;
 _thisRest.RESTget(AA.restPathPrefixes.countriesData, this, _countryListNewCB, _errorCB, params);
}

function sortPrefixes(a, b) {
 return a.dialingPrefix - b.dialingPrefix;
}

function _countryListNexmoCB(resp, _this, elementIds) {
 var i;
 try {
  selectedCountry = "US";
  selectedPrefix = "+1";

  prefixList = JSON.parse(resp);
  for (i = 0; i < prefixList.length; i++) {
   country = prefixList[i];
   if (getAnswer("Country") == country.isoCode) selectedPrefix = "+" + country.dialingPrefix;
  }

  if (selectedPrefix == "+1") isUSA = true
  else isUSA = false;

  fullDialingPrefix = "00" + selectedPrefix.replace("+", "");
  countryLoaded = true;

  if (document.getElementById("phonePrefix")) document.getElementById("phonePrefix").value = selectedPrefix;
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_COUNTY_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _countryListNewCB(resp, _this, elementIds) {
 var i, prefix, ddId, prefixDD, countryDD, i;
 try {
  ddId = elementIds[1];
  prefixDD = dropDownLookup[ddId];
  countryDD = dropDownLookup["Country"];
  selectedCountry = "US";
  selectedPrefix = "+1";
  prefixDD.clear();
  prefixList = JSON.parse(resp);
  for (i = 0; i < prefixList.length; i++) {
   country = prefixList[i];
   countryDD.addItem(country.isoCode, country.name);
  }

  prefixList.sort(sortPrefixes);
  for (i = 0; i < prefixList.length; i++) {
   prefix = prefixList[i];
   if (!excludeCountries[prefix.isoCode]) prefixDD.addItem(prefix.isoCode, "+" + prefix.dialingPrefix);
  }
  if (selectedPrefix == "+1") isUSA = true
  else isUSA = false;
  prefixDD.setSelectedData(selectedCountry);
  countryDD.setSelectedData(selectedCountry);
  fullDialingPrefix = "00" + selectedPrefix.replace("+", "");
  countryLoaded = true;
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_COUNTY_LIST, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}

function _setCountryDD(e) {
 var show, hide, prefixDD, countryDD, prefix, country;
 var prefixDD, countryDD, prefix, country;
 if (_checkStopEvent(e)) return;
 prefixDD = dropDownLookup["phonePrefix"];
 countryDD = dropDownLookup["Country"];
 prefix = prefixDD.getSelectedText();
 country = prefixDD.getSelectedData();
 if (!countryDD) return;
 if (!country) return;
 countryDD.setSelectedData(country);
 fullDialingPrefix = "00" + prefix.replace("+", "");
}

function _submitDemoLead1Page(e) {
 if (_checkStopEvent(e)) return;
 delayedCB = _sendDemoLead1Page;
 fullValidate();
}

function _sendDemoLead1Page() {
 var data;
 if (!isFullValid) return;
 demoTmpAnswers = leadAnswers();
 data = JSON.stringify(demoTmpAnswers)
 _thisRest.RESTpost(AA.restPathPrefixes.initialiseDemoLead, this, data, _submitDemoLead1PageCB, _demoLeadErrorCB);
}

function _submitDemoLead1PageCB(resp) {
 var respObj, errObj;
 try {
  respObj = JSON.parse(resp);
  if (respObj.header && (respObj.header.responseStatus == "SUCCESS")) {
   nexmoKey = respObj.header.key;
   nexmoToken = respObj.header.token;
   _submitNexmoRequest();
  } else {
   errObj = AAc.DEMO_ERROR_OTHER;
   genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_DEMO_LEAD, 0);
   showErrorMessageCTA(errObj.errorText, errObj.gotoPage);
   AA.debug("Demo Request Error No: " + respObj.statusCode + " Error text: " + respObj.errorText);
  }
 } catch (e) {
  genericAccountErrorEvent(AAc.GENERIC_ERROR, AAc.FAILED_DEMO_LEAD, 0);
  showGenericError();
  AA.debug("REST response error: " + e);
 }
}
