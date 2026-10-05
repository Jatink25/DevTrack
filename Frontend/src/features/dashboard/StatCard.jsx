const StatCard = ({ label, value, highlight = false }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">{label}</p>
        <p
            className={`mt-1 text-3xl font-semibold ${
                highlight ? "text-red-600" : "text-gray-900"
            }`}
        >
            {value}
        </p>
    </div>
);

export default StatCard;
