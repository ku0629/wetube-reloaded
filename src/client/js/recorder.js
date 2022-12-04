const startAudioBtn = document.getElementById("startAudioBtn");
const audio = document.getElementById("previewAudio");

let stream;
let recorder;
let audioFile;
let controlTimer = null;

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true,
  });
  audio.srcObject = stream;
  audio.play();
};
init();

const handleStart = (event) => {
  startAudioBtn.removeEventListener("click", handleStart);
  startAudioBtn.addEventListener("click", handleStop);
  startAudioBtn.innerText = "Stop Recording";

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    audioFile = URL.createObjectURL(event.data);
    audio.srcObject = null;
    audio.src = audioFile;
    audio.loop = true;
    audio.play();
  };
  recorder.start();
  controlTimer = setTimeout(() => {
    handleStop();
  }, 6000);
};

const handleStop = (event) => {
  startAudioBtn.removeEventListener("click", handleStop);
  startAudioBtn.addEventListener("click", handleDownload);
  startAudioBtn.innerText = "Download Recording";
  if (controlTimer) {
    clearTimeout(controlTimer);
    controlTimer = null;
  }
  recorder.stop();
};
const handleDownload = (event) => {
  const a = document.createElement("a");
  a.href = audioFile;
  a.download = "My Audio.webm";
  document.body.appendChild(a);
  a.click();
};
// const startBtn = document.getElementById("startBtn");
// const video = document.getElementById("preview");

// /**Global variables */
// let stream;
// let recorder;
// let videoFile;

// const init = async () => {
//   stream = await navigator.mediaDevices.getUserMedia({
//     //MediaDevices 인터페이스의 getUserMedia() 메서드는 사용자에게 미디어 입력 장치 사용 권한을 요청하며, 사용자가 수락하면 요청한 미디어 종류의 트랙을 포함한 MediaStream (en-US)을 반환합니다.
//     video: true,
//     audio: false,
//   });
//   video.srcObject = stream;
//   video.play();
// };
// init(); //Preview

// const handleStop = (event) => {
//   startBtn.innerText = "Download Recording";
//   startBtn.removeEventListener("click", handleStop);
//   startBtn.addEventListener("click", handleDownload);
//   recorder.stop();
// };

// const handleDownload = (event) => {
//   const a = document.createElement("a");
//   a.href = videoFile;
//   /**a태그에 download속성 -> 해당 URL을 통해 어디로 보내주는게 아니라 URL을 저장하게 해준다. */
//   a.download = "MyRecording.webm"; //WebM은 로열티 비용이 없는 개방형 고화질 영상 압축 형식의 영상 포맷이며 HTML5 비디오와 함께 이용한다.
//   document.body.appendChild(a);
//   a.click(); //사용자가 링크를 클릭한 것처럼 작동한다.
// };

// const handleStart = (event) => {
//   /**Recording the stream */
//   startBtn.innerText = "Stop recording";
//   startBtn.removeEventListener("click", handleStart);
//   startBtn.addEventListener("click", handleStop);
//   //MediaRecorder -> MediaStream Recording API의 MediaRecorder 인터페이스는 미디어를 쉽게 녹화할 수 있는 기능을 제공합니다. MediaRecorder() 생성자를 사용하여 생성됩니다.
//   recorder = new MediaRecorder(stream);
//   recorder.ondataavailable = (event) => {
//     //MediaRecorder.ondataavailable -> datavailable 이벤트의 이벤트핸들러
//     /**JavaScript에서 Blob(Binary Large Object, 블랍)은 이미지, 사운드, 비디오와 같은 멀티미디어 데이터를 다룰 때 사용할 수 있습니다.*/
//     videoFile = URL.createObjectURL(event.data); //createObjectURL은 브라우저 메모리에서만 가능한 URL을 만들어 준다. 이 URL은 파일을 가리킨다. 해당 url은 window창이 사라지면 사라진다.
//     video.srcObject = null;
//     video.src = videoFile;
//     video.loop = true;
//     video.play();
//   };
//   recorder.start();
// };

// startBtn.addEventListener("click", handleStart); //하나의 Element에 두개의 functions을 사용한다. removeEventListener+addEventListener
startAudioBtn.addEventListener("click", handleStart);
