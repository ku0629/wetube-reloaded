import express from "express"; //express sever
import morgan from "morgan"; //middleware
import session from "express-session";
import MongoStore from "connect-mongo";

import rootRouter from "./router/rootRouter";
import userRouter from "./router/userRouter";
import videoRouter from "./router/videoRouter";
import { localMiddleware } from "./middlewares";

const app = express(); //express application을 만드는 함수
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views"); //pug configuration!

const logger = morgan("dev");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // middleware which makes req.body object

//cookie
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //default store is memory storage but now it is stored in mongodb
    resave: false, // save everytime when every request
    saveUninitialized: false, //Save when we modified the session -> ex-req.session.loggedIn = true
  })
);

app.use(localMiddleware);
app.use("/uploads", express.static("uploads")); //Browser가 uploads folder에 접근 가능, express한테 사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라는 요청
app.use("/static", express.static("assets"));
// Router
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
