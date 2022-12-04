const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const btn = form.querySelector("button");

const handleSubmit = (event) => {
  event.preventDefault(); //stop default behaviors
  const text = textarea.value;
  console.log(videoContainer.dataset);
};

form.addEventListener("submit", handleSubmit);
