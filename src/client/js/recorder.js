import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { async } from "regenerator-runtime";

const actionBtn = document.getElementById("actionBtn");
const actionIcon = actionBtn.querySelector("i");
const video = document.getElementById("preview");

/**Global variables */
let stream;
let recorder;
let videoFile;
const file = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};
/**Global function */
const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  /**a태그에 download속성 -> 해당 URL을 통해 어디로 보내주는게 아니라 URL을 저장하게 해준다. */
  a.download = fileName; //WebM은 로열티 비용이 없는 개방형 고화질 영상 압축 형식의 영상 포맷이며 HTML5 비디오와 함께 이용한다.
  document.body.appendChild(a);
  a.click(); //사용자가 링크를 클릭한 것처럼 작동한다.
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    //MediaDevices 인터페이스의 getUserMedia() 메서드는 사용자에게 미디어 입력 장치 사용 권한을 요청하며, 사용자가 수락하면 요청한 미디어 종류의 트랙을 포함한 MediaStream (en-US)을 반환합니다.
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};
init(); //Preview

const handleDownload = async (event) => {
  actionIcon.classList = "fa-regular fa-circle-check";
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.disabled = true;

  //we have to convert webm to mp4
  const ffmpeg = createFFmpeg({ log: true }); //to see what's going on in console
  await ffmpeg.load(); //user uses ffmpeg -> it takes long time

  ffmpeg.FS("writeFile", file.input, await fetchFile(videoFile)); //Create a file in ffmpeg virtual world!!

  await ffmpeg.run("-i", file.input, "-r", "60", file.output); // input recording.webm file and return output.mp4 file and then output.mp4 file will be saved in browser memory
  await ffmpeg.run(
    //for Thumbnail
    "-i",
    file.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    file.thumb
  );
  const mp4File = ffmpeg.FS("readFile", file.output); // if i want to use binary data then i should use buffer!
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" }); //buffer = binary data
  const mp4Url = URL.createObjectURL(mp4Blob);

  const thumbnailFile = ffmpeg.FS("readFile", file.thumb);
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" }); // creating a file-like object
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob); //by using blobUrl we can access to file

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbnailUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", file.input);
  ffmpeg.FS("unlink", file.output);
  ffmpeg.FS("unlink", file.thumb);

  URL.revokeObjectURL("videoUrl");
  URL.revokeObjectURL("mp4Url");
  URL.revokeObjectURL("thumbnailUrl");

  actionBtn.disabled = false;
  actionIcon.classList = "fa-regular fa-circle-play";
  init();
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = (event) => {
  /**Recording the stream */
  actionIcon.classList = "fa-regular fa-circle-stop";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  //MediaRecorder -> MediaStream Recording API의 MediaRecorder 인터페이스는 미디어를 쉽게 녹화할 수 있는 기능을 제공합니다. MediaRecorder() 생성자를 사용하여 생성됩니다.
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    //MediaRecorder.ondataavailable -> datavailable 이벤트의 이벤트핸들러!! 녹화가 끝나면 발생한다!!
    /**JavaScript에서 Blob(Binary Large Object, 블랍)은 이미지, 사운드, 비디오와 같은 멀티미디어 데이터를 다룰 때 사용할 수 있습니다.*/
    videoFile = URL.createObjectURL(event.data); //createObjectURL은 브라우저 메모리에서만 가능한 URL을 만들어 준다. 이 URL은 파일을 가리킨다. 해당 url은 window창이 사라지면 사라진다.
    //event.data - Binary data we can't access so by using createObjectURL we can refer to binary data event.data
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionIcon.classList = "fa-regular fa-circle-down";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

actionBtn.addEventListener("click", handleStart); //하나의 Element에 두개의 functions을 사용한다. removeEventListener+addEventListener
//startAudioBtn.addEventListener("click", handleStart);
