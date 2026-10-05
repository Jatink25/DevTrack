import api from "../../api/axios.js";

// GET /projects/:projectId/activity -> ApiResponse { data: Activity[] }
export const getProjectActivity = async (projectId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/activity`,
        { signal }
    );
    return res.data.data;
};
