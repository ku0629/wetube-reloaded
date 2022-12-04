import express from "express";
import {
  watch,
  deleteVideo,
  getUpload,
  postUpload,
  getEdit,
  postEdit,
} from "../controller/videoController";
import {
  protectorMiddleware,
  uploadMiddleware,
  videoUpload,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

videoRouter.get("/:id([0-9a-f]{24})", watch); //Regular expression

videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);

videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

export default videoRouter;
