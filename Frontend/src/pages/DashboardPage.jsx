import { Link } from "react-router-dom";
import { useProjects } from "../features/projects/useProjects.js";
import { useSelectedProject } from "../features/dashboard/useSelectedProject.js";
import ProjectSelector from "../features/dashboard/ProjectSelector.jsx";
import ProjectDashboard from "../features/dashboard/ProjectDashboard.jsx";
import DashboardSkeleton from "../features/dashboard/DashboardSkeleton.jsx";
import DashboardError from "../features/dashboard/DashboardError.jsx";

const DashboardPage = () => {
    const { projects, loading, error, refetch } = useProjects();
    const { selectedId, selectedProject, selectProject, usedFallback } =
        useSelectedProject(projects, loading);

    let content;

    if (loading) {
        content = <DashboardSkeleton />;
    } else if (error) {
        content = (
            <DashboardError error={error} onRetry={refetch} what="your projects" />
        );
    } else if (projects.length === 0) {
        content = (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-700">
                    You don't have any projects yet
                </p>
                <Link
                    to="/projects"
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                    Go to Projects
                </Link>
            </div>
        );
    } else {
        content = (
            <>
                {usedFallback && selectedProject && (
                    <div
                        role="note"
                        className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                        The project in the link isn't available to you, so{" "}
                        {selectedProject.name} is shown instead.
                    </div>
                )}

                <ProjectSelector
                    projects={projects}
                    selectedId={selectedId}
                    onSelect={selectProject}
                />

                <ProjectDashboard
                    key={selectedId}
                    projectId={selectedId}
                    project={selectedProject}
                />
            </>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            {content}
        </div>
    );
};

export default DashboardPage;
