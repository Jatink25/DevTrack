// Display order (matches the Issue model enums; priority is in severity order,
// not the enum's declaration order)
export const ISSUE_STATUS_ORDER = ["Todo", "In Progress", "Review", "Completed"];
export const ISSUE_PRIORITY_ORDER = ["Low", "Medium", "High", "Critical"];

// Turns the aggregation result [{ _id, count }] into ordered rows
// [{ label, count }]. Known labels always appear (count 0 if the backend
// omitted them), unexpected labels are appended, and a null _id becomes
// "Unspecified".
export const buildBreakdown = (items = [], order = []) => {
    const counts = new Map();

    for (const { _id, count } of items) {
        const label = _id ?? "Unspecified";
        counts.set(label, (counts.get(label) ?? 0) + count);
    }

    const knownRows = order.map((label) => ({
        label,
        count: counts.get(label) ?? 0,
    }));

    const extraRows = [...counts.entries()]
        .filter(([label]) => !order.includes(label))
        .map(([label, count]) => ({ label, count }));

    return [...knownRows, ...extraRows];
};