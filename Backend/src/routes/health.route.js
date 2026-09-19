import {Router} from "express"

const router = Router();

router.route("/").get((req,res)=>{
    res.status(200).json({
        success: true,
        message: "DevTrack backend is running"
    })
});

export default router