import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getErrorMessage } from "../../lib/getErrorMessage.js";
import {
    createIssueComment,
    deleteIssueComment,
} from "./comments.api.js";
import { useIssueComments } from "./useIssueComments.js";

function getId(value) {
    if (!value) return null;
    if (typeof value === "object") {
        return value._id?.toString?.() ?? null;
    }
    return value.toString();
}

function getCommenterName(createdBy) {
    if (createdBy && typeof createdBy === "object") {
        return (
            createdBy.username ||
            createdBy.email ||
            (getId(createdBy) ? `User ${getId(createdBy).slice(-6)}` : "Unknown user")
        );
    }
    const id = getId(createdBy);
    return id ? `User ${id.slice(-6)}` : "Unknown user";
}

function formatCommentDate(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function CommentsLoading() {
    return (
        <div role="status" aria-label="Loading comments" className="space-y-3">
            {Array.from({ length: 2 }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-lg border border-gray-100 p-4"
                >
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

export default function IssueComments({
    projectId,
    issueId,
    projectOwner,
}) {
    const { user } = useAuth();
    const { comments, loading, error, refetch } = useIssueComments(
        projectId,
        issueId
    );
    const [content, setContent] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const currentUserId = getId(user?._id);
    const projectOwnerId = getId(projectOwner);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedContent = content.trim();
        setFormError("");

        if (!trimmedContent) {
            setFormError("Write a comment before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            await createIssueComment(projectId, issueId, trimmedContent);
            setContent("");
            refetch();
        } catch (requestError) {
            setFormError(
                getErrorMessage(requestError, {
                    400: "Write a comment before submitting.",
                    403: "You don't have permission to add comments to this issue.",
                })
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        setDeletingId(commentId);
        setDeleteError("");
        try {
            await deleteIssueComment(projectId, issueId, commentId);
            refetch();
        } catch (requestError) {
            setDeleteError(
                getErrorMessage(requestError, {
                    403: "You can only delete your own comments unless you own this project.",
                    404: "This comment may already have been deleted.",
                })
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section
            aria-labelledby="issue-comments-heading"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
            <div className="flex items-baseline justify-between gap-3">
                <h2
                    id="issue-comments-heading"
                    className="text-lg font-semibold text-gray-900"
                >
                    Comments
                </h2>
                {!loading && !error && (
                    <span className="text-sm text-gray-500">
                        {comments?.length ?? 0}
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
                <label
                    htmlFor="new-issue-comment"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    Add a comment
                </label>
                <textarea
                    id="new-issue-comment"
                    rows={3}
                    value={content}
                    onChange={(event) => {
                        setContent(event.target.value);
                        if (formError) setFormError("");
                    }}
                    placeholder="Share an update or ask a question..."
                    disabled={submitting}
                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
                {formError && (
                    <p role="alert" className="mt-2 text-sm text-red-700">
                        {formError}
                    </p>
                )}
                <div className="mt-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Posting..." : "Post comment"}
                    </button>
                </div>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-5">
                {deleteError && (
                    <p role="alert" className="mb-4 text-sm text-red-700">
                        {deleteError}
                    </p>
                )}
                {loading ? (
                    <CommentsLoading />
                ) : error ? (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <p>{getErrorMessage(error)}</p>
                        <button
                            type="button"
                            onClick={refetch}
                            className="mt-3 cursor-pointer font-medium underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : comments?.length ? (
                    <ul className="space-y-3">
                        {comments.map((comment) => {
                            const commentId = getId(comment._id);
                            const isCommentAuthor =
                                currentUserId &&
                                getId(comment.createdBy) === currentUserId;
                            const isProjectOwner =
                                currentUserId &&
                                projectOwnerId === currentUserId;
                            const canDelete =
                                Boolean(isCommentAuthor || isProjectOwner) &&
                                Boolean(commentId);

                            return (
                                <li
                                    key={commentId || `${comment.createdAt}-${comment.content}`}
                                    className="rounded-lg border border-gray-100 bg-gray-50/70 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {getCommenterName(comment.createdBy)}
                                            </p>
                                            <time
                                                dateTime={comment.createdAt || undefined}
                                                className="mt-1 block text-xs text-gray-500"
                                            >
                                                {formatCommentDate(comment.createdAt)}
                                            </time>
                                        </div>
                                        {canDelete && (
                                            <button
                                                type="button"
                                                disabled={deletingId === commentId}
                                                onClick={() =>
                                                    handleDelete(commentId)
                                                }
                                                className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {deletingId === commentId
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                                        {comment.content}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                        No comments yet. Start the conversation.
                    </p>
                )}
            </div>
        </section>
    );
}
