import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { createComment, getAllComment } from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true })

router.route("/comments").post(verifyJwt,createComment)
router.route("/comments").get(verifyJwt,getAllComment)

export default router