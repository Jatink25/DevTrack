import {
    ISSUE_PRIORITY_ORDER,
    ISSUE_STATUS_ORDER,
    buildBreakdown,
} from "../dashboard/dashboard.utils.js";

function CountList({ title, rows, total, tone }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <span className="text-xs text-gray-500">{total} total</span>
            </div>
            <ul className="mt-4 space-y-3">
                {rows.map(({ label, count }) => {
                    const percent = total > 0 ? (count / total) * 100 : 0;
                    return (
                        <li key={label}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{label}</span>
                                <span className="font-medium tabular-nums text-gray-900">
                                    {count}
                                </span>
                            </div>
                            <div
                                aria-hidden="true"
                                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"
                            >
                                <div
                                    className={`h-full rounded-full ${tone}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default function ProjectIssueSummary({ stats }) {
    const statusRows = buildBreakdown(stats.status, ISSUE_STATUS_ORDER);
    const priorityRows = buildBreakdown(stats.priority, ISSUE_PRIORITY_ORDER);

    return (
        <section aria-labelledby="issue-summary-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2
                        id="issue-summary-title"
                        className="text-lg font-semibold text-gray-900"
                    >
                        Issue summary
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Current workload across this project.
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-right shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Total issues</p>
                    <p className="text-2xl font-semibold tabular-nums text-gray-900">
                        {stats.totalIssues}
                    </p>
                </div>
            </div>

            {stats.totalIssues === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
                    No issues have been created for this project yet. Status and
                    priority counts are shown as zero until issues are added.
                </p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <CountList
                    title="By status"
                    rows={statusRows}
                    total={stats.totalIssues}
                    tone="bg-blue-500"
                />
                <CountList
                    title="By priority"
                    rows={priorityRows}
                    total={stats.totalIssues}
                    tone="bg-violet-500"
                />
            </div>
        </section>
    );
}
