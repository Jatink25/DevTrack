import { Router } from "express";
import { searchUsers } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.route("/search").get(verifyJwt, searchUsers);

export default router;
