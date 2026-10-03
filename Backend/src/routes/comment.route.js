import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { createComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/comments").post(verifyJwt,createComment)

export default router