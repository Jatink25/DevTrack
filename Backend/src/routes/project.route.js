import {Router} from "express"
import { verifyJwt } from "../middlewares/authentication.middleware.js"
import { createProject } from "../controllers/project.controller.js"

const router = Router()

router.route("/").post(verifyJwt,createProject)


export default router