import {Router} from "express"
import { verifyJwt } from "../middlewares/authentication.middleware.js"
import { createProject, getProjects } from "../controllers/project.controller.js"

const router = Router()

router.route("/").post(verifyJwt,createProject)

router.route("/").get(verifyJwt,getProjects)


export default router