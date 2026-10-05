import { useEffect, useState } from "react";
import { createProject } from "./projects.api.js";
import { getErrorMessage } from "../../lib/getErrorMessage.js";

export default function CreateProjectModal({ onClose, onCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, submitting]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const projectName = name.trim();
        const projectDescription = description.trim();
        if (!projectName || !projectDescription) {
            setError("Enter a project name and description.");
            return;
        }

        setSubmitting(true);
        try {
            await createProject({
                name: projectName,
                description: projectDescription,
            });
            onCreated();
        } catch (requestError) {
            setError(
                getErrorMessage(requestError, {
                    400: "Enter a project name and description.",
                })
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close create project dialog"
                disabled={submitting}
                onClick={onClose}
                className="absolute inset-0 cursor-pointer bg-gray-950/40 disabled:cursor-not-allowed"
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-title"
                className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="create-project-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Create a project
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Give your project a name and a short description.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        disabled={submitting}
                        onClick={onClose}
                        className="cursor-pointer rounded-md px-2 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                        >
                            {error}
                        </p>
                    )}

                    <div>
                        <label
                            htmlFor="project-name"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Project name
                        </label>
                        <input
                            autoFocus
                            id="project-name"
                            name="name"
                            type="text"
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Website redesign"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="project-description"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="project-description"
                            name="description"
                            required
                            rows={4}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="What is this project about?"
                            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Creating..." : "Create project"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
