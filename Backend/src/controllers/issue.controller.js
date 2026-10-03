import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Project} from "../models/project.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Issue } from "../models/issue.model.js";

const createIssue = asyncHandler(async (req,res)=>{
    const userId = req.user._id
    const projectId = req.params.projectId

    if(!userId){
        throw new ApiError(400,"user not logged in")
    }
    if(!projectId){
        throw new ApiError(404,"project not found")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    const {owner,members} = project

    const user = members.find(
        (existingMembers)=>existingMembers.user.equals(userId)
    )

    if(
        !(owner.equals(userId)||user?.role==="Collaborator")
    ){
        throw new ApiError(403,"unauthorized request")
    }
    
    const {title,description,assignedTo,priority,status ,dueDate} = req.body

    if(!(title && description)){
        throw new ApiError(400,"all fields are required")
    }

    if(assignedTo){
        const assignedMember = members.find(
            (member)=>member.user.equals(assignedTo)
        );
        if(!assignedMember && !owner.equals(assignedTo)){
            throw new ApiError(400,"assigned user is not a member of this project")
        }
    }

    const attachments = []

    if(req.files && req.files.length>0){
        for(const file of req.files){
            const uploadFile = await uploadOnCloudinary(file.path)

            if(!uploadFile){
                throw new ApiError(500,"failed to upload attachment")
            }
            attachments.push({
                url:uploadFile.secure_url,
                publicId:uploadFile.public_id
            })
        }
    }

    const issue = await Issue.create({
        title,
        description,
        project: projectId,
        createdBy:userId,
        assignedTo: assignedTo||undefined,
        status,
        priority,
        dueDate,
        attachments
    })

    if(!issue){
        throw new ApiError(500,"failed to create issue")
    }

    res.status(201).json(
        new ApiResponse(201,issue,"Issue created successfully")
    )

});

const getAllIssue = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    const projectId = req.params.projectId

    if(!userId){
        throw new ApiError(400,"user not logged in")
    }
    if(!projectId){
        throw new ApiError(404,"project not found")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }
    
    const {owner,members} = project

    const member = members.find(
        (existingMembers)=>existingMembers.user.equals(userId)
    )

    if(!(member||owner.equals(userId))){
        throw new ApiError(403,"unauthorized request")
    }
    const issues = await Issue.find({project:projectId}).populate("createdBy","username email").populate("assignedTo","username email");

    res.status(200).json(
        new ApiResponse(200,issues,"project issues fetched successfully")
    )
});
export {createIssue, getAllIssue};