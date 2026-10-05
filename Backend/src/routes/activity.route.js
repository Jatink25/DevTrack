import { Router } from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { getProjectActivity } from "../controllers/activity.controller.js";

const router = Router({ mergeParams: true });

router.route("/activity").get(verifyJwt, getProjectActivity);

export default router;
