import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
} from "../controller/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView); //localhost:4000/api/videos/:id/view
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete(
  "/videos/:videoId([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})/delete",
  deleteComment
);

export default apiRouter;
