import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useProjectMembers } from "../projects/useProjectMembers.js";
import { getErrorMessage } from "../../lib/getErrorMessage.js";
import { createProjectIssue } from "./issues.api.js";

const STATUSES = ["Todo", "In Progress", "Review", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const MAX_ATTACHMENTS = 5;

export default function CreateIssueModal({
    projectId,
    project,
    onClose,
    onCreated,
}) {
    const { user } = useAuth();
    const {
        members,
        loading: membersLoading,
        error: membersError,
        refetch: refetchMembers,
    } = useProjectMembers(projectId);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [status, setStatus] = useState("Todo");
    const [priority, setPriority] = useState("Medium");
    const [dueDate, setDueDate] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, submitting]);

    const projectOwnerId =
        typeof project?.owner === "string"
            ? project.owner
            : project?.owner?._id?.toString?.();
    const currentUserId = user?._id?.toString();
    const isCurrentUserOwner =
        projectOwnerId && currentUserId && projectOwnerId === currentUserId;

    const memberOptions = (members ?? [])
        .map((member) => {
            const memberUser =
                member.user && typeof member.user === "object"
                    ? member.user
                    : null;
            if (!memberUser?._id) return null;
            return {
                id: memberUser._id.toString(),
                label:
                    memberUser.username ||
                    memberUser.email ||
                    `User ${memberUser._id.toString().slice(-6)}`,
            };
        })
        .filter(Boolean);

    if (isCurrentUserOwner && !memberOptions.some(({ id }) => id === currentUserId)) {
        memberOptions.unshift({
            id: currentUserId,
            label: `${user.username || user.email || "You"} (Project owner)`,
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const issueTitle = title.trim();
        const issueDescription = description.trim();
        if (!issueTitle || !issueDescription) {
            setError("Enter an issue title and description.");
            return;
        }
        if (files.length > MAX_ATTACHMENTS) {
            setError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
            return;
        }

        setSubmitting(true);
        try {
            const createdIssue = await createProjectIssue(
                projectId,
                {
                    title: issueTitle,
                    description: issueDescription,
                    assignedTo,
                    status,
                    priority,
                    dueDate,
                },
                files
            );
            onCreated(createdIssue);
        } catch (requestError) {
            setError(
                getErrorMessage(requestError, {
                    400: "Check the issue details and selected assignee, then try again.",
                    403: "You don't have permission to create issues in this project.",
                })
            );
            setSubmitting(false);
        }
    };

    const fieldClassName =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <button
                type="button"
                aria-label="Close create issue dialog"
                disabled={submitting}
                onClick={onClose}
                className="absolute inset-0 cursor-pointer bg-gray-950/40 disabled:cursor-not-allowed"
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-issue-title"
                className="relative my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="create-issue-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Create an issue
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Add work to {project?.name || "this project"}.
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

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                            htmlFor="issue-title"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Title <span aria-hidden="true">*</span>
                        </label>
                        <input
                            autoFocus
                            id="issue-title"
                            name="title"
                            type="text"
                            required
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className={fieldClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="issue-description"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Description <span aria-hidden="true">*</span>
                        </label>
                        <textarea
                            id="issue-description"
                            name="description"
                            required
                            rows={4}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className={`${fieldClassName} resize-y`}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="issue-assignee"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Assigned to
                            </label>
                            <select
                                id="issue-assignee"
                                value={assignedTo}
                                onChange={(event) =>
                                    setAssignedTo(event.target.value)
                                }
                                disabled={membersLoading || Boolean(membersError)}
                                className={`${fieldClassName} cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-50`}
                            >
                                <option value="">Unassigned</option>
                                {memberOptions.map(({ id, label }) => (
                                    <option key={id} value={id}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {membersLoading && (
                                <p role="status" className="mt-1.5 text-xs text-gray-500">
                                    Loading project members...
                                </p>
                            )}
                            {membersError && (
                                <div role="alert" className="mt-1.5 text-xs text-red-700">
                                    <p>{getErrorMessage(membersError)}</p>
                                    <button
                                        type="button"
                                        onClick={refetchMembers}
                                        className="mt-1 cursor-pointer font-medium underline"
                                    >
                                        Retry loading members
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="issue-status"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>
                            <select
                                id="issue-status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className={`${fieldClassName} cursor-pointer`}
                            >
                                {STATUSES.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="issue-priority"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Priority
                            </label>
                            <select
                                id="issue-priority"
                                value={priority}
                                onChange={(event) => setPriority(event.target.value)}
                                className={`${fieldClassName} cursor-pointer`}
                            >
                                {PRIORITIES.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="issue-due-date"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Due date
                            </label>
                            <input
                                id="issue-due-date"
                                name="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(event) => setDueDate(event.target.value)}
                                className={fieldClassName}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="issue-attachments"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Attachments
                        </label>
                        <input
                            id="issue-attachments"
                            name="attachment"
                            type="file"
                            multiple
                            onChange={(event) => {
                                setFiles(Array.from(event.target.files ?? []));
                                setError("");
                            }}
                            className="block w-full text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                        />
                        <p className="mt-1.5 text-xs text-gray-500">
                            Up to {MAX_ATTACHMENTS} files. The server does not
                            configure file type or size restrictions.
                        </p>
                        {files.length > 0 && (
                            <p className="mt-1 text-xs text-gray-600">
                                {files.length} file{files.length === 1 ? "" : "s"} selected
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
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
                            disabled={submitting || membersLoading}
                            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Creating..." : "Create issue"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
