import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware";
import { createComment } from "../controllers/comment.controller";

const router = Router()

router.route("/comments").post(verifyJwt,createComment)

export default router