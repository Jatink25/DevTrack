import api from "../../api/axios.js";

// GET /projects -> ApiResponse { data: Project[] }
export const getProjects = async ({ signal } = {}) => {
    const res = await api.get("/projects", { signal });
    return res.data.data;
};