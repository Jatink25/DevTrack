import { Link, useParams } from "react-router-dom";
import DashboardError from "../features/dashboard/DashboardError.jsx";
import { useProjectStats } from "../features/dashboard/useProjectStats.js";
import ProjectIssueSummary from "../features/projects/ProjectIssueSummary.jsx";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import BackLink from "../components/ui/BackLink.jsx";
import { useProject } from "../features/projects/useProject.js";
import { useAuth } from "../features/auth/AuthContext.jsx";

const STATUS_STYLES = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Completed: "bg-blue-50 text-blue-700 ring-blue-700/10",
    Archived: "bg-gray-100 text-gray-600 ring-gray-500/10",
};

function formatCreatedDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

function getOwnerLabel(owner, currentUser) {
    if (owner && typeof owner === "object") {
        if (owner.username) return owner.username;
        if (owner.email) return owner.email;
    }

    const ownerId =
        typeof owner === "string" ? owner : owner?._id?.toString?.();
    if (!ownerId) return "Unknown";
    if (currentUser?._id?.toString() === ownerId) {
        return `${currentUser.username || currentUser.email} (you)`;
    }
    return `User ${ownerId.slice(-6)}`;
}

function ProjectOverviewLoading() {
    return (
        <div role="status" aria-label="Loading project" className="animate-pulse space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-4 h-8 w-1/2 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
            </div>
            <div className="h-12 rounded-lg bg-gray-200" />
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-56 rounded-xl bg-gray-200" />
                <div className="h-56 rounded-xl bg-gray-200" />
            </div>
        </div>
    );
}

function QuickActions({ projectId }) {
    const basePath = `/projects/${encodeURIComponent(projectId)}`;
    const actions = [
        { label: "View Issues", to: `${basePath}/issues` },
        { label: "View Members", to: `${basePath}/members` },
        { label: "View Activity", to: `${basePath}/activity` },
    ];

    return (
        <section
            aria-labelledby="quick-actions-title"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
            <h2 id="quick-actions-title" className="font-semibold text-gray-900">
                Quick actions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
                Jump to another area of this project.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
                {actions.map(({ label, to }) => (
                    <Link
                        key={label}
                        to={to}
                        className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default function ProjectOverviewPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const {
        project,
        loading: projectLoading,
        error: projectError,
        refetch: refetchProject,
    } = useProject(projectId);
    const {
        stats,
        loading: statsLoading,
        error: statsError,
        refetch: refetchStats,
    } = useProjectStats(projectId);

    if (!projectId) {
        return (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                A project ID is required to open this page.
            </p>
        );
    }

    if (projectLoading) return <ProjectOverviewLoading />;
    if (projectError) {
        return (
            <DashboardError
                error={projectError}
                onRetry={refetchProject}
                what="this project"
            />
        );
    }
    if (!project) return null;

    const createdDate = formatCreatedDate(project.createdAt);
    const memberCount = Array.isArray(project.members) ? project.members.length : 0;

    return (
        <main className="space-y-6">
            <BackLink
                to="/projects"
            >
                Back to Projects
            </BackLink>

            <header className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="break-words text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                {project.name}
                            </h1>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                    STATUS_STYLES[project.status] ??
                                    "bg-gray-100 text-gray-600 ring-gray-500/10"
                                }`}
                            >
                                {project.status || "Unknown"}
                            </span>
                        </div>
                        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-gray-600">
                            {project.description}
                        </p>
                    </div>
                    <Link
                        to={`/projects/${encodeURIComponent(projectId)}/issues`}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                        View issues
                    </Link>
                </div>

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-gray-100 pt-5">
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Owner
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                            {getOwnerLabel(project.owner, user)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Members
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                        </dd>
                    </div>
                    {createdDate && (
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Created
                            </dt>
                            <dd className="mt-1 text-sm font-medium text-gray-900">
                                {createdDate}
                            </dd>
                        </div>
                    )}
                </dl>
            </header>

            <ProjectSectionNav projectId={projectId} />

            <div className="space-y-7">
                {statsLoading ? (
                    <section role="status" aria-label="Loading issue summary">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="h-56 animate-pulse rounded-xl bg-gray-200" />
                            <div className="h-56 animate-pulse rounded-xl bg-gray-200" />
                        </div>
                    </section>
                ) : statsError ? (
                    <DashboardError
                        error={statsError}
                        onRetry={refetchStats}
                        what="the issue summary"
                    />
                ) : (
                    stats && <ProjectIssueSummary stats={stats} />
                )}

                <QuickActions projectId={projectId} />
            </div>
        </main>
    );
}
