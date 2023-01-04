import express from "express"; //express sever
import morgan from "morgan"; //middleware
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";

import rootRouter from "./router/rootRouter";
import userRouter from "./router/userRouter";
import videoRouter from "./router/videoRouter";
import apiRouter from "./router/apiRouter";

import { localMiddleware } from "./middlewares";

const app = express(); //express application을 만드는 함수
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views"); //pug configuration!

const logger = morgan("dev");
app.use(logger);
app.use(express.urlencoded({ extended: true })); // middleware which makes req.body object
app.use(express.json()); //string into JS object like JSON.parse()

//cookie - Backend로 보내지는 모든 request는 쿠키와 함께 온다.
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //default store is memory storage but now it is stored in mongodb
    resave: false, // save everytime when every request
    saveUninitialized: false, //Save when we modified the session -> ex-req.session.loggedIn = true
  })
);
// app.use(express.text()); -> Backend will understand a text and put it into req.body! but I can only send one thing.
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(flash()); // middleware to send a message to users on the template and  we can use req.flash!
app.use(localMiddleware);
app.use("/uploads", express.static("uploads")); //Browser가 uploads folder에 접근 가능, express한테 사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라는 요청
app.use("/static", express.static("assets"));
// Router
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
