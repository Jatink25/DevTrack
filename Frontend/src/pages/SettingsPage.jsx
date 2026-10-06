import { Link, Navigate } from "react-router-dom";
import { readStoredProjectId } from "../features/dashboard/useSelectedProject.js";
import { useProjects } from "../features/projects/useProjects.js";
import DashboardError from "../features/dashboard/DashboardError.jsx";

export default function SettingsPage() {
    const { projects, loading, error, refetch } = useProjects();

    if (loading) {
        return (
            <div
                role="status"
                aria-label="Loading settings"
                className="animate-pulse space-y-4"
            >
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="h-32 rounded-xl bg-gray-200" />
            </div>
        );
    }

    if (error) {
        return (
            <main className="space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <DashboardError
                    error={error}
                    onRetry={refetch}
                    what="your projects"
                />
            </main>
        );
    }

    if (projects.length > 0) {
        const storedProjectId = readStoredProjectId();
        const selectedProject =
            projects.find((project) => project._id === storedProjectId) ??
            projects[0];

        return (
            <Navigate
                to={`/projects/${encodeURIComponent(selectedProject._id)}/settings`}
                replace
            />
        );
    }

    return (
        <main className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                    No project settings yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Create a project to manage its settings.
                </p>
                <Link
                    to="/projects"
                    className="mt-6 inline-block cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                    Go to Projects
                </Link>
            </div>
        </main>
    );
}
