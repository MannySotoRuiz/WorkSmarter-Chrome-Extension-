if (typeof quotesOnline === "undefined") {
  const quotesOnline = [
    '"Focus on being productive instead of busy." --Tim Ferriss',
    '"The key is not to prioritize what\'s on your schedule, but to schedule your priorities." --Stephen Covey',
    '"Ordinary people think merely of spending time, great people think of using it." --Arthur Schopenhauer',
    '"Success is often achieved by those who don\'t know that failure is inevitable." --Coco Chanel',
    '"Don\'t wait. The time will never be just right." --Napoleon Hill',
    '"The way to get started is to quit talking and begin doing." --Walt Disney',
  ];

  console.log("script inject");

  // setup content blocker
  const initBlocker = () => {
    if (typeof init === "undefined") {
      const init = function () {
        // create and append css file
        const css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("type", "text/css");
        css.setAttribute("href", chrome.runtime.getURL("contentscript.css"));
        document.head.appendChild(css);
        console.log("Changed Content On This Page");
      };
      init();
      blockerUI();
      let timeInterval = setInterval(updateTime, 1000);
      document
        .getElementById("giveUpBtn")
        .addEventListener("click", displayPopup);
      document
        .getElementById("cancelBtn")
        .addEventListener("click", clickedCancel);
      document.getElementById("yesBtn").addEventListener("click", clickedYes);
    } else {
      console.log("Content Already Changed");
    }
  };

  var elementExist = document.querySelectorAll("#changeBackground");

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.isTimerOver) {
      console.log("timer is over/not on, dont change the content");
      try {
        document.getElementById("popupDiv").remove();
        document.getElementById("changeBackground").remove();
        document.getElementById("phraseDiv").remove();
        document.getElementById("imageDiv").remove();
        document.getElementById("timerDiv").remove();
        document.getElementById("giveUpDiv").remove();
        clearInterval(timeInterval);
      } catch (e) {
        console.log("ERROR");
      }
    } else {
      console.log("timer started so change the content");
      if (elementExist.length !== 0) {
        console.log("elementExits - stop");
      } else {
        initBlocker();
      }
    }
    sendResponse("t: " + JSON.stringify("request"));
    return true;
  });

  // check if timer running and show blocker
  chrome.runtime.sendMessage({ cmd: "CONTENT_SCRIPT_INIT" }, (response) => {
    const timerRunnnig = response.isRunning;
    console.log("check if timer", timerRunnnig, response);
    if (timerRunnnig) {
      initBlocker();
    }
  });

  function updateTime() {
    chrome.runtime.sendMessage({ cmd: "GET_TIME" }, (response) => {
      let currentTime = response.time;
      const mins = Math.floor(currentTime / 60);
      let secs = currentTime % 60;
      secs = secs < 10 ? "0" + secs : secs;
      let divToChangeTime = document.getElementById("timerDiv");
      divToChangeTime.innerHTML = `${mins}: ${secs}`;
    });
  }

  function blockerUI() {
    if (document.querySelectorAll(".blockContent").length !== 0) {
      console.log("stop here");
      return false;
    }

    console.log("block screen");
    // div for changing background
    const injectElement = document.createElement("div");
    //injectElement.className = "changeBackground";
    injectElement.classList = "blockContent";
    injectElement.id = "changeBackground";
    document.body.appendChild(injectElement);

    // div for phrase
    let randomQuote = Math.floor(Math.random() * quotesOnline.length);
    const phraseDiv = document.createElement("div");
    phraseDiv.classList = "blockContent";
    phraseDiv.id = "phraseDiv";
    phraseDiv.innerHTML = quotesOnline[randomQuote];
    document.body.appendChild(phraseDiv);

    // div for image
    const imageDiv = document.createElement("div");
    imageDiv.classList = "blockContent";
    imageDiv.id = "imageDiv";
    const holdImg = document.createElement("img");
    holdImg.id = "holdImg";
    let imgPath = chrome.runtime.getURL("images/neverGiveUp.png");
    holdImg.src = imgPath;
    imageDiv.appendChild(holdImg);
    document.body.appendChild(imageDiv);

    // div for timer
    const timerDiv = document.createElement("div");
    timerDiv.classList = "blockContent";
    timerDiv.id = "timerDiv";
    timerDiv.innerHTML = "5:00";
    document.body.appendChild(timerDiv);

    // div for giveUpBtn
    const giveUpDiv = document.createElement("div");
    giveUpDiv.classList = "blockContent";
    giveUpDiv.id = "giveUpDiv";
    let giveUpBtn = document.createElement("button"); // create button
    giveUpBtn.id = "giveUpBtn";
    giveUpBtn.innerHTML = "Give Up";
    giveUpDiv.appendChild(giveUpBtn);
    document.body.appendChild(giveUpDiv);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    // div for popup UI
    let popupDiv = document.createElement("div"); // popup div which holds the content for the popup
    popupDiv.classList = "blockContent";
    popupDiv.id = "popupDiv";
    let popupBackround = document.createElement("div"); // creating the background of the popup
    popupBackround.id = "popupBackground";

    let headerDiv = document.createElement("div"); // creating the header div for popup
    headerDiv.id = "headerDiv";
    let headerText = document.createElement("h3"); // creating header text h3 tag
    headerText.innerHTML = "Are You Sure to Give Up?";
    headerDiv.appendChild(headerText); // adding header text to header div
    popupBackround.appendChild(headerDiv); // adding the header to the popup background

    let riskDiv = document.createElement("div");
    riskDiv.id = "riskDiv";
    let riskTex = document.createElement("h4");
    riskTex.innerHTML = "This will put you at risk of distractions.";
    riskDiv.appendChild(riskTex);
    popupBackround.appendChild(riskDiv);

    let buttonsDiv = document.createElement("div"); // creating div that holds the yes/cancel btns
    buttonsDiv.id = "buttonsDiv";
    let cancelBtn = document.createElement("button"); // creating the cancel button
    cancelBtn.id = "cancelBtn";
    cancelBtn.innerHTML = "Cancel";
    let yesBtn = document.createElement("button"); // creating the cancel button
    yesBtn.id = "yesBtn";
    yesBtn.innerHTML = "Yes";
    buttonsDiv.appendChild(cancelBtn); // adding cancel btn to buttons div
    buttonsDiv.appendChild(yesBtn); // adding yes btn to buttons div
    popupBackround.appendChild(buttonsDiv); // adding buttons div to the popup

    popupDiv.appendChild(popupBackround); // adding the popup background with its content to the popup div
    document.body.appendChild(popupDiv); // adding the popup div to the body
    // end of popup div UI
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  } // end of blockerUI

  function displayPopup() {
    document.getElementById("changeBackground").style.backgroundColor =
      "rgba(0, 0, 0, 1)";
    document.getElementById("changeBackground").style.opacity = "0.95";
    document.getElementById("popupDiv").style.display = "flex";
  }

  function clickedCancel() {
    document.getElementById("popupDiv").style.display = "none";
    document.getElementById("changeBackground").style.backgroundColor =
      "rgba(0, 0, 0, 0.867)";
    document.getElementById("changeBackground").style.opacity = "0.7";
  }

  function clickedYes() {
    chrome.runtime.sendMessage({ cmd: "STOP_TIMER" }, (response) => {
      console.log("stopped timer from content script");
      // I tried using querySelectorAll(".blockContent") instead of lines 189-196 but won't work
      document.getElementById("popupDiv").remove();
      document.getElementById("changeBackground").remove();
      document.getElementById("phraseDiv").remove();
      document.getElementById("imageDiv").remove();
      document.getElementById("timerDiv").remove();
      document.getElementById("giveUpDiv").remove();
      clearInterval(timeInterval);
      console.log("completed deleting");
    });
  }
}
