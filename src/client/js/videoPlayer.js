const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

/**Global variables */
let volumeValue = 0.5;
let controlsTimeout = null;
let controlsMouseMovementTimeout = null;
/**initiation */
video.volume = volumeValue;

const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};
const handlePause = (event) => {
  playBtn.innerText = "Play";
};
const handlePlay = (event) => {
  playBtn.innerText = "Pause";
};
const handleMute = (event) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeInput = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = volumeValue;
};
const formatTime = (seconds) => {
  // new Date(0) -> 1970년 1월 1일 9시(한국기준)부터 날짜를 계산한다. 여기에 0이 아닌 다른 값을 입력하면 1970년부터 이후 밀리세컨드(1000분의1초)단위로 시간을 더해서 Date객체를 만든다.
  // const time = new Date(video.duration * 1000).toISOString().substring(11, 8); //toISOString()으 붙이면 1970년 1월 1일 0시부터
  return new Date(seconds * 1000).toISOString().substring(14, 19); //substring(start-index, end-index)
};

const handleLoadedMetaData = (event) => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = (event) => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};
const handleTimelineInput = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};
const handleFullScreenClick = (event) => {
  const fullscreen = document.fullscreenElement; // fullscreenElement는 fullscreen인 경우 해당 element를 전달 없으면 null
  if (fullscreen) {
    document.exitFullscreen(); //called on the document
    fullScreenBtn.innerText = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen(); // called on the element div인 이상 아무거나 fullscreen으로 가능하다!
    fullScreenBtn.innerText = "Exit Full Screen";
  }
};

/**Mouse Events */
const hideControls = () => {
  videoControls.classList.remove("showing");
};

const handleMouseEnter = (event) => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout); //clearTimeout(id) -> cancel the id's timer!
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
};
const handleMouseLeave = (event) => {
  /**3초후에 videoControls를 사라지게 한다. setTimeout이 불리면 unique한 id를 return한다.*/
  controlsTimeout = setTimeout(hideControls, 3000);
};
const handleMouseMove = (event) => {
  if (controlsMouseMovementTimeout) {
    //cancel the old timeout!
    clearTimeout(controlsMouseMovementTimeout);
    controlsMouseMovementTimeout = null;
  }
  videoControls.classList.add("showing"); //1.움직일때마다 계속 showing을 더한다. 2.그리고 3초뒤에 showing을 제거하는 setTimeout을 부른다.
  controlsMouseMovementTimeout = setTimeout(hideControls, 3000); //excute a new timeout!
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeInput);
video.addEventListener("loadedmetadata", handleLoadedMetaData); //미디어의 메타 데이터가 로드되었을 때를 나타낸다.메타 데이터는 우리가 유용하게 사용할 수 있는 동영상의 재생시간과 같은 것을 의미한다
video.addEventListener("timeupdate", handleTimeUpdate); //오디오 / 비디오의 재생 위치가 변경 될 때 timeupdate 이벤트가 발생합니다.
timeline.addEventListener("input", handleTimelineInput);
fullScreenBtn.addEventListener("click", handleFullScreenClick);
/**Video안에서의 마우스 */
video.addEventListener("mouseenter", handleMouseEnter);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("mousemove", handleMouseMove);
