import { Link } from "react-router-dom";

const STATUS_STYLES = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Completed: "bg-blue-50 text-blue-700 ring-blue-700/10",
    Archived: "bg-gray-100 text-gray-600 ring-gray-500/10",
};

export default function ProjectCard({ project }) {
    const peopleCount = (project.members?.length ?? 0) + 1;

    return (
        <article className="flex min-h-56 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                    {project.name}
                </h2>
                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                        STATUS_STYLES[project.status] ??
                        "bg-gray-100 text-gray-600 ring-gray-500/10"
                    }`}
                >
                    {project.status}
                </span>
            </div>

            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">
                {project.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500">
                    {peopleCount} {peopleCount === 1 ? "person" : "people"}
                </p>
                <Link
                    to={`/projects/${encodeURIComponent(project._id)}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                >
                    Open project
                </Link>
            </div>
        </article>
    );
}
