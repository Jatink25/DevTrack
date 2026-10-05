const DashboardSkeleton = () => (
    <div
        role="status"
        aria-label="Loading dashboard"
        className="animate-pulse space-y-6"
    >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200" />
            ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="h-56 rounded-lg bg-gray-200" />
            ))}
        </div>
    </div>
);

export default DashboardSkeleton;
