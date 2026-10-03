import Router from "express";
import { createIssue } from "../controllers/issue.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.route("/issues").post(verifyJwt,createIssue)

export default router