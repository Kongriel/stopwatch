"use strict";

window.cancelRequestAnimFrame = (function () {
  return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;
})();

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
})();

window.mobileAndTabletcheck = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

document.addEventListener("DOMContentLoaded", () => {
  let anim = null;
  let isRunning = false;
  let startTime = null;
  let pausedTime = 0;
  let elapsedTime = 0;
  let messageTimeout = null;

  const clockWrapper = document.querySelector(".clock-wrapper");
  const clockEl = document.querySelector(".clock");
  const pointerEl = clockEl.querySelector(".clock__pointer");
  const svgEl = clockEl.querySelector("svg");
  const svgEllipse = svgEl.querySelector("ellipse");
  const timePlaceholderEl = document.querySelector(".clock-time");
  const resetBtnEl = document.querySelector('.clock-button[data-role="clock-reset"]');
  const startBtnEl = document.querySelector('.clock-button[data-role="clock-start-stop"]');
  const startBtnTextEl = startBtnEl.querySelector(".clock-button__text");

  // Select the container that holds the image (currently with class "hidden")
  const imageContainer = document.querySelector(".clock-wrapper > .hidden");

  const maxDashoffset = -90;

  // Helper: add leading zeros for minutes and seconds.
  const getFullValue = (val) => (val < 10 ? "0" + val : val);

  // Helper: format milliseconds as a three-digit string.
  const getFullMils = (val) => {
    if (val < 10) return "00" + val;
    if (val < 100) return "0" + val;
    return val;
  };

  // Main counter loop
  function startCounter(timestamp) {
    if (!startTime) startTime = timestamp;

    if (isRunning) {
      elapsedTime = timestamp - startTime - pausedTime;
      let dat = new Date(elapsedTime);
      let mins = dat.getMinutes();
      let secs = dat.getSeconds();
      let mils = dat.getMilliseconds();

      const angleBetweenSecs = 360 / 60;
      let angle = 360 * mins + angleBetweenSecs * secs + (angleBetweenSecs / 1000) * mils;

      // Rotate pointer
      pointerEl.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;

      // Format minutes and seconds for display
      mins = getFullValue(mins);
      secs = getFullValue(secs);

      // Stop the timer at 1 minute 20 seconds (80,000ms)
      if (elapsedTime >= 946000) {
        timePlaceholderEl.innerHTML = `${mins}:${secs}`;
        isRunning = false;
        clockEl.classList.remove("clock--started");
        startBtnEl.classList.remove("clock-button--pause");
        startBtnTextEl.innerHTML = "Reset";
        startBtnEl.style.display = "none"; // Hide the start/stop button
        window.cancelRequestAnimFrame(anim);
        return;
      } else {
        timePlaceholderEl.innerHTML = `${mins}:${secs},${getFullMils(mils)}`;
      }

      // Update SVG ring (if not on mobile)
      if (!window.mobileAndTabletcheck()) {
        let svgAngle = -90 + angle;
        svgEl.style.transform = `translate(-50%, -50%) rotate(${svgAngle}deg)`;
        let newOffset = -135 + (angle * 0.75) / 2;
        if (newOffset <= maxDashoffset) {
          svgEllipse.style.strokeDashoffset = newOffset + "%";
        }
      }
    } else {
      pausedTime = timestamp - startTime - elapsedTime;
    }
    anim = window.requestAnimFrame(startCounter);
  }

  // Reset button: resets everything and re-hides the image.
  resetBtnEl.addEventListener("click", () => {
    isRunning = false;
    startTime = null;
    pausedTime = 0;
    elapsedTime = 0;
    startBtnEl.classList.remove("clock-button--pause");
    startBtnTextEl.innerHTML = "Start";
    startBtnEl.style.display = "";
    pointerEl.style.transform = `translate(-50%, -100%) rotate(0)`;
    timePlaceholderEl.innerHTML = `00:00,000`;
    clockEl.classList.remove("clock--started");
    svgEl.style.transform = "";
    svgEllipse.style.strokeDashoffset = "";
    window.cancelRequestAnimFrame(anim);
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      messageTimeout = null;
    }
    // Re-add the "hidden" class to hide the image again
    imageContainer.classList.add("hidden");
  });

  // Start/Stop button: toggles the stopwatch.
  startBtnEl.addEventListener("click", () => {
    if (!isRunning) {
      isRunning = true;
      anim = window.requestAnimFrame(startCounter);
      clockEl.classList.add("clock--started");
      startBtnEl.classList.add("clock-button--pause");
      startBtnTextEl.innerHTML = "Pause";

      // Schedule removal of the "hidden" class after 2 minutes (120,000ms)
      messageTimeout = setTimeout(() => {
        imageContainer.classList.remove("hidden");
      }, 1860000);
    } else {
      isRunning = false;
      clockEl.classList.remove("clock--started");
      startBtnEl.classList.remove("clock-button--pause");
      startBtnTextEl.innerHTML = "Continue";
    }
  });
});
