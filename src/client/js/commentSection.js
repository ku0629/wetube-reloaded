import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const video__comment = document.querySelector(".video__comment");
const form = document.getElementById("commentForm");
const deleteCommentBtn = document.querySelectorAll(
  ".video__comment .deleteBtn"
);

const addComment = (text, commentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.commentId = commentId;
  newComment.dataset.videoId = videoContainer.dataset.id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = " ❌";
  span2.id = "newDeleteCommentBtn";
  span2.style.cursor = "pointer";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
  const newDeleteCommentBtn = document.querySelector("#newDeleteCommentBtn");
  newDeleteCommentBtn.addEventListener("click", handleDeleteCommentBtnClick);
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
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDeleteCommentBtnClick = async (event) => {
  const commentId = event.target.parentElement.dataset.commentId;
  const videoId = event.target.parentElement.dataset.videoId;
  const response = await fetch(
    `/api/videos/${videoId}/comments/${commentId}/delete`,
    {
      method: "DELETE",
    }
  );
  if (response.status === 204) {
    event.target.parentElement.remove();
  }
};
if (video__comment) {
  for (var i = 0; i < deleteCommentBtn.length; i++) {
    deleteCommentBtn[i].addEventListener("click", handleDeleteCommentBtnClick);
  }
}
