

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

// variables
let startingMins = 1;
let time = startingMins * 60;
let counter;

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

//***************************Functions************************************
function startTimer() {
  counter = setInterval(UpdateCountDown, 1000);
  //updatePixels = setInterval(updateProgressDonePixels(progressPixels))
  startBtn.style.pointerEvents = 'none';
  give_upBtn.style.pointerEvents = 'auto';
  startBtn.style.opacity = .50;
  hideMinusPlus();
}

function displayMinusPlus() {
  document.getElementById("minusImg").classList.remove("hidden");
  document.getElementById("plusImg").classList.remove("hidden");
}

function hideMinusPlus() {
  document.getElementById('minusImg').classList.add("hidden")
  document.getElementById('plusImg').classList.add("hidden");
}

function subtractToTimer() {
  if (startingMins == 5) {
    return;
  }
  startingMins -= 5;
  time = startingMins * 60;
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  if (minutes < 100) {
    timer.style.fontSize = '55px';
  }
  timer.innerHTML = `${minutes}: ${seconds}`;
}

function addToTimer() {
  if (startingMins == 120) {
    return;
  }
  startingMins += 5;
  time = startingMins * 60;
  let mins = Math.floor(time / 60);
  let secs = time % 60;
  secs = secs < 10 ? '0' + secs : secs;
  if (mins >= 100) {
    timer.style.fontSize = '48px';
  }
  timer.innerHTML = `${mins}: ${secs}`;
}


function UpdateCountDown() {

  time--;
  const mins = Math.floor(time / 60);
  let secs = time % 60;

  secs = secs < 10 ? '0' + secs : secs;

  timer.innerHTML = `${mins}: ${secs}`;
  
  let totalTime = startingMins * 60;                      // get total time
  let timePercent = Math.abs((time/totalTime) - 1) * 100; // find time in percentage
  let timeInPixels = 200 * (roundTime(timePercent) / 100);  // convert time percentage in pixels (200 comes from the parent progress bar)
  progressDone.innerHTML = `${roundTime(timePercent)}%`;    // display percentage
  progressDone.style.width = `${timeInPixels}px`;           // update progress done bar

  // timer is finished
  if (mins == 0 & secs == 0) {
    clearInterval(counter);
    progressDone.innerHTML += ' Congrats!!';
    give_upBtn.style.display = 'none';
    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
  }
}

function roundTime(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return Math.round(m) / 100 * Math.sign(num);
}

function resetButton() {
  startingMins = 1;
  time = startingMins * 60;
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
}

function giveUpBtn () {
  startBtn.style.display = 'none';
  give_upBtn.style.display = 'none';
  question.style.display = 'inline-block';
  yesBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'inline-block';
}

function yesGiveUp() {
  clearInterval(counter);
  resetButton();
  question.style.display = 'none';
  yesBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
}

function cancelGiveUp() {
  question.style.display = 'none';
  yesBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  give_upBtn.style.display = 'inline-block';
}


