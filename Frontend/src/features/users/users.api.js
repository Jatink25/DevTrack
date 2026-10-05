import api from "../../api/axios.js";

// GET /users/search?query=... -> ApiResponse { data: User[] }
export const searchUsers = async (query, { signal } = {}) => {
    const res = await api.get("/users/search", {
        params: { query },
        signal,
    });
    return res.data.data;
};
