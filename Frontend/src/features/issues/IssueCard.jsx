import { Link } from "react-router-dom";

const STATUS_STYLES = {
    Todo: "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Review: "bg-amber-50 text-amber-700",
    Completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES = {
    Low: "bg-gray-100 text-gray-600",
    Medium: "bg-sky-50 text-sky-700",
    High: "bg-orange-50 text-orange-700",
    Critical: "bg-red-50 text-red-700",
};

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const getAssigneeName = (assignedTo) => {
    if (!assignedTo) return "Unassigned";
    if (typeof assignedTo === "string") return `User ${assignedTo.slice(-6)}`;
    return assignedTo.username || assignedTo.email || "Assigned";
};

export default function IssueCard({ issue, projectId }) {
    const dueDate = formatDate(issue.dueDate);
    const createdDate = formatDate(issue.createdAt);

    return (
        <Link
            to={`/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issue._id)}`}
            className="block cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900">
                        {issue.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {issue.description}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {issue.status || "Unknown status"}
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            PRIORITY_STYLES[issue.priority] ??
                            "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {issue.priority || "Unknown priority"}
                    </span>
                </div>
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-3 text-xs">
                <div className="flex gap-1.5">
                    <dt className="text-gray-500">Assigned to</dt>
                    <dd className="font-medium text-gray-700">
                        {getAssigneeName(issue.assignedTo)}
                    </dd>
                </div>
                {dueDate && (
                    <div className="flex gap-1.5">
                        <dt className="text-gray-500">Due</dt>
                        <dd className="font-medium text-gray-700">{dueDate}</dd>
                    </div>
                )}
                {createdDate && (
                    <div className="flex gap-1.5">
                        <dt className="text-gray-500">Created</dt>
                        <dd className="font-medium text-gray-700">{createdDate}</dd>
                    </div>
                )}
            </dl>
        </Link>
    );
}
