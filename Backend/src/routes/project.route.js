import {Router} from "express"
import { verifyJwt } from "../middlewares/authentication.middleware.js"
import { addMember, createProject, deleteProject, getProjectById, getProjectMembers, getProjects, updateProject } from "../controllers/project.controller.js"

const router = Router()

router.route("/").post(verifyJwt,createProject)

router.route("/").get(verifyJwt,getProjects)

router.route("/:projectId").get(verifyJwt,getProjectById)

router.route("/:projectId").patch(verifyJwt,updateProject)

router.route("/:projectId").delete(verifyJwt,deleteProject)

router.route("/:projectId/members").post(verifyJwt,addMember)

router.route("/:projectId/members").get(verifyJwt,getProjectMembers)


export default router