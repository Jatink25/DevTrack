// Display order for project statuses (matches the Project model enum)
export const PROJECT_STATUS_ORDER = ["Active", "Completed", "Archived"];

const statusRank = (status) => {
    const index = PROJECT_STATUS_ORDER.indexOf(status);
    return index === -1 ? PROJECT_STATUS_ORDER.length : index;
};

// Active -> Completed -> Archived, then by name inside each group
export const sortProjects = (projects = []) =>
    [...projects].sort(
        (a, b) =>
            statusRank(a.status) - statusRank(b.status) ||
            a.name.localeCompare(b.name)
    );

// For the selector's <optgroup>s: [{ status, projects }], empty groups removed
export const groupProjectsByStatus = (projects = []) =>
    PROJECT_STATUS_ORDER.map((status) => ({
        status,
        projects: projects.filter((project) => project.status === status),
    })).filter((group) => group.projects.length > 0);