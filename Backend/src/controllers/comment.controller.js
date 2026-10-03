import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Issue } from "../models/issue.model.js";
import { Project } from "../models/project.model.js";
import { Comment } from "../models/comment.model.js";

const createComment = asyncHandler(async (req, res) => {
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
        throw new ApiError(403, "viewers cannot update comments");
    }

    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId
    })

    if (!issue) {
        throw new ApiError(404, "issue not found");
    }

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "content required")
    }

    const comment = await Comment.create({
        content: content,
        issue: issueId,
        createdBy: userId
    })

    res.status(201).json(
        new ApiResponse(201, comment, "comment is created")
    )

});

const getAllComment = asyncHandler(async (req, res) => {
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

    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId
    })

    if (!issue) {
        throw new ApiError(404, "issue not found");
    }

    const comments = await Comment.find({
        issue: issueId
    }).populate("createdBy", "username email")

    res.status(200).json(
        new ApiResponse(200, comments, "all comments fetched successfully")
    )
});

const deleteComment = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    const issueId = req.params.issueId;
    const commentId = req.params.commentId

    if (!userId) {
        throw new ApiError(400, "user not logged in");
    }

    if (!projectId) {
        throw new ApiError(400, "project id is required");
    }

    if (!issueId) {
        throw new ApiError(400, "issue id is required");
    }
    if (!commentId) {
        throw new ApiError(400, "comment id is required");
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
        throw new ApiError(404, "issue not found");
    }

    const comment = await Comment.findOne({
        _id: commentId,
        issue: issueId
    })

    if (!comment) {
        throw new ApiError(404, "the comment not found")
    }

    const { owner } = project
    const { createdBy } = comment

    if (!(owner.equals(userId) || createdBy.equals(userId))) {
        throw new ApiError(403, "unauthorized request")
    }

    await Comment.deleteOne({
        _id: commentId
    })

    res.status(200).json(
        new ApiResponse(200, {}, "comment deleted")
    )
});
export { createComment, getAllComment, deleteComment }