import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardError from "../features/dashboard/DashboardError.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import { updateProject } from "../features/projects/projects.api.js";
import { useProject } from "../features/projects/useProject.js";
import { getErrorMessage } from "../lib/getErrorMessage.js";

const STATUSES = ["Active", "Completed", "Archived"];

export default function ProjectSettingsPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const {
        project,
        loading,
        error,
        refetch,
    } = useProject(projectId);
    const [name, setName] = useState(null);
    const [description, setDescription] = useState(null);
    const [status, setStatus] = useState(null);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saving, setSaving] = useState(false);

    if (!projectId) {
        return (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                A project ID is required to open settings.
            </p>
        );
    }

    if (loading) {
        return (
            <div role="status" aria-label="Loading project settings" className="animate-pulse space-y-4">
                <div className="h-8 w-48 rounded bg-gray-200" />
                <div className="h-72 rounded-xl bg-gray-200" />
            </div>
        );
    }

    if (error) {
        return (
            <main className="space-y-6">
                <ProjectSectionNav projectId={projectId} />
                <DashboardError
                    error={error}
                    onRetry={refetch}
                    what="project settings"
                />
            </main>
        );
    }

    if (!project) return null;

    const projectOwnerId =
        typeof project.owner === "object"
            ? project.owner?._id?.toString?.()
            : project.owner?.toString?.();
    const isOwner = projectOwnerId === user?._id?.toString();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving) return;

        setFormError("");
        setSuccessMessage("");
        const updatedName = (name ?? project.name).trim();
        const updatedDescription = (description ?? project.description).trim();

        if (!updatedName || !updatedDescription) {
            setFormError("Project name and description cannot be empty.");
            return;
        }

        setSaving(true);
        try {
            await updateProject(projectId, {
                name: updatedName,
                description: updatedDescription,
                status: status ?? project.status,
            });
            setName(updatedName);
            setDescription(updatedDescription);
            setStatus(status ?? project.status);
            setSuccessMessage("Project settings saved.");
            refetch();
        } catch (requestError) {
            setFormError(
                getErrorMessage(requestError, {
                    401: "Your session has expired. Please sign in again.",
                    403: "Only the project owner can update project settings.",
                    404: "This project could not be found.",
                })
            );
        } finally {
            setSaving(false);
        }
    };

    const fieldClassName =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50";

    return (
        <main className="space-y-6">
            <ProjectSectionNav projectId={projectId} />

            <header>
                <p className="text-sm font-medium text-blue-700">{project.name}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    Settings
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Update this project&apos;s basic information.
                </p>
            </header>

            {!isOwner && (
                <p
                    role="note"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                    Only the project owner can update these settings.
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
            >
                {formError && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    >
                        {formError}
                    </p>
                )}
                {successMessage && (
                    <p
                        role="status"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                    >
                        {successMessage}
                    </p>
                )}

                <div>
                    <label
                        htmlFor="project-settings-name"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Project name
                    </label>
                    <input
                        id="project-settings-name"
                        value={name ?? project.name}
                        disabled={!isOwner || saving}
                        onChange={(event) => setName(event.target.value)}
                        className={fieldClassName}
                    />
                </div>

                <div>
                    <label
                        htmlFor="project-settings-description"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="project-settings-description"
                        rows={4}
                        value={description ?? project.description}
                        disabled={!isOwner || saving}
                        onChange={(event) => setDescription(event.target.value)}
                        className={`${fieldClassName} resize-y`}
                    />
                </div>

                <div>
                    <label
                        htmlFor="project-settings-status"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>
                    <select
                        id="project-settings-status"
                        value={status ?? project.status}
                        disabled={!isOwner || saving}
                        onChange={(event) => setStatus(event.target.value)}
                        className={`${fieldClassName} cursor-pointer disabled:cursor-not-allowed`}
                    >
                        {STATUSES.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>

                {isOwner && (
                    <div className="flex justify-end border-t border-gray-100 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                )}
            </form>
        </main>
    );
}
