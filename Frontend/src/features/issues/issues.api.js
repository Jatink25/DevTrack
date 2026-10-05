import api from "../../api/axios.js";

// GET /projects/:projectId/issues -> ApiResponse { data: pagination result }
export const getProjectIssues = async (
    projectId,
    { status, priority, search, page, signal } = {}
) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/issues`,
        {
            params: {
                ...(status ? { status } : {}),
                ...(priority ? { priority } : {}),
                ...(search ? { search } : {}),
                ...(page ? { page } : {}),
            },
            signal,
        }
    );
    return res.data.data;
};

// GET /projects/:projectId/issues/:issueId -> ApiResponse { data: Issue }
export const getProjectIssue = async (projectId, issueId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`,
        { signal }
    );
    return res.data.data;
};

// POST /projects/:projectId/issues accepts multipart/form-data for attachments.
// The file field name and maximum count match upload.array("attachment", 5).
export const createProjectIssue = async (projectId, issue, files = []) => {
    const formData = new FormData();
    formData.append("title", issue.title);
    formData.append("description", issue.description);
    formData.append("status", issue.status);
    formData.append("priority", issue.priority);

    if (issue.assignedTo) formData.append("assignedTo", issue.assignedTo);
    if (issue.dueDate) formData.append("dueDate", issue.dueDate);
    files.forEach((file) => formData.append("attachment", file));

    const res = await api.post(
        `/projects/${encodeURIComponent(projectId)}/issues`,
        formData
    );
    return res.data.data;
};

// PATCH /projects/:projectId/issues/:issueId -> ApiResponse { data: Issue }
export const updateProjectIssue = async (projectId, issueId, issue) => {
    const res = await api.patch(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`,
        issue
    );
    return res.data.data;
};

// DELETE /projects/:projectId/issues/:issueId -> ApiResponse { data: {} }
export const deleteProjectIssue = async (projectId, issueId) => {
    const res = await api.delete(
        `/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`
    );
    return res.data.data;
};
