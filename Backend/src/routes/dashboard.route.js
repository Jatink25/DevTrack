import {Router} from "express";
import { verifyJwt } from "../middlewares/authentication.middleware.js";
import { getProjectStats } from "../controllers/dashboard.controller.js";

const router = Router({mergeParams:true})

router.route("/dashboard").get(verifyJwt,getProjectStats)


export default router