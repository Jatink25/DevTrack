import api from "../../api/axios.js";

// GET /projects/:projectId/dashboard -> ApiResponse { data: stats }
// stats: { totalIssues, overdueIssues, assignedIssues, unassignedIssues,
//          status: [{ _id, count }], priority: [{ _id, count }] }
export const getProjectStats = async (projectId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/dashboard`,
        { signal }
    );
    return res.data.data;
};