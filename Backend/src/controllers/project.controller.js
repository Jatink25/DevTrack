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

});

const getProjects = asyncHandler(async (req,res)=>{
    const {_id} = req.user

    if(!_id){
        throw new ApiError(400,"user not found")
    }
    
    const projects = await Project.find({
        $or:[
            {owner:_id},
            {"members.user":_id}
        ]
    })

    res.status(200).json(
        new ApiResponse(200,projects,"Projects fetched successfully")
    )
    
    
});

const getProjectById = asyncHandler(async (req,res)=>{
    const userId = req.user._id
    const projectId = req.params.projectId
    
    if(!(userId && projectId)){
        throw new ApiError(400,"Project not found or user not logged in")
    }

    const project = await Project.findOne({
        $and:[
            {_id:projectId},
            {
                $or:[
                    {owner:userId},
                    {"members.user":userId}
                ]
            }
        ]
    })
    if(!project){
        throw new ApiError(401,"Unauthorized request")
    }

    res.status(200).json(
        new ApiResponse(200,project,"project fetched successfully")
    )
});

export {createProject , getProjects,getProjectById}