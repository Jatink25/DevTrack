import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardError from "../features/dashboard/DashboardError.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import ProjectSectionNav from "../features/projects/ProjectSectionNav.jsx";
import {
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
} from "../features/projects/projects.api.js";
import { useProject } from "../features/projects/useProject.js";
import { useProjectMembers } from "../features/projects/useProjectMembers.js";
import { searchUsers } from "../features/users/users.api.js";
import { isCanceled } from "../lib/errorKind.js";
import { getErrorMessage } from "../lib/getErrorMessage.js";

const MEMBER_ROLES = ["Viewer", "Collaborator"];

function getId(value) {
    if (!value) return null;
    if (typeof value === "object") return value._id?.toString?.() ?? null;
    return value.toString();
}

function getMemberName(user) {
    if (user && typeof user === "object") {
        return user.username || user.email || "Unknown user";
    }
    return user ? `User ${getId(user)?.slice(-6)}` : "Unknown user";
}

function MembersLoading() {
    return (
        <div role="status" aria-label="Loading project members" className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
                >
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-24 rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

export default function ProjectMembersPage() {
    const { projectId } = useParams();
    const { user: currentUser } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [userQuery, setUserQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMemberRole, setNewMemberRole] = useState("Viewer");
    const [roleDrafts, setRoleDrafts] = useState({});
    const [pendingAction, setPendingAction] = useState("");
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchReloadKey, setSearchReloadKey] = useState(0);
    const [searchResult, setSearchResult] = useState(null);
    const {
        project,
        loading: projectLoading,
        error: projectError,
        refetch: refetchProject,
    } = useProject(projectId);
    const {
        members,
        loading: membersLoading,
        error: membersError,
        refetch: refetchMembers,
    } = useProjectMembers(projectId);
    const normalizedQuery = userQuery.trim();
    const searchKey = JSON.stringify([normalizedQuery, searchReloadKey]);

    useEffect(() => {
        if (normalizedQuery.length < 2) return undefined;

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            searchUsers(normalizedQuery, { signal: controller.signal })
                .then((users) =>
                    setSearchResult({ searchKey, users, error: null })
                )
                .catch((error) => {
                    if (!isCanceled(error)) {
                        setSearchResult({ searchKey, users: null, error });
                    }
                });
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [normalizedQuery, searchKey]);

    if (!projectId) {
        return (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                A project ID is required to view members.
            </p>
        );
    }

    const ownerId = getId(project?.owner);
    const isCurrentUserOwner = ownerId && ownerId === getId(currentUser?._id);
    const ownerName =
        project?.owner && typeof project.owner === "object"
            ? getMemberName(project.owner)
            : isCurrentUserOwner
              ? `${currentUser.username || currentUser.email} (you)`
              : ownerId
                ? `User ${ownerId.slice(-6)}`
                : "Project owner";
    const otherMembers = (members ?? []).filter(
        (member) => getId(member.user) !== ownerId
    );
    const isSearchCurrent = searchResult?.searchKey === searchKey;
    const searchLoading =
        normalizedQuery.length >= 2 && !isSearchCurrent;
    const searchError = isSearchCurrent ? searchResult.error : null;
    const searchUsersResult = isSearchCurrent ? searchResult.users ?? [] : [];
    const projectUserIds = new Set([
        ownerId,
        ...otherMembers.map((member) => getId(member.user)),
    ]);

    const runMemberAction = async (
        pendingKey,
        successText,
        fallbackMessages,
        callback
    ) => {
        setPendingAction(pendingKey);
        setActionError("");
        setSuccessMessage("");
        try {
            await callback();
            setSuccessMessage(successText);
            refetchMembers();
            return true;
        } catch (error) {
            setActionError(getErrorMessage(error, fallbackMessages));
            return false;
        } finally {
            setPendingAction("");
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();
        if (!selectedUser?._id || pendingAction) return;

        const added = await runMemberAction(
            "add",
            "Member added.",
            {
                400: "Select a user and a valid role.",
                401: "Your session has expired. Please sign in again.",
                403: "Only the project owner can add members.",
                404: "That user or project could not be found.",
                409: "That user is already a project member.",
            },
            () =>
                addProjectMember(projectId, {
                    memberId: selectedUser._id,
                    role: newMemberRole,
                })
        );

        if (added) {
            setUserQuery("");
            setSelectedUser(null);
            setNewMemberRole("Viewer");
            setIsAddOpen(false);
        }
    };

    const handleRoleUpdate = async (memberId) => {
        if (pendingAction || !memberId) return;
        const member = otherMembers.find(
            (existingMember) => getId(existingMember.user) === memberId
        );
        const role = roleDrafts[memberId] ?? member?.role;
        if (!member || !MEMBER_ROLES.includes(role) || role === member.role) {
            return;
        }

        const updated = await runMemberAction(
            `role:${memberId}`,
            "Member role updated.",
            {
                401: "Your session has expired. Please sign in again.",
                400: "Select a valid member role.",
                403: "Only the project owner can change member roles.",
            },
            () => updateProjectMemberRole(projectId, memberId, role)
        );
        if (updated) {
            setRoleDrafts((current) => {
                const next = { ...current };
                delete next[memberId];
                return next;
            });
        }
    };

    const handleRemoveMember = async (memberId, name) => {
        if (pendingAction || !memberId) return;
        if (!window.confirm(`Remove ${name} from this project?`)) return;

        const removed = await runMemberAction(
            `remove:${memberId}`,
            "Member removed.",
            {
                401: "Your session has expired. Please sign in again.",
                400: "This user is no longer a member of the project.",
                403: "Only the project owner can remove members.",
            },
            () => removeProjectMember(projectId, memberId)
        );
        if (removed) {
            setRoleDrafts((current) => {
                const next = { ...current };
                delete next[memberId];
                return next;
            });
        }
    };

    return (
        <main className="space-y-6">
            <ProjectSectionNav projectId={projectId} />

            <header>
                <p className="text-sm font-medium text-blue-700">
                    {project?.name || "Project workspace"}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    Members
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    People who can access this project.
                </p>
            </header>

            {projectError && (
                <DashboardError
                    error={projectError}
                    onRetry={refetchProject}
                    what="project details"
                />
            )}
            {membersError ? (
                <DashboardError
                    error={membersError}
                    onRetry={refetchMembers}
                    what="project members"
                />
            ) : membersLoading || projectLoading ? (
                <MembersLoading />
            ) : (
                <>
                    {actionError && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        >
                            {actionError}
                        </p>
                    )}
                    {successMessage && (
                        <p
                            role="status"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                            {successMessage}
                        </p>
                    )}

                    {isCurrentUserOwner && (
                        <div className="space-y-4">
                            {!isAddOpen ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionError("");
                                        setIsAddOpen(true);
                                    }}
                                    className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    Add Member
                                </button>
                            ) : (
                                <form
                                    onSubmit={handleAddMember}
                                    className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                                >
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            Add a member
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Search by username or email to add someone to this project.
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="project-member-search"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Search users
                                        </label>
                                        <input
                                            id="project-member-search"
                                            type="search"
                                            value={userQuery}
                                            onChange={(event) => {
                                                setUserQuery(event.target.value);
                                                setSelectedUser(null);
                                                setActionError("");
                                            }}
                                            disabled={Boolean(pendingAction)}
                                            placeholder="Username or email"
                                            autoComplete="off"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                        />
                                    </div>

                                    {normalizedQuery.length > 0 &&
                                        normalizedQuery.length < 2 && (
                                            <p className="text-sm text-gray-500">
                                                Enter at least 2 characters to search.
                                            </p>
                                        )}

                                    {searchLoading && (
                                        <p role="status" className="text-sm text-gray-500">
                                            Searching users...
                                        </p>
                                    )}

                                    {searchError && (
                                        <div
                                            role="alert"
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                                        >
                                            <p>{getErrorMessage(searchError)}</p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSearchReloadKey((key) => key + 1)
                                                }
                                                className="mt-2 cursor-pointer font-medium underline"
                                            >
                                                Retry search
                                            </button>
                                        </div>
                                    )}

                                    {normalizedQuery.length >= 2 &&
                                        !searchLoading &&
                                        !searchError &&
                                        searchUsersResult.length === 0 && (
                                            <p className="text-sm text-gray-500">
                                                No matching users found.
                                            </p>
                                        )}

                                    {searchUsersResult.length > 0 && (
                                        <ul
                                            aria-label="User search results"
                                            className="max-h-56 space-y-2 overflow-y-auto"
                                        >
                                            {searchUsersResult.map((result) => {
                                                const alreadyMember = projectUserIds.has(
                                                    getId(result)
                                                );
                                                const isSelected =
                                                    selectedUser?._id === getId(result);
                                                return (
                                                    <li key={getId(result)}>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                alreadyMember ||
                                                                Boolean(pendingAction)
                                                            }
                                                            onClick={() =>
                                                                setSelectedUser(result)
                                                            }
                                                            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                                isSelected
                                                                    ? "border-blue-300 bg-blue-50"
                                                                    : "border-gray-200 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-sm font-medium text-gray-900">
                                                                    {result.username}
                                                                </span>
                                                                <span className="block truncate text-xs text-gray-500">
                                                                    {result.email}
                                                                </span>
                                                            </span>
                                                            <span className="shrink-0 text-xs text-gray-500">
                                                                {alreadyMember
                                                                    ? "Already a member"
                                                                    : isSelected
                                                                      ? "Selected"
                                                                      : "Select"}
                                                            </span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {selectedUser && (
                                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                                            <p className="self-center text-sm text-gray-700">
                                                Selected:{" "}
                                                <span className="font-medium">
                                                    {selectedUser.username}
                                                </span>
                                            </p>
                                            <div>
                                                <label
                                                    htmlFor="new-project-member-role"
                                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                                >
                                                    Role
                                                </label>
                                                <select
                                                    id="new-project-member-role"
                                                    value={newMemberRole}
                                                    onChange={(event) =>
                                                        setNewMemberRole(event.target.value)
                                                    }
                                                    disabled={Boolean(pendingAction)}
                                                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                                                >
                                                    {MEMBER_ROLES.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                        <button
                                            type="button"
                                            disabled={Boolean(pendingAction)}
                                            onClick={() => {
                                                setIsAddOpen(false);
                                                setUserQuery("");
                                                setSelectedUser(null);
                                                setActionError("");
                                            }}
                                            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                !selectedUser ||
                                                Boolean(pendingAction)
                                            }
                                            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {pendingAction === "add"
                                                ? "Adding..."
                                                : "Add member"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <section aria-label="Project members" className="space-y-3">
                        <article className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-semibold text-gray-900">
                                    {ownerName}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Project owner
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Owner
                            </span>
                        </article>

                        {otherMembers.length ? (
                            otherMembers.map((member, index) => {
                                const memberId = getId(member.user);
                                const memberRole =
                                    roleDrafts[memberId] ?? member.role;
                                const roleChanged = memberRole !== member.role;
                                const memberName = getMemberName(member.user);
                                return (
                                    <article
                                        key={memberId || `${member.role}-${index}`}
                                        className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <h2 className="truncate text-sm font-semibold text-gray-900">
                                                {memberName}
                                            </h2>
                                            {member.user?.email && (
                                                <p className="mt-1 truncate text-xs text-gray-500">
                                                    {member.user.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {isCurrentUserOwner ? (
                                                <>
                                                    <select
                                                        aria-label={`Role for ${memberName}`}
                                                        value={memberRole}
                                                        disabled={Boolean(pendingAction)}
                                                        onChange={(event) =>
                                                            setRoleDrafts((current) => ({
                                                                ...current,
                                                                [memberId]: event.target.value,
                                                            }))
                                                        }
                                                        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                                                    >
                                                        {MEMBER_ROLES.map((role) => (
                                                            <option key={role} value={role}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {roleChanged && (
                                                        <button
                                                            type="button"
                                                            disabled={Boolean(pendingAction)}
                                                            onClick={() =>
                                                                handleRoleUpdate(memberId)
                                                            }
                                                            className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {pendingAction === `role:${memberId}`
                                                                ? "Saving..."
                                                                : "Save role"}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        disabled={Boolean(pendingAction)}
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                memberId,
                                                                memberName
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {pendingAction === `remove:${memberId}`
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                    {member.role}
                                                </span>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <p className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
                                No other members have been added to this project.
                            </p>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
