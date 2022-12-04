import express from "express";
import {
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  postEdit,
  getEdit,
  getChangePassword,
  postChangePassword,
  myProfile,
} from "../controller/userController";
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadMiddleware,
} from "../middlewares";
const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .post(avatarUpload.single("avatar"), postEdit) //multer가 파일을 받아서 upload folder에 저장하고 postEdit를 실행 + file 정보를 전달 => req.file
  .get(getEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter
  .all(protectorMiddleware)
  .route("/change-password")
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/:id([0-9a-f]{24})", myProfile);

export default userRouter;
