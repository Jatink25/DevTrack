import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { createComment, deleteComment, getAllComment } from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true })

router.route("/comments").post(verifyJwt,createComment)
router.route("/comments").get(verifyJwt,getAllComment)
router.route("/comments/:commentId").delete(verifyJwt,deleteComment)

export default router