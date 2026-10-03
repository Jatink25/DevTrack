import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createIssue, getAllIssue, getIssueById, updateIssue } from "../controllers/issue.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router({mergeParams:true});

router.route("/issues").post(verifyJwt, upload.array("attachment"), createIssue)
router.route("/issues").get(verifyJwt,getAllIssue)
router.route("/issues/:issueId").get(verifyJwt,getIssueById)
router.route("/issues/:issueId").patch(verifyJwt,updateIssue)

export default router