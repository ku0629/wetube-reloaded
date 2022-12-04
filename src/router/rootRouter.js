import express from "express";
import {
  getLogin,
  postLogin,
  getJoin,
  postJoin,
} from "../controller/userController";
import { homeRecommend, search } from "../controller/videoController";
import { publicOnlyMiddleware } from "../middlewares";
const rootRouter = express.Router();

rootRouter.get("/", homeRecommend);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.get("/search", search);

export default rootRouter;
