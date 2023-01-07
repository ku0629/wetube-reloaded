import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";
import { restart } from "nodemon";

// if (error) {
//   return res.render("server-error", { error });
// } else {
//   const video = await Video;
//   return res.render("home", {
//     pageTitle: "Welcome",
//     videos: [], //send array with objects
//   });
// } CALLBACK

export const homeRecommend = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    return res.render("home", {
      pageTitle: "Welcome",
      videos, //send array with objects
    });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(400).render("server-error", { error });
  }
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate({
      path: "owner",
      populate: { path: "comments", model: "Comment" },
    })
    .populate("comments"); //const videoOwner = await User.findById(video.owner);
  //video가 없을경우를 예방 check error first!
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  } else {
    return res.render("watch", {
      pageTitle: video.title,
      video,
    });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "You are not the owner of the video!"); // req.flash(type, message);
    return res.status(403).redirect("/"); //status 403 - forbiddem
  }
  return res.render("edit", {
    pageTitle: `Edit: ${video.title} `,
    video,
  });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    return res.status(403).redirect("/"); //status 403 - forbiddem
  }
  await Video.findByIdAndUpdate(video, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  // video.title = title;
  // video.description = description;
  // video.hashtags = hashtags
  //   .split(",")
  //   .map((word) => (word.startsWith("#") ? word : `#${word}`));
  // await video.save();
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "Upload Video" });
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = req.files.video[0];
  const thumbnail = req.files.thumbnail[0];
  console.log(thumbnail);
  try {
    const newVideo = await Video.create({
      videoFileUrl: video.path,
      thumbnailUrl: thumbnail.path,
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    return res.status(403).redirect("/"); //status 403 - forbiddem
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", {
    pageTitle: "Search",
    videos,
  });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404); //Send status code and finish!
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  const dbUser = await User.findById(user._id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text: text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { commentId, videoId },
  } = req;
  const deleteComment = await Comment.findById(commentId).populate("owner");
  const video = await Video.findById(videoId);
  if (String(deleteComment.owner._id) === String(user._id)) {
    await Comment.findByIdAndDelete(commentId);
    video.comments.splice(video.comments.indexOf(commentId), 1);
    video.save();
  } else return res.sendStatus(403);
  return res.sendStatus(204);
};
