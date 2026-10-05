import { Link, useParams } from "react-router-dom";
import { useProjectIssue } from "../features/issues/useProjectIssue.js";
import { useProject } from "../features/projects/useProject.js";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import { getErrorMessage } from "../lib/getErrorMessage.js";
import IssueComments from "../features/issues/IssueComments.jsx";

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

function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

function getPersonLabel(person) {
    if (!person) return "Unassigned";
    if (typeof person === "object") {
        if (person.username) return person.username;
        if (person.email) return person.email;
        if (person._id) return `User ${person._id.toString().slice(-6)}`;
        return "Unknown user";
    }

    return `User ${person.toString().slice(-6)}`;
}

function isMongoId(value) {
    return /^[a-f\d]{24}$/i.test(value || "");
}

function IssueDetailsSkeleton() {
    return (
        <div role="status" aria-label="Loading issue" className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="h-7 w-1/2 rounded bg-gray-200" />
                <div className="mt-5 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="h-16 rounded bg-gray-100" />
                    <div className="h-16 rounded bg-gray-100" />
                </div>
            </div>
        </div>
    );
}

function IssueDetailsError({ error, onRetry }) {
    const status = error?.response?.status;
    const message =
        status === 404
            ? "This issue could not be found. It may have been deleted or the link may be incorrect."
            : status === 400
              ? "The issue link is invalid. Check the project and issue IDs."
              : getErrorMessage(error, {
                    403: "You don't have access to this project.",
                });
    const canRetry = status !== 400 && status !== 403 && status !== 404;

    return (
        <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
            <p>{message}</p>
            {canRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 cursor-pointer rounded-lg bg-red-700 px-4 py-2 font-medium text-white transition hover:bg-red-800"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

function IssuePerson({ label, person }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
                {getPersonLabel(person)}
            </dd>
        </div>
    );
}

export default function IssueDetailsPage() {
    const { projectId, issueId } = useParams();
    const hasValidIds = isMongoId(projectId) && isMongoId(issueId);
    const {
        issue,
        loading,
        error,
        refetch,
    } = useProjectIssue(
        hasValidIds ? projectId : null,
        hasValidIds ? issueId : null
    );
    const { project } = useProject(hasValidIds ? projectId : null);

    if (!hasValidIds) {
        return (
            <main className="space-y-6">
                <Link
                    to={
                        projectId
                            ? `/projects/${encodeURIComponent(projectId)}/issues`
                            : "/projects"
                    }
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <span aria-hidden="true">←</span>
                    Back to Issues
                </Link>
                <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
                >
                    This issue link is invalid. A valid project and issue ID are
                    required.
                </p>
            </main>
        );
    }

    const issuesPath = `/projects/${encodeURIComponent(projectId)}/issues`;

    if (loading) return <IssueDetailsSkeleton />;
    if (error) {
        return (
            <main className="space-y-6">
                <Link
                    to={issuesPath}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <span aria-hidden="true">←</span>
                    Back to Issues
                </Link>
                <IssueDetailsError error={error} onRetry={refetch} />
            </main>
        );
    }
    if (!issue) {
        return (
            <main className="space-y-6">
                <Link
                    to={issuesPath}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <span aria-hidden="true">←</span>
                    Back to Issues
                </Link>
                <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
                >
                    Issue details are unavailable.
                </p>
            </main>
        );
    }

    const dueDate = formatDate(issue.dueDate);
    const createdDate = formatDate(issue.createdAt);
    const attachments = Array.isArray(issue.attachments) ? issue.attachments : [];

    return (
        <main className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to={issuesPath}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <span aria-hidden="true">←</span>
                    Back to Issues
                </Link>
                <Link
                    to={`/projects/${encodeURIComponent(projectId)}`}
                    className="cursor-pointer text-sm font-medium text-blue-700 transition hover:text-blue-900"
                >
                    {project?.name || "Project overview"}
                </Link>
            </div>

            <ProjectSectionNav projectId={projectId} />

            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <header className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-700">
                            {project?.name || "Project issue"}
                        </p>
                        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                            {issue.title}
                        </h1>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                STATUS_STYLES[issue.status] ||
                                "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {issue.status || "Unknown status"}
                        </span>
                        <span
                            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                PRIORITY_STYLES[issue.priority] ||
                                "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {issue.priority || "Unknown priority"}
                        </span>
                    </div>
                </header>

                <section className="py-6" aria-labelledby="issue-description-heading">
                    <h2
                        id="issue-description-heading"
                        className="text-sm font-semibold text-gray-900"
                    >
                        Description
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                        {issue.description || "No description provided."}
                    </p>
                </section>

                <dl className="grid gap-x-8 gap-y-5 border-t border-gray-100 py-6 sm:grid-cols-2 lg:grid-cols-4">
                    <IssuePerson label="Created by" person={issue.createdBy} />
                    <IssuePerson label="Assigned to" person={issue.assignedTo} />
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Due date
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                            {dueDate || "No due date"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Created
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                            {createdDate || "Date unavailable"}
                        </dd>
                    </div>
                </dl>

                <section
                    aria-labelledby="issue-attachments-heading"
                    className="border-t border-gray-100 pt-6"
                >
                    <h2
                        id="issue-attachments-heading"
                        className="text-sm font-semibold text-gray-900"
                    >
                        Attachments
                    </h2>
                    {attachments.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-500">
                            No attachments for this issue.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {attachments.map((attachment, index) => {
                                if (!attachment?.url) return null;
                                const fileName =
                                    attachment.publicId?.split("/").pop() ||
                                    `Attachment ${index + 1}`;
                                return (
                                    <li key={attachment.publicId || attachment.url}>
                                        <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex cursor-pointer items-center gap-2 break-all rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                                        >
                                            <span aria-hidden="true">↗</span>
                                            {fileName}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </article>

            <IssueComments
                projectId={projectId}
                issueId={issueId}
                projectOwner={project?.owner}
            />
        </main>
    );
}
