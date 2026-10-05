import { useParams } from "react-router-dom";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import { useProjectActivity } from "../features/activity/useProjectActivity.js";
import DashboardError from "../features/dashboard/DashboardError.jsx";

function formatTimestamp(value) {
    if (!value) return "Time unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Time unavailable";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getActorName(user) {
    if (user && typeof user === "object") {
        return user.username || user.email || "Unknown user";
    }
    return "Unknown user";
}

function ActivityLoading() {
    return (
        <div role="status" aria-label="Loading activity" className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
                >
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
                    <div className="mt-3 h-3 w-32 rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

function ActivityItem({ activity }) {
    return (
        <li className="relative pl-8">
            <span
                aria-hidden="true"
                className="absolute left-0 top-5 h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
            />
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            <span>{getActorName(activity.user)}</span>
                            {activity.action && (
                                <span className="font-medium text-gray-600">
                                    {" — "}
                                    {activity.action}
                                </span>
                            )}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {activity.description || "No description provided."}
                        </p>
                        {activity.issue?.title && (
                            <p className="mt-3 inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Issue: {activity.issue.title}
                            </p>
                        )}
                    </div>
                    <time
                        dateTime={activity.createdAt || undefined}
                        className="shrink-0 text-xs text-gray-500"
                    >
                        {formatTimestamp(activity.createdAt)}
                    </time>
                </div>
            </article>
        </li>
    );
}

export default function ProjectActivityPage() {
    const { projectId } = useParams();
    const { activities, loading, error, refetch } =
        useProjectActivity(projectId);

    if (!projectId) {
        return (
            <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
                A project ID is required to view activity.
            </p>
        );
    }

    return (
        <main className="space-y-6">
            <ProjectSectionNav projectId={projectId} />

            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    Activity
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Recent activity in this project.
                </p>
            </header>

            {loading ? (
                <ActivityLoading />
            ) : error ? (
                <DashboardError
                    error={error}
                    onRetry={refetch}
                    what="project activity"
                />
            ) : activities?.length ? (
                <ol className="relative space-y-4 before:absolute before:bottom-5 before:left-[5px] before:top-5 before:border-l before:border-gray-200">
                    {activities.map((activity) => (
                        <ActivityItem
                            key={activity._id}
                            activity={activity}
                        />
                    ))}
                </ol>
            ) : (
                <section className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                    <h2 className="font-semibold text-gray-900">
                        No activity yet
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Project updates and issue discussions will appear here.
                    </p>
                </section>
            )}
        </main>
    );
}
