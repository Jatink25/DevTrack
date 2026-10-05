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

// GET /projects/:projectId/members -> ApiResponse { data: project members }
export const getProjectMembers = async (projectId, { signal } = {}) => {
    const res = await api.get(
        `/projects/${encodeURIComponent(projectId)}/members`,
        { signal }
    );
    return res.data.data;
};