// Isolate our DOM Queries
let middleDiv = document.getElementById('middleDiv');
let bottomDiv = document.getElementById('bottomDiv');
let timer = document.getElementById('timer');
let progressDone = document.getElementById('progressDone');
let startBtn = document.getElementById("start");
let give_upBtn = document.getElementById('give-up'); 
let resetBtn = document.getElementById("reset");
let question = document.getElementById('question');
let yesBtn = document.getElementById('yes-giveUp');
let cancelBtn = document.getElementById('cancel-giveUp');
let btnGroup = document.getElementById('button-Group');
let submitBtn = document.getElementById('submit');
let clearBtn = document.getElementById('clearAllURLS');

// variables
let startingMins = 5;
let currentTime = startingMins * 60;
let counter;
let ifTimerOver;

// events
//middleDiv.addEventListener("mouseover", displayMinusPlus);
//middleDiv.addEventListener("mouseleave", hideMinusPlus);
give_upBtn.style.pointerEvents = 'none';
document.getElementById('minusImg').addEventListener("click", subtractToTimer);
document.getElementById("plusImg").addEventListener("click", addToTimer);
resetBtn.addEventListener("click", resetButton);
startBtn.addEventListener("click", startTimer);
give_upBtn.addEventListener("click", giveUpBtn);
yesBtn.addEventListener("click", yesGiveUp);
cancelBtn.addEventListener("click", cancelGiveUp);
document.getElementById('expandImg').addEventListener('click', displaySettings);
document.getElementById('collapseImg').addEventListener('click', closeSettings);

//``````````````````````call this when the popup is opened`````````````````
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
  console.log('popup opened');
  startingMins = response.startedMinutes;

  // timer started
  if (response.time < startingMins * 60) {
    hideMinusPlus();
    console.log('timer started and getting time from background.js');
    currentTime = response.time;
    const mins = Math.floor(currentTime / 60);
    let secs = currentTime % 60;
    secs = secs < 10 ? '0' + secs : secs;
    timer.innerHTML = `${mins}: ${secs}`;
    startBtn.style.pointerEvents = 'none';
    give_upBtn.style.pointerEvents = 'auto';
    startBtn.style.opacity = .50;
    submitBtn.style.pointerEvents = 'none';
    clearBtn.style.pointerEvents = 'none';
    document.getElementById('limitReached').classList.add('hidden');
    document.getElementById('incorrectFormat').classList.add('hidden');
    document.getElementById('alreadyExists').classList.add('hidden');
    document.getElementById('cantEdit').classList.remove('hidden');
    let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
    for (let i = 0; i < deleteURLButtons.length; i++) {
      let temp = deleteURLButtons[i];
      deleteURLButtons[i].style.pointerEvents = "none";
    }

    // timer started and reached 0 seconds, completed
    if (currentTime == 0 && response.timerOver == true) {
      timer.innerHTML = '0: 00';
      clearInterval(counter);
      give_upBtn.style.display = 'none';
      startBtn.style.display = 'none';
      resetBtn.style.display = 'inline-block';
      let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
      for (let i = 0; i < deleteURLButtons.length; i++) {
        let temp = deleteURLButtons[i];
        deleteURLButtons[i].style.pointerEvents = "auto";
      }

    // special cases
    } else {
      // user decided to give up and stop timer
      if (response.timerOver) {
        clearInterval(counter);
        resetButton();
        question.style.display = 'none';
        yesBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        submitBtn.style.pointerEvents = 'auto';
        clearBtn.style.pointerEvents = 'auto';
        document.getElementById('cantEdit').classList.add('hidden');
        let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
        for (let i = 0; i < deleteURLButtons.length; i++) {
          let temp = deleteURLButtons[i];
          deleteURLButtons[i].style.pointerEvents = "auto";
        }

      // timer is still going
      } else {
        console.log('doing interval');
        counter = setInterval(UpdateCountDown, 1000);
      }
    }
  // timer did not start
  } else {
    console.log('timer didnt start and getting time from background.js');
    currentTime = response.time;
    const mins = Math.floor(currentTime / 60);
    let secs = currentTime % 60;
    secs = secs < 10 ? '0' + secs : secs;
    timer.innerHTML = `${mins}: ${secs}`;
  } 
}) // end of GET_TIME call (popup opened)



//***************************Functions************************************

// method to display the settings interface
function displaySettings() {
  console.log('opened settings!!');
  document.getElementById('settingsDiv').classList.remove("hidden");
  document.getElementById('expandImg').classList.add("hidden");
  document.getElementById('collapseImg').classList.remove("hidden");
  document.getElementById('mainDiv').style.borderRadius = '10px 10px 0px 0px';
}

// method to close the settings interface
function closeSettings() {
  console.log('closed settings');
  document.getElementById('settingsDiv').classList.add("hidden");
  document.getElementById('collapseImg').classList.add("hidden");
  document.getElementById('expandImg').classList.remove("hidden");
  document.getElementById('mainDiv').style.borderRadius = '10px';
}

// method to start the timer 
function startTimer() {
  chrome.runtime.sendMessage({ cmd: 'START_TIMER', when: currentTime, strarting: startingMins });
  counter = setInterval(UpdateCountDown, 1000);
  startBtn.style.pointerEvents = 'none';
  give_upBtn.style.pointerEvents = 'auto';
  startBtn.style.opacity = .50;
  submitBtn.style.pointerEvents = 'none';
  clearBtn.style.pointerEvents = 'none';
  document.getElementById('limitReached').classList.add('hidden');
  document.getElementById('incorrectFormat').classList.add('hidden');
  document.getElementById('alreadyExists').classList.add('hidden');
  document.getElementById('cantEdit').classList.remove('hidden');
  hideMinusPlus();
  let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
  for (let i = 0; i < deleteURLButtons.length; i++) {
    let temp = deleteURLButtons[i];
    deleteURLButtons[i].style.pointerEvents = "none";
  }
}

// method that shows the Minus/Plus images
function displayMinusPlus() {
  document.getElementById("minusImg").classList.remove("hidden");
  document.getElementById("plusImg").classList.remove("hidden");
}

// method to not display the Minus/Plus images
function hideMinusPlus() {
  document.getElementById('minusImg').classList.add("hidden");
  document.getElementById('plusImg').classList.add("hidden");
}

// method to reduce the time of the timer by 5 mins
function subtractToTimer() {
  // if timer is at 5 mins, then user cant lower anymore
  if (startingMins == 5) {
    return;
  }
  // timer is not at 5 mins and user can lower timer
  startingMins -= 5;
  currentTime = startingMins * 60;
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  if (minutes < 100) {
    timer.style.fontSize = '55px';
  }
  timer.innerHTML = `${minutes}: ${seconds}`;
}

// method to add time to the timer by 5 mins
function addToTimer() {
  // timer can have a max of 120 minutes for starting minutes
  if (startingMins == 120) {
    return;
  }
  // timer is not at 120 starting mins and user can add more time to timer
  startingMins += 5;
  currentTime = startingMins * 60;
  let mins = Math.floor(currentTime / 60);
  let secs = currentTime % 60;
  secs = secs < 10 ? '0' + secs : secs;
  if (mins >= 100) {
    timer.style.fontSize = '48px';
  }
  timer.innerHTML = `${mins}: ${secs}`;
}

// method to update the timer when it has started
function UpdateCountDown() {

  currentTime--;
  const mins = Math.floor(currentTime / 60);
  let secs = currentTime % 60;
  secs = secs < 10 ? '0' + secs : secs;
  timer.innerHTML = `${mins}: ${secs}`;
  
  // code for progress bar
  let totalTime = startingMins * 60;                      // get total time
  let timePercent = Math.abs((currentTime/totalTime) - 1) * 100; // find time in percentage
  let timeInPixels = 200 * (roundTime(timePercent) / 100);  // convert time percentage in pixels (200 comes from the parent progress bar)
  progressDone.innerHTML = `${roundTime(timePercent)}%`;    // display percentage
  progressDone.style.width = `${timeInPixels}px`;           // update progress done bar
  console.log(currentTime);

  // timer is finished
  if (mins == 0 & secs == 0) {
    chrome.runtime.sendMessage({ cmd: 'STOP_TIMER' }, response => {
      // currentTime = response.time;
      // console.log(currentTime);
      console.log('timer finished')
    });
    clearInterval(counter);
    progressDone.innerHTML += ' Congrats!!';
    give_upBtn.style.display = 'none';
    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    console.log(currentTime);
    submitBtn.style.pointerEvents = 'auto';
    clearBtn.style.pointerEvents = 'auto';
    document.getElementById('cantEdit').classList.remove('hidden');
    let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
    for (let i = 0; i < deleteURLButtons.length; i++) {
      let temp = deleteURLButtons[i];
      deleteURLButtons[i].style.pointerEvents = "auto";
    }
  }
}

function roundTime(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return Math.round(m) / 100 * Math.sign(num);
}

// method when user clicks on the reset button, reset timer data
function resetButton() {
  startingMins = 5;
  currentTime = startingMins * 60;
  startBtn.style.opacity = 1;
  displayMinusPlus();
  resetBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  give_upBtn.style.display = 'inline-block';
  startBtn.style.pointerEvents = 'auto';
  give_upBtn.style.pointerEvents = 'none';
  progressDone.innerHTML = "";
  progressDone.style.width = '0px';
  timer.innerHTML = '5: 00';
  counter = null;
  submitBtn.style.pointerEvents = 'auto';
  clearBtn.style.pointerEvents = 'auto';
  document.getElementById('cantEdit').classList.add('hidden');
  //chrome.runtime.sendMessage({ cmd: 'STOP_TIMER', when: currentTime });
}

// method when user clicks on give up btn to display text/yes/cancel 
function giveUpBtn () {
  startBtn.style.display = 'none';
  give_upBtn.style.display = 'none';
  question.style.display = 'inline-block';
  yesBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
}

// method when user does want to give up and end timer
function yesGiveUp() {
  chrome.runtime.sendMessage({ cmd: 'STOP_TIMER' }, response => {
    currentTime = response.time;
    clearInterval(counter);
    resetButton();
    question.style.display = 'none';
    yesBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    let deleteURLButtons = document.querySelectorAll(".emojiDeleteURL");
    for (let i = 0; i < deleteURLButtons.length; i++) {
      let temp = deleteURLButtons[i];
      deleteURLButtons[i].style.pointerEvents = "auto";
    }
  });
}

// method when user decides not cancel the timer 
function cancelGiveUp() {
  question.style.display = 'none';
  yesBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  give_upBtn.style.display = 'inline-block';
}


