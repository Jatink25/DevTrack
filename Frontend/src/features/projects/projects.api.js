import api from "../../api/axios.js";

// GET /projects -> ApiResponse { data: Project[] }
export const getProjects = async ({ signal } = {}) => {
    const res = await api.get("/projects", { signal });
    return res.data.data;
};

// POST /projects -> ApiResponse { data: Project }
export const createProject = async (data) => {
    const res = await api.post("/projects", data);
    return res.data.data;
};

// GET /projects/:projectId -> ApiResponse { data: Project }
export const getProjectById = async (projectId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}`,
        { signal }
    );
    return res.data.data;
};

// PATCH /projects/:projectId -> ApiResponse { data: Project }
export const updateProject = async (projectId, data) => {
    const res = await api.patch(
        `/projects/${encodeURIComponent(projectId)}`,
        data
    );
    return res.data.data;
};

// GET /projects/:projectId/members -> ApiResponse { data: project members }
export const getProjectMembers = async (projectId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/members`,
        { signal }
    );
    return res.data.data;
};

// POST /projects/:projectId/members -> ApiResponse { data: Project }
export const addProjectMember = async (projectId, member) => {
    const res = await api.post(
        `/projects/${encodeURIComponent(projectId)}/members`,
        member
    );
    return res.data.data;
};

// DELETE /projects/:projectId/members -> ApiResponse { data: Project }
export const removeProjectMember = async (projectId, memberId) => {
    const res = await api.delete(
        `/projects/${encodeURIComponent(projectId)}/members`,
        { data: { memberId } }
    );
    return res.data.data;
};

// PATCH /projects/:projectId/members/:memberId -> ApiResponse { data: Project }
export const updateProjectMemberRole = async (projectId, memberId, role) => {
    const res = await api.patch(
        `/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(memberId)}`,
        { role }
    );
    return res.data.data;
};