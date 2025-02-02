import mongoose from "mongoose";
import { compileClientWithDependenciesTracked } from "pug";

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError); //operate several time
db.once("open", handleOpen); //operate only once
