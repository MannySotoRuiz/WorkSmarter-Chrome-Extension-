let startingMins = 5;
let currentTime = startingMins * 60;
let counter;
let ifTimerOver = true;
let originalURLs = [];
let blockedDomains = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === "STOP_TIMER") {
    stopTimer();
    sendResponse({ time: currentTime, timerOver: ifTimerOver });
    resetTime();
    console.log("background.js - stop timer");
  } else if (request.cmd === "START_TIMER") {
    currentTime = request.when;
    startingMins = request.strarting;
    storeCurrrentTime();
    storeStartingMins();
    startTimer();
    console.log("background.js - timer started");
  } else if (request.cmd === "GET_TIME") {
    sendResponse({
      time: currentTime,
      timerOver: ifTimerOver,
      startedMinutes: startingMins,
    });
    console.log("background.js - sending current time");
  } else if (request.cmd === "RESET_TIME") {
    clearInterval(counter);
    resetTime();
  } else if (request.cmd === "STORE_URL") {
    //let tempURL = new URL(request.link);
    let tempURL = request.link;
    storeURL(tempURL);
  } else if (request.cmd === "GET_DATA") {
    sendResponse({ link: blockedDomains });
  } else if (request.cmd === "CLEAR_URLs") {
    clearAllURLs();
  } else if (request.cmd === "DELETE_URL") {
    let del = request.link;
    deleteURL(del);
  } else if (request.cmd === "CONTENT_SCRIPT_INIT") {
    // is timer running
    sendResponse({
      time: currentTime,
      isRunning: !ifTimerOver,
    });
  }
  return true;
});

function attemptInject(tab, tabId) {
  let testURL = new URL(tab.url);
  // remove http:// https:// and www. from start of string
  let testDomain = testURL.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  // if url is in the blocked domains list
  console.log("should inject block?", {
    array: blockedDomains,
    host: testDomain,
  });
  if (blockedDomains.includes(testDomain)) {
    console.log("execute content script");
    chrome.scripting.executeScript({
      files: ["contentscript.js"],
      target: { tabId: tabId },
    });
  } else {
    console.log("blocked domain");
  }
}

// call this when URL of current tab is changed to see if contentscript.js needs to be injected or not
try {
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log(changeInfo, tab);
    if (changeInfo.status == "complete") {
      console.log("testing onUpdated");
      attemptInject(tab, tabId);
    }
  });
} catch (e) {
  console.log("Error with onUpdated");
  console.log(e);
}

// call this when the User changes tab and get the URL to see if contentscript.js needs to be injected or not
try {
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log("Tabs changed");
    getCurrentTab();
  });
} catch (e) {
  console.log("ERROR with onActivated");
  console.log(e);
}

///////////////   FUNCTIONS    /////////////////////////

function displayBlockerUI() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { isTimerOver: ifTimerOver },
      function (response) {
        console.log(response);
      }
    );
  });
}

function getCurrentTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    let tab_Id = tabs[0].id;
    try {
      attemptInject(tabs[0], tab_Id);
    } catch (e) {
      console.log("ERROR HAPPENED - " + e);
    }
  });
}

function reloadPage(userURL) {
  let givenURL = new URL(userURL);
  let givenDomain = givenURL.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  console.log(givenDomain);
  chrome.tabs.query({}, function(tabs) {
    for (let i = 0; i < tabs.length; i++) {
      let temp = new URL(tabs[i].url);
      let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
      if (tabs[i].active) {
        if (givenDomain == tempURL && blockedDomains.includes(tempURL)) {
          chrome.tabs.reload(tabs[i].id);
        }
      }
      // let temp = new URL(tabs[i].url);
      // let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
      // if (givenDomain == tempURL && blockedDomains.includes(tempURL)) {
      //   console.log("Current page is part of blocked domains so refresh");
      //   chrome.tabs.reload(tabs[i].id);
      // }
    }
  });
}

function timerEndedReloadPages() {
  chrome.tabs.query({}, function(tabs){
    for (let i = 0; i < tabs.length; i++) {
      let temp = new URL(tabs[i].url);
      let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
      if (blockedDomains.includes(tempURL)) {
        chrome.tabs.reload(tabs[i].id);
      }
    }
  });
}

function startTimer() {
  chrome.tabs.query({}, function(tabs) {
    counter = setInterval(UpdateCountDown, 1000);
    ifTimerOver = false;
    for (let i = 1; i < tabs.length; i++) {
      console.log(tabs[i]);
      // i decided to refresh the page if the current tab URL is part of the blocked domains
      // this way it also satisfies if the user has a separate window opened and the active tab of that 
      // separate window has a URL that is blocked. this would also refresh and have the blocker
      // only if the current tab is active not on the inactive tabs since switching tabs is listened 
      // with an event and that event will trigger the blocker if needed
      if (tabs[i].active) {
        let temp = new URL(tabs[i].url);
        let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
        if (blockedDomains.includes(tempURL)) {
          chrome.tabs.reload(tabs[i].id);
        }
      }
    }
  });
}

function stopTimer() {
  clearInterval(counter);
  ifTimerOver = true;
  counter = null;
  timerEndedReloadPages();
}

function resetTime() {
  startingMins = 5;
  currentTime = startingMins * 60;
  storeStartingMins();
  storeCurrrentTime();
  counter = null;
  clearLocalStorage();
}

function UpdateCountDown() {
  //getCurrentTime();
  currentTime--;
  storeCurrrentTime();
  getCurrentTime();
  const mins = Math.floor(currentTime / 60);
  let secs = currentTime % 60;
  if ((mins == 0) & (secs == 0)) {
    clearInterval(counter);
    ifTimerOver = true;
    timerEndedReloadPages();
  }
}

function storeURL(userURL) {
  let url = new URL(userURL);
  let testDomain = url.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  let check = false;
  for (let i = 0; i < blockedDomains.length; i++) {
    if (blockedDomains[i] == testDomain) {
      check = true;
      break;
    }
  }
  if (!check) {
    originalURLs.push(userURL);
    blockedDomains.push(testDomain);
    console.log("added url");
    //allTabs(testDomain);
    //reloadPage(userURL);
  }
}

function clearAllURLs() {

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let temp = new URL(tabs[0].url);
    let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    if (blockedDomains.includes(tempURL)) {
      console.log("Current page is part of blocked domains so refresh");
      chrome.tabs.reload(tabs[0].id);
    } else {
      console.log("Current page URL is not part of blocked domains, do nothing");
    }

    blockedDomains = [];
    originalURLs = [];
  });
}

function deleteURL(deleteURL) {
  let splitData = deleteURL.split("<");

  // when URL is deleted from User, we want to make sure that when the timer starts, the current tab URL is not
  // blocked with our content script so we refresh the page to delete
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let temp = new URL(tabs[0].url);
    let tempURL = temp.hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    if ((tempURL == splitData[0]) && (blockedDomains.includes(tempURL))) {
      console.log("Current page is part of blocked domains so refresh");
      chrome.tabs.reload(tabs[0].id);
    } else {
      console.log("Current page URL is not part of blocked domains, do nothing");
    }

    for (let i = 0; i < blockedDomains.length; i++) {
      let testDomain = blockedDomains[i];
      if (deleteURL.includes(testDomain)) {
        blockedDomains.splice(i, 1);
        break;
      }
    }
  });
}

function storeIfTimerStarted() {
  chrome.storage.sync.set({ timerStatus: ifTimerOver }, function () {
    console.log("ifTimerOver - " + ifTimerOver);
  });
}

function getIfTimerStarted() {
  chrome.storage.sync.get(["timerStatus"], function (data) {
    ifTimerOver = data.timerStatus;
    console.log(ifTimerOver);
  });
}

function storeCurrrentTime() {
  chrome.storage.sync.set({ localTime: currentTime }, function () {
    // console.log("storeCurrentTime - " + currentTime);
  });
}

function getCurrentTime() {
  chrome.storage.sync.get(["localTime"], function (data) {
    currentTime = data.localTime;
    // console.log("getCurrentTime - " + data.localTime);
  });
}

function storeStartingMins() {
  chrome.storage.sync.set({ localStartingMins: startingMins }, function () {
    // console.log("storeStartingMins - " + startingMins);
  });
}

function getStartingMins() {
  chrome.storage.sync.get(["localStartingMins"], function (data) {
    startingMins = data.localStartingMins;
    // console.log("getStartingMins - " + data.localStartingMins);
  });
}

function clearLocalStorage() {
  chrome.storage.local.clear(function () {
    let error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
}

function ifValidURL(site) {
  try {
    const url = new URL(site);
    return true;
  } catch (error) {
    console.log("INVALID URL");
    return false;
  }
}
