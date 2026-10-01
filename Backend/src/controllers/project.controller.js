import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!(name && description)) {
        throw new ApiError(400, "all fields about the project required")
    }
    const { _id } = req.user

    const project = await Project.create({
        owner: _id,
        name: name,
        description: description
    })

    res.status(201).json(
        new ApiResponse(201, project, "new project initialized")
    )

});

const getProjects = asyncHandler(async (req, res) => {
    const { _id } = req.user

    if (!_id) {
        throw new ApiError(400, "user not found")
    }

    const projects = await Project.find({
        $or: [
            { owner: _id },
            { "members.user": _id }
        ]
    })

    res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    )


});

const getProjectById = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId

    if (!(userId && projectId)) {
        throw new ApiError(400, "Project not found or user not logged in")
    }

    const project = await Project.findOne({
        $and: [
            { _id: projectId },
            {
                $or: [
                    { owner: userId },
                    { "members.user": userId }
                ]
            }
        ]
    })
    if (!project) {
        throw new ApiError(401, "Unauthorized request")
    }

    res.status(200).json(
        new ApiResponse(200, project, "project fetched successfully")
    )
});

const updateProject = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId

    if (!userId) {
        throw new ApiError(400, "user not logged in")
    }
    if (!projectId) {
        throw new ApiError(400, "Project not found")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const { owner } = project

    if (!owner.equals(userId)) {
        throw new ApiError(403, "Unauthorized request")
    }

    const { name, description, status } = req.body

    if (name) {
        project.name = name
    }
    if (description) {
        project.description = description
    }
    if (status) {
        project.status = status
    }

    await project.save()

    res.status(201).json(
        new ApiResponse(200, project, "project has updated successfully")
    )
});

const deleteProject = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId
    if (!userId) {
        throw new ApiError(400, "user not logged in")
    }
    if (!projectId) {
        throw new ApiError(404, "project not found")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const { owner } = project

    if (!owner.equals(userId)) {
        throw new ApiError(403, "unauthorized request")
    }

    await Project.deleteOne({ _id: projectId })

    res.status(200).json(
        new ApiResponse(200, {}, "project deleted successfully")
    )
});

const addMember = asyncHandler(async (req, res) => {
    const ownerId = req.user._id
    const projectId = req.params.projectId
    const { memberId, role } = req.body
    if (!ownerId) {
        throw new ApiError(400, "user not logged in")
    }
    if (!projectId) {
        throw new ApiError(404, "project not found")
    }
    if (!memberId) {
        throw new ApiError(400, "member id is needed to add member")
    }

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const { owner } = project

    if (!owner.equals(ownerId)) {
        throw new ApiError(403, "unauthorized request: only owner can make changes")
    }

    const member = await User.findById(memberId)

    if (!member) {
        throw new ApiError(404, "user to be added not found")
    }

    const alreadyMember = project.members.some(
        (existingMember) => existingMember.user.equals(memberId)
    )

    if (alreadyMember) {
        throw new ApiError(409, "user is already a member of the project")
    }

    if (!["Viewer", "Collaborator"].includes(role)) {
        throw new ApiError(400, "invalid member role")
    }

    project.members.push({
        user: memberId,
        role: role
    })

    await project.save()


    res.status(200).json(
        new ApiResponse(200, project, "new member added")
    )

});

const getProjectMembers = asyncHandler(async (req,res)=>{
    const projectId = req.params.projectId
    const userId = req.user._id

    if(!projectId){
        throw new ApiError(404,"project not found")
    }
    if(!userId){
        throw new ApiError(400,"user not logged in")
    }

    const project = await Project.findById(projectId).populate("members.user","username email")

    if(!project){
        throw new ApiError(404,"project not found")
    }
    
    const {members,owner} = project

    const memberCheck = members.some(
        (existedMembers)=> existedMembers.user.equals(userId)
    )

    if(!(owner.equals(userId)||memberCheck)){
        throw new ApiError(403,"unauthorized request")
    }

    res.status(200).json(
        new ApiResponse(200,members,"members fetched successfully")
    )

});

const removeProjectMembers = asyncHandler(async (req,res)=>{
    const userId = req.user._id
    const projectId = req.params.projectId
    const {memberId} = req.body

    if(!userId){
        throw new ApiError(400,"user not logged in")
    }
    if(!projectId){
        throw new ApiError(404,"project not found")
    }
    if(!memberId){
        throw new ApiError(400,"Id of the member to be removed not found")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    const {owner,members} = project

    const memberCheck = members.some(
        (existingMember)=> existingMember.user.equals(memberId)
    )

    if(!owner.equals(userId)){
        throw new ApiError(403,"unauthorized request")
    }
    if(!memberCheck){
        throw new ApiError(400,"member to be removed does not exist in the project")
    }
    
    const memberIdx = members.findIndex(
        (existingmembers)=>existingmembers.user.equals(memberId)
    )
    members.splice(memberIdx,1)
    
    await project.save()

    res.status(200).json(
        new ApiResponse(200,project,"member removed successfully")
    )
});

const updateMemberRole = asyncHandler(async (req,res)=>{

    const userId = req.user._id
    const projectId = req.params.projectId
    const memberId  = req.params.memberId
    const {role} = req.body
    if(!userId){
        throw new ApiError(400,"user not logged in")
    }
    if(!projectId){
        throw new ApiError(404,"project not found")
    }
    if(!(memberId)){
        throw new ApiError(400,"member id not found")
    }
    if(!role){
        throw new ApiError(400,"role field is required")
    }
    

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    const {owner,members} = project
    if(!owner.equals(userId)){
        throw new ApiError(403,"unauthorized request")
    }

    const member = members.find(
        (existingMember)=>existingMember.user.equals(memberId)
    )

    if(!member){
        throw new ApiError(400,"member does not exist")
    }

    if(!["Viewer","Collaborator"].includes(role)){
        throw new ApiError(400,"invalid member role")
    }

    
    member.role =role
    await project.save()
    
    res.status(200).json(
        new ApiResponse(200,project,"role updated successfully!")
    )
});
export { createProject,
     getProjects,
     getProjectById,
     updateProject,
     deleteProject,
     addMember,
     getProjectMembers,
     removeProjectMembers,
     updateMemberRole
     }