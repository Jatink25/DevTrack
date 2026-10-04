import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { Issue } from "../models/issue.model.js";

import mongoose from "mongoose";

const getProjectStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const projectId = req.params.projectId

    if (!userId) {
        throw new ApiError(400, "user not logged in")
    }
    if (!projectId) {
        throw new ApiError(404, "project not found")
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const { owner, members } = project

    const isMember = members.some(
        (member) => member.user.equals(userId)
    )

    if (!(owner.equals(userId) || isMember)) {
        throw new ApiError(403, "unauthorized request")
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId)

    const statusStat = await Issue.aggregate([
        {
            $match: {
                project: projectObjectId
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const priorityStat = await Issue.aggregate([
        {
            $match: {
                project: projectObjectId
            }
        },
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 }
            }
        }
    ])

    const totalIssues = await Issue.countDocuments({
        project: projectObjectId
    })
    const overdueIssues = await Issue.countDocuments({
        project: projectObjectId,
        dueDate: { $lt: new Date() },
        status: { $ne: "Completed" }
    });
    const unassignedIssues = await Issue.countDocuments({
        project:projectObjectId,
        assignedTo:null
    })

    const assignedIssues = totalIssues - unassignedIssues

    const dashboardData = {
        totalIssues,
        overdueIssues,
        assignedIssues,
        unassignedIssues,
        status: statusStat,
        priority: priorityStat
    }
    res.status(200).json(
        new ApiResponse(200, dashboardData, "project statistics fetched successfully")
    )
});

export { getProjectStats }