import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Activity } from "../models/activity.model.js";
import { Project } from "../models/project.model.js";

const getProjectActivity = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const projectId = req.params.projectId;

    if (!userId) {
        throw new ApiError(400, "user not logged in");
    }

    if (!projectId) {
        throw new ApiError(404, "project not found");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "project not found");
    }

    const isMember = project.members.some((member) =>
        member.user.equals(userId)
    );

    if (!project.owner.equals(userId) && !isMember) {
        throw new ApiError(403, "unauthorized request");
    }

    const activities = await Activity.find({ project: projectId })
        .sort({ createdAt: -1 })
        .populate("user", "username email")
        .populate("issue", "title");

    res.status(200).json(
        new ApiResponse(
            200,
            activities,
            "project activity fetched successfully"
        )
    );
});

export { getProjectActivity };
