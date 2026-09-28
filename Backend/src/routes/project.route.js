import {Router} from "express"
import { verifyJwt } from "../middlewares/authentication.middleware.js"
import { createProject, getProjectById, getProjects, updateProject } from "../controllers/project.controller.js"

const router = Router()

router.route("/").post(verifyJwt,createProject)

router.route("/").get(verifyJwt,getProjects)

router.route("/:projectId").get(verifyJwt,getProjectById)

router.route("/:projectId").patch(verifyJwt,updateProject)


export default router