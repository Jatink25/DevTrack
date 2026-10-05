import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardError from "../features/dashboard/DashboardError.jsx";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import { useProject } from "../features/projects/useProject.js";
import IssueCard from "../features/issues/IssueCard.jsx";
import { useProjectIssues } from "../features/issues/useProjectIssues.js";
import CreateIssueModal from "../features/issues/CreateIssueModal.jsx";

const STATUSES = ["Todo", "In Progress", "Review", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

function IssueListSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading issues"
            className="space-y-3"
        >
            {Array.from({ length: 4 }, (_, index) => (
                <div
                    key={index}
                    className="h-36 animate-pulse rounded-xl border border-gray-200 bg-white p-5"
                >
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="mt-4 h-3 w-4/5 rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

export default function ProjectIssuesPage() {
    const { projectId } = useParams();
    const [searchInput, setSearchInput] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newlyCreatedIssue, setNewlyCreatedIssue] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        priority: "",
        page: 1,
    });

    const {
        project,
        loading: projectLoading,
        error: projectError,
        refetch: refetchProject,
    } = useProject(projectId);
    const {
        data,
        error: issuesError,
        loading: issuesLoading,
        refetch,
    } = useProjectIssues(projectId, filters);

    const updateFilter = (key, value) => {
        setNewlyCreatedIssue(null);
        setFilters((current) => ({ ...current, [key]: value, page: 1 }));
    };

    const handleSearchChange = (value) => {
        setSearchInput(value);
        updateFilter("search", value.trim());
    };

    const issues = data?.issues ?? [];
    const currentPage = data?.currentPage ?? 1;
    const totalPages = data?.totalPages ?? 0;
    const totalIssues = data?.totalIssues ?? 0;
    const hasFilters = Boolean(filters.search || filters.status || filters.priority);
    const shouldShowCreatedIssue =
        newlyCreatedIssue?.projectId === projectId &&
        (!filters.status || filters.status === newlyCreatedIssue.issue.status) &&
        (!filters.priority || filters.priority === newlyCreatedIssue.issue.priority) &&
        (!filters.search ||
            newlyCreatedIssue.issue.title
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()));
    const visibleIssues =
        shouldShowCreatedIssue &&
        !issues.some((issue) => issue._id === newlyCreatedIssue.issue._id)
            ? [newlyCreatedIssue.issue, ...issues]
            : issues;
    const filteredEmpty =
        !issuesLoading && !issuesError && visibleIssues.length === 0 && hasFilters;
    const empty =
        !issuesLoading && !issuesError && visibleIssues.length === 0 && !hasFilters;

    const handleIssueCreated = (issue) => {
        setIsCreateOpen(false);
        setSearchInput("");
        setNewlyCreatedIssue(issue?._id ? { projectId, issue } : null);
        setFilters({
            search: "",
            status: issue?.status || "",
            priority: issue?.priority || "",
            page: 1,
        });
        refetch();
    };

    if (!projectId) {
        return (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                A project ID is required to view issues.
            </p>
        );
    }

    return (
        <main className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to={`/projects/${encodeURIComponent(projectId)}`}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                >
                    <span aria-hidden="true">←</span>
                    {projectLoading ? "Project" : project?.name || "Project overview"}
                </Link>
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                    Create Issue
                </button>
            </div>

            <header>
                <p className="text-sm font-medium text-blue-700">
                    {project?.name || "Project workspace"}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    Issues
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Track and find work assigned to this project.
                </p>
            </header>

            <ProjectSectionNav projectId={projectId} />

            {projectError && (
                <DashboardError
                    error={projectError}
                    what="the project details"
                    onRetry={refetchProject}
                />
            )}

            <section
                aria-label="Issue filters"
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_200px]">
                    <label className="block">
                        <span className="sr-only">Search issue titles</span>
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            placeholder="Search issue titles..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <span className="shrink-0 text-sm text-gray-600">Status</span>
                        <select
                            value={filters.status}
                            onChange={(event) => updateFilter("status", event.target.value)}
                            className="min-w-0 flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All</option>
                            {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex items-center gap-2">
                        <span className="shrink-0 text-sm text-gray-600">Priority</span>
                        <select
                            value={filters.priority}
                            onChange={(event) => updateFilter("priority", event.target.value)}
                            className="min-w-0 flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All</option>
                            {PRIORITIES.map((priority) => (
                                <option key={priority} value={priority}>
                                    {priority}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            {issuesLoading ? (
                <IssueListSkeleton />
            ) : issuesError ? (
                <DashboardError
                    error={issuesError}
                    onRetry={refetch}
                    what="project issues"
                />
            ) : empty || filteredEmpty ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {filteredEmpty ? "No matching issues" : "No issues yet"}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                        {filteredEmpty
                            ? "Try changing your search or clearing one of the filters."
                            : "Issues created in this project will appear here."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-gray-600">
                            {totalIssues} {totalIssues === 1 ? "issue" : "issues"}
                        </p>
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                    </div>
                    <div className="space-y-3">
                        {visibleIssues.map((issue) => (
                            <IssueCard
                                key={issue._id}
                                issue={issue}
                                projectId={projectId}
                            />
                        ))}
                    </div>
                    <nav
                        aria-label="Issue pagination"
                        className="flex items-center justify-between border-t border-gray-200 pt-4"
                    >
                        <button
                            type="button"
                            disabled={currentPage <= 1 || issuesLoading}
                            onClick={() =>
                                setFilters((current) => ({
                                    ...current,
                                    page: Math.max(1, currentPage - 1),
                                }))
                            }
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={
                                totalPages === 0 ||
                                currentPage >= totalPages ||
                                issuesLoading
                            }
                            onClick={() =>
                                setFilters((current) => ({
                                    ...current,
                                    page: Math.min(totalPages, currentPage + 1),
                                }))
                            }
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </>
            )}

            {isCreateOpen && (
                <CreateIssueModal
                    projectId={projectId}
                    project={project}
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={handleIssueCreated}
                />
            )}
        </main>
    );
}
