import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getErrorMessage } from "../../lib/getErrorMessage.js";
import { updateProjectIssue } from "./issues.api.js";

const STATUSES = ["Todo", "In Progress", "Review", "Completed"];
const PRIORITIES = ["Low", "High", "Medium", "Critical"];

function getId(value) {
    if (!value) return "";
    if (typeof value === "object") return value._id?.toString?.() ?? "";
    return value.toString();
}

function getDateInputValue(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getUserLabel(person, fallback) {
    if (person && typeof person === "object") {
        return person.username || person.email || fallback;
    }
    return fallback;
}

export default function EditIssueModal({
    projectId,
    issue,
    project,
    members,
    onClose,
    onUpdated,
}) {
    const { user } = useAuth();
    const [title, setTitle] = useState(issue.title || "");
    const [description, setDescription] = useState(issue.description || "");
    const [status, setStatus] = useState(issue.status || "Todo");
    const [priority, setPriority] = useState(issue.priority || "Medium");
    const [assignedTo, setAssignedTo] = useState(getId(issue.assignedTo));
    const [dueDate, setDueDate] = useState(getDateInputValue(issue.dueDate));
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, submitting]);

    const ownerId = getId(project?.owner);
    const currentUserId = getId(user?._id);
    const ownerLabel = getUserLabel(
        project?.owner,
        ownerId
            ? `Project owner (${ownerId.slice(-6)})`
            : "Project owner"
    );
    const assigneeOptions = [
        {
            id: ownerId,
            label:
                ownerId && ownerId === currentUserId
                    ? `${user.username || user.email || "You"} (Project owner)`
                    : ownerLabel,
        },
        ...(members ?? []).map((member) => {
            const memberId = getId(member.user);
            return {
                id: memberId,
                label: getUserLabel(
                    member.user,
                    memberId ? `User ${memberId.slice(-6)}` : "Unknown user"
                ),
            };
        }),
    ].filter(
        (option, index, options) =>
            option.id && options.findIndex(({ id }) => id === option.id) === index
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;
        setError("");

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        if (!trimmedTitle || !trimmedDescription) {
            setError("Enter an issue title and description.");
            return;
        }

        setSubmitting(true);
        try {
            const updatedIssue = await updateProjectIssue(projectId, issue._id, {
                title: trimmedTitle,
                description: trimmedDescription,
                status,
                priority,
                assignedTo: assignedTo || null,
                dueDate: dueDate || null,
            });
            onUpdated(updatedIssue);
        } catch (requestError) {
            setError(
                getErrorMessage(requestError, {
                    400: "Check the issue details and selected assignee, then try again.",
                    401: "Your session has expired. Please sign in again.",
                    403: "You don't have permission to edit this issue.",
                    404: "This issue or project could not be found.",
                })
            );
            setSubmitting(false);
        }
    };

    const fieldClassName =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <button
                type="button"
                aria-label="Close edit issue dialog"
                disabled={submitting}
                onClick={onClose}
                className="absolute inset-0 cursor-pointer bg-gray-950/40 disabled:cursor-not-allowed"
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-issue-title"
                className="relative my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="edit-issue-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Edit issue
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Update the issue details and assignment.
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
                            htmlFor="edit-issue-title-field"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Title <span aria-hidden="true">*</span>
                        </label>
                        <input
                            autoFocus
                            id="edit-issue-title-field"
                            name="title"
                            type="text"
                            required
                            value={title}
                            disabled={submitting}
                            onChange={(event) => setTitle(event.target.value)}
                            className={fieldClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="edit-issue-description"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Description <span aria-hidden="true">*</span>
                        </label>
                        <textarea
                            id="edit-issue-description"
                            name="description"
                            rows={4}
                            required
                            value={description}
                            disabled={submitting}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            className={`${fieldClassName} resize-y`}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="edit-issue-status"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>
                            <select
                                id="edit-issue-status"
                                value={status}
                                disabled={submitting}
                                onChange={(event) => setStatus(event.target.value)}
                                className={`${fieldClassName} cursor-pointer`}
                            >
                                {STATUSES.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="edit-issue-priority"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Priority
                            </label>
                            <select
                                id="edit-issue-priority"
                                value={priority}
                                disabled={submitting}
                                onChange={(event) => setPriority(event.target.value)}
                                className={`${fieldClassName} cursor-pointer`}
                            >
                                {PRIORITIES.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="edit-issue-assignee"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Assignee
                            </label>
                            <select
                                id="edit-issue-assignee"
                                value={assignedTo}
                                disabled={submitting}
                                onChange={(event) =>
                                    setAssignedTo(event.target.value)
                                }
                                className={`${fieldClassName} cursor-pointer`}
                            >
                                <option value="">Unassigned</option>
                                {assigneeOptions.map(({ id, label }) => (
                                    <option key={id} value={id}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="edit-issue-due-date"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Due date
                            </label>
                            <input
                                id="edit-issue-due-date"
                                type="date"
                                value={dueDate}
                                disabled={submitting}
                                onChange={(event) => setDueDate(event.target.value)}
                                className={fieldClassName}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
