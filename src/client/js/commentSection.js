import { async } from "regenerator-runtime";
import { deleteComment } from "../../controller/videoController";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};
const handleSubmit = async (event) => {
  event.preventDefault(); //stop default behaviors
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    //header includes imformation of request
    headers: {
      "content-type": "application/json", //tell express we are sending JSON files
    },
    body: JSON.stringify({ text }), //text object(JS object) into string
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json(); //extract json from response
    addComment(text, newCommentId);
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
}
