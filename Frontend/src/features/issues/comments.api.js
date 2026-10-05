import api from "../../api/axios.js";

// GET /projects/:projectId/issues/:issueId/comments
// -> ApiResponse { data: Comment[] } with createdBy populated.
export const getIssueComments = async (projectId, issueId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/comments`,
        { signal }
    );
    return res.data.data;
};

// POST /projects/:projectId/issues/:issueId/comments
// Request: { content }; response: ApiResponse { data: Comment }.
export const createIssueComment = async (projectId, issueId, content) => {
    const res = await api.post(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/comments`,
        { content }
    );
    return res.data.data;
};

// DELETE /projects/:projectId/issues/:issueId/comments/:commentId
// Response: ApiResponse { data: {} }.
export const deleteIssueComment = async (projectId, issueId, commentId) => {
    const res = await api.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}/comments/${encodeURIComponent(commentId)}`
    );
    return res.data.data;
};
