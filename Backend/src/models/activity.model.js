import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue"
    },
    action: {
        type: String,
        enum: [
            "Issue Created",
            "Issue Updated",
            "Issue Deleted",
            "Issue Assigned",
            "Status Changed",
            "Priority Changed",
            "Comment Added",
            "Comment Deleted",
            "Member Added",
            "Member Removed",
            "Member Role Updated"
        ],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

export const Activity = mongoose.model("Activity", activitySchema)