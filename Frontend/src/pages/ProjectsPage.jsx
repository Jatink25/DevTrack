import { useState } from "react";
import CreateProjectModal from "../features/projects/CreateProjectModal.jsx";
import ProjectCard from "../features/projects/ProjectCard.jsx";
import { useProjects } from "../features/projects/useProjects.js";
import { getErrorMessage } from "../lib/getErrorMessage.js";

function ProjectsLoadingState() {
  return (
    <div
      role="status"
      aria-label="Loading projects"
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="h-5 w-2/3 rounded bg-gray-200" />
          <div className="mt-5 h-3 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
          <div className="mt-8 h-8 w-28 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const content = loading ? (
    <ProjectsLoadingState />
  ) : error ? (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"
    >
      <p>{getErrorMessage(error)}</p>
      <button
        type="button"
        onClick={refetch}
        className="mt-4 cursor-pointer rounded-lg bg-red-700 px-4 py-2 font-medium text-white transition hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  ) : projects.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
        Create a project to organize your team&apos;s work and track issues in one place.
      </p>
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        className="mt-6 cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        Create Project
      </button>
    </div>
  ) : (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            Projects
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse your projects and keep work moving.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Create Project
        </button>
      </header>

      {content}

      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            refetch();
          }}
        />
      )}
    </main>
  );
}
