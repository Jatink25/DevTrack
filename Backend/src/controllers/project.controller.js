import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";

const createProject = asyncHandler(async (req,res)=>{
    const {name , description} = req.body
    if(!(name && description)){
        throw new ApiError(400,"all fields about the project required")
    }
    const {_id}= req.user

    const project = await Project.create({
        owner: _id,
        name: name,
        description: description
    })
    
    res.status(201).json(
        new ApiResponse(201,project,"new project initialized")
    )

})

export {createProject}