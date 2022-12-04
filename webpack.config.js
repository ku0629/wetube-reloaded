// For Front-end
//This file only understands old JS
// modole.exports === export default
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  //entry and output are required!
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  }, //우리가 처리하고자 하는 Sexy JS파일 , 이 프로퍼티에 우리가 처리하고자 하는 파일의 경로 입력
  mode: "development", //개발중인 단계이다. <-> production 개발완료!
  watch: true, //nodemon처럼 client폴더안의 파일이 수정되면 자동으로 assets폴더안의 파일들을 수정해준다. 그래서 터미널을 백엔드, 프론트엔드로 구분해서 사용해야된다.
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: {
    filename: "js/[name].js", //이 프로퍼티에 우리 결과물이 될 파일 이름 입력
    path: path.resolve(__dirname, "assets"), //이 프로퍼티에 우리 결과물 파일을 어디에 저장할 지 지정 (이 경로는 절대경로여야 해!) Webpack은 절대경로를 요구한다.
    //__dirname = 현재파일의 절대경로    path.resolve() -> 입력한 파트들을 모아서 새로운 경로를 만들어 준다.
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //Webpack은 뒤에서부터 시작해서 역순으로 적어준다.
        /** 
        1.
        sass-loader가 scss확장자 파일을 브라우저가 이해할 수 있는 css 파일로 변환시킨다
        2.
        css-loader가 @import, url()등의 최신형 css 코드를 브라우저가 이해할 수 있는 코드로 변환시켜 동작할 수 있도록 한다
        3.
        style-loader가 위 과정으로 변환시킨 css 코드를 DOM 내부에 적용시켜준다 -> mini-css-extract-plugin css를 추출해서 별도의 파일로 만들어준다.
        */
      },
    ],
  },
};
