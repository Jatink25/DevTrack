import { Activity } from "../models/activity.model.js";

const logActivity = async ({
    userId,
    projectId,
    issueId,
    action,
    description
}) => {

    return await Activity.create({
        user: userId,
        project: projectId,
        issue: issueId,
        action,
        description
    });
};

export { logActivity };