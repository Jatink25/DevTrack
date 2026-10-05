import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const searchUsers = asyncHandler(async (req, res) => {
    const query =
        typeof req.query.query === "string" ? req.query.query.trim() : "";

    if (!query) {
        throw new ApiError(400, "search query is required");
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
        $or: [
            { username: { $regex: escapedQuery, $options: "i" } },
            { email: { $regex: escapedQuery, $options: "i" } },
        ]
    })
        .select("_id username email")
        .sort({ username: 1 })
        .limit(10);

    res.status(200).json(
        new ApiResponse(200, users, "users fetched successfully")
    );
});

export { searchUsers };
