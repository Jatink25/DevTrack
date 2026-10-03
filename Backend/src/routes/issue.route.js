import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createIssue } from "../controllers/issue.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router({mergeParams:true});

router.route("/issues").post(verifyJwt, upload.array("attachment"), createIssue)

export default router