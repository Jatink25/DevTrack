// rows: [{ label, count }]; bar width is each row's share of the total.
const BreakdownList = ({ title, rows }) => {
    const total = rows.reduce((sum, row) => sum + row.count, 0);

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>

            {total === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No data</p>
            ) : (
                <ul className="mt-3 space-y-3">
                    {rows.map(({ label, count }) => (
                        <li key={label}>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">{label}</span>
                                <span className="text-gray-500">{count}</span>
                            </div>
                            <div className="mt-1 h-2 rounded bg-gray-100">
                                <div
                                    className="h-2 rounded bg-blue-500"
                                    style={{ width: `${(count / total) * 100}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default BreakdownList;
