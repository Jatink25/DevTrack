import { groupProjectsByStatus } from "../projects/projects.utils.js";

const BADGE_STYLES = {
    Active: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Archived: "bg-gray-200 text-gray-700",
};

// projects: sorted list from useProjects. Grouped by status via <optgroup>.
const ProjectSelector = ({ projects, selectedId, onSelect }) => {
    const groups = groupProjectsByStatus(projects);
    const selected = projects.find((project) => project._id === selectedId);

    return (
        <div className="flex items-center gap-3">
            <label
                htmlFor="dashboard-project"
                className="text-sm font-medium text-gray-700"
            >
                Project
            </label>

            <select
                id="dashboard-project"
                value={selectedId ?? ""}
                onChange={(e) => onSelect(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
                {groups.map(({ status, projects: items }) => (
                    <optgroup key={status} label={status}>
                        {items.map((project) => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>

            {selected && (
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        BADGE_STYLES[selected.status] ?? BADGE_STYLES.Archived
                    }`}
                >
                    {selected.status}
                </span>
            )}
        </div>
    );
};

export default ProjectSelector;
