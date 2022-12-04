import mongoose from "mongoose";

// export const formatHashtags = (hashtags) => {
//   return hashtags
//     .split(",")
//     .map((word) => (word.startswith("#") ? word : `#${word}`));
// };
//schema
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now }, //default value + Date.now -> because i want to excute the function when we create documents
  hashtags: [{ type: String, trim: true }],
  videoUrl: { type: String, required: true },
  meta: {
    views: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", //어떤 model의 id를 저장할지를 알려주기 위해서
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });
const Video = mongoose.model("Video", videoSchema);
export default Video;
