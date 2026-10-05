import { NavLink } from "react-router-dom";

const SECTIONS = [
    { label: "Overview", suffix: "" },
    { label: "Issues", suffix: "/issues" },
    { label: "Members", suffix: "/members" },
    { label: "Activity", suffix: "/activity" },
    { label: "Settings", suffix: "/settings" },
];

export default function ProjectSectionNav({ projectId }) {
    const basePath = `/projects/${encodeURIComponent(projectId)}`;

    return (
        <nav
            aria-label="Project sections"
            className="overflow-x-auto border-b border-gray-200"
        >
            <div className="flex min-w-max gap-1">
                {SECTIONS.map(({ label, suffix }) => (
                    <NavLink
                        key={label}
                        to={`${basePath}${suffix}`}
                        end={suffix === ""}
                        className={({ isActive }) =>
                            `border-b-2 px-4 py-3 text-sm font-medium transition ${
                                isActive
                                    ? "border-blue-600 text-blue-700"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
