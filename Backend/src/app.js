import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"
import  projectRoute  from "./routes/project.route.js";

const app = express();

app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({
    limit:"16kb"
}));

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));

app.use(express.static("public"));

app.use(cookieParser());


//route
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/projects",projectRoute)

export default app