import Video from "../models/Video";
import User from "../models/User";

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
    const videos = await Video.find({}).sort({ createdAt: "desc" });
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
  const video = await Video.findById(id).populate("owner"); //const videoOwner = await User.findById(video.owner);
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
  const video = req.file;
  try {
    const newVideo = await Video.create({
      videoUrl: video.path,
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
    });
  }
  return res.render("search", {
    pageTitle: "Search",
    videos,
  });
};