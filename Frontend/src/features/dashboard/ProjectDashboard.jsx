import { useProjectStats } from "./useProjectStats.js";
import {
    ISSUE_PRIORITY_ORDER,
    ISSUE_STATUS_ORDER,
    buildBreakdown,
} from "./dashboard.utils.js";
import StatCard from "./StatCard.jsx";
import BreakdownList from "./BreakdownList.jsx";
import DashboardSkeleton from "./DashboardSkeleton.jsx";
import DashboardError from "./DashboardError.jsx";

// Stats for one project. The parent renders it with key={projectId}, so
// switching projects remounts it and never shows the previous project's data.
const ProjectDashboard = ({ projectId, project }) => {
    const { stats, loading, error, refetch } = useProjectStats(projectId);

    if (loading) return <DashboardSkeleton />;
    if (error) return <DashboardError error={error} onRetry={refetch} />;
    if (!stats) return null;

    const statusRows = buildBreakdown(stats.status, ISSUE_STATUS_ORDER);
    const priorityRows = buildBreakdown(stats.priority, ISSUE_PRIORITY_ORDER);
    const isInactive = project && project.status !== "Active";

    return (
        <div className="space-y-6">
            {isInactive && (
                <div
                    role="note"
                    className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                    This project is marked {project.status}. Open issues past their
                    due date still count as overdue.
                </div>
            )}

            {stats.totalIssues === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <p className="font-medium text-gray-700">No issues yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Issues created in this project will show up here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatCard label="Total issues" value={stats.totalIssues} />
                        <StatCard
                            label="Overdue"
                            value={stats.overdueIssues}
                            highlight={stats.overdueIssues > 0}
                        />
                        <StatCard label="Assigned" value={stats.assignedIssues} />
                        <StatCard label="Unassigned" value={stats.unassignedIssues} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <BreakdownList title="By status" rows={statusRows} />
                        <BreakdownList title="By priority" rows={priorityRows} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectDashboard;
