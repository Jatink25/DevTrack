import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Issue } from "../models/issue.model.js";
import fs from "fs";
import { logActivity } from "../utils/activityLogger.js";



const createIssue = asyncHandler(async (req, res) => {
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

    const { owner, members } = project

    const user = members.find(
        (existingMembers) => existingMembers.user.equals(userId)
    )

    if (
        !(owner.equals(userId) || user?.role === "Collaborator")
    ) {
        throw new ApiError(403, "unauthorized request")
    }

    const { title, description, assignedTo, priority, status, dueDate } = req.body

    if (!(title && description)) {
        throw new ApiError(400, "title and description are required")
    }

    if (assignedTo) {
        const assignedMember = members.find(
            (member) => member.user.equals(assignedTo)
        );
        if (!assignedMember && !owner.equals(assignedTo)) {
            throw new ApiError(400, "assigned user is not a member of this project")
        }
    }

    const attachments = []

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadFile = await uploadOnCloudinary(file.path)

            if (!uploadFile) {
                throw new ApiError(500, "failed to upload attachment")
            }

            fs.unlinkSync(file.path);

            attachments.push({
                url: uploadFile.secure_url,
                publicId: uploadFile.public_id
            })
        }
    }

    const issue = await Issue.create({
        title,
        description,
        project: projectId,
        createdBy: userId,
        assignedTo: assignedTo || undefined,
        status,
        priority,
        dueDate,
        attachments
    })

    await logActivity({
        userId,
        projectId,
        issueId: issue._id,
        action: "Issue Created",
        description: `Issue "${issue.title}" was created`
    })

    if (!issue) {
        throw new ApiError(500, "failed to create issue")
    }

    res.status(201).json(
        new ApiResponse(201, issue, "Issue created successfully")
    )

});

const getAllIssue = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId
    const { status, priority, search } = req.query

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

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

    const { owner, members } = project

    const member = members.find(
        (existingMembers) => existingMembers.user.equals(userId)
    )

    if (!(member || owner.equals(userId))) {
        throw new ApiError(403, "unauthorized request")
    }

    const query = {
        project: projectId
    }

    if (status) {
        query.status = status
    }
    if (priority) {
        query.priority = priority
    }
    if (search) {
        query.title = {
            $regex: search,
            $options: "i"
        }
    }
    const skip = (page - 1) * limit;

    const totalIssues = await Issue.countDocuments(query)
    const totalPages = Math.ceil(totalIssues / limit)

    const issues = await Issue.find(query)
        .populate("createdBy", "username email")
        .populate("assignedTo", "username email")
        .skip(skip)
        .limit(limit)

    res.status(200).json(
        new ApiResponse(
            200,
            {
                issues,
                currentPage: page,
                totalPages,
                totalIssues
            },
            "project issues fetched successfully"
        )
    );
});

const getIssueById = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId
    const issueId = req.params.issueId

    if (!userId) {
        throw new ApiError(400, "user not logged in")
    }
    if (!projectId) {
        throw new ApiError(404, "project not found")
    }
    if (!issueId) {
        throw new ApiError(400, "issue not found")
    }
    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const { owner, members } = project

    const member = members.find(
        (existingMembers) => existingMembers.user.equals(userId)
    )

    if (!(member || owner.equals(userId))) {
        throw new ApiError(403, "unauthorized request")
    }

    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId
    }).populate("createdBy", "username email").populate("assignedTo", "username email");

    if (!issue) {
        throw new ApiError(404, "issue not found")
    }

    res.status(200).json(
        new ApiResponse(200, issue, "issue fetched successfully")
    )
});


const updateIssue = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    const issueId = req.params.issueId;

    if (!userId) {
        throw new ApiError(400, "user not logged in");
    }

    if (!projectId) {
        throw new ApiError(400, "project id is required");
    }

    if (!issueId) {
        throw new ApiError(400, "issue id is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "project not found");
    }

    const { owner, members } = project;

    const isOwner = owner.equals(userId);

    const member = members.find(
        (existingMember) => existingMember.user.equals(userId)
    );

    if (!isOwner && !member) {
        throw new ApiError(403, "unauthorized request");
    }

    if (!isOwner && member.role === "Viewer") {
        throw new ApiError(403, "viewers cannot update issues");
    }

    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId
    })

    if (!issue) {
        throw new ApiError(404, "issue not found");
    }

    const {
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate
    } = req.body;

    if (title !== undefined) {
        issue.title = title;
    }

    if (description !== undefined) {
        issue.description = description;
    }

    if (assignedTo !== undefined) {

        // Allow removing assignment
        if (assignedTo === null) {
            issue.assignedTo = null;
        } else {

            const assignedMember = members.find(
                (member) => member.user.equals(assignedTo)
            );

            const assignedUserIsOwner = owner.equals(assignedTo);

            if (!assignedMember && !assignedUserIsOwner) {
                throw new ApiError(
                    400,
                    "assigned user is not a member of this project"
                );
            }

            issue.assignedTo = assignedTo;
        }
    }

    if (status !== undefined) {
        issue.status = status;
    }

    if (priority !== undefined) {
        issue.priority = priority;
    }

    if (dueDate !== undefined) {
        issue.dueDate = dueDate;
    }

    await issue.save();

    await logActivity({
        userId,
        projectId,
        issueId: issue._id,
        action: "Issue Updated",
        description: `Issue "${issue.title}" was updated`
    });

    res.status(200).json(
        new ApiResponse(
            200,
            issue,
            "issue updated successfully"
        )
    );
});

const deleteIssue = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    const issueId = req.params.issueId;

    if (!userId) {
        throw new ApiError(400, "user not logged in");
    }

    if (!projectId) {
        throw new ApiError(400, "project id is required");
    }

    if (!issueId) {
        throw new ApiError(400, "issue id is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "project not found");
    }

    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId
    })
    if (!issue) {
        throw new ApiError(404, "issue not found")
    }

    const { owner } = project
    const { createdBy } = issue

    if (!(owner.equals(userId) || createdBy.equals(userId))) {
        throw new ApiError(403, "unauthorized request")
    }

    await logActivity({
        userId,
        projectId,
        issueId: issue._id,
        action: "Issue Deleted",
        description: `Issue "${issue.title}" was deleted`
    });

    await Issue.deleteOne({
        _id: issueId,
        project: projectId
    })

    res.status(200).json(
        new ApiResponse(200, {}, "Issue deleted Successfully")
    )

});

export { createIssue, getAllIssue, getIssueById, updateIssue, deleteIssue };