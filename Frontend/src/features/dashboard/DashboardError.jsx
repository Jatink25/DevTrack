import { ERROR_KINDS, getErrorKind } from "../../lib/errorKind.js";

const describeError = (kind, what) => {
    switch (kind) {
        case ERROR_KINDS.FORBIDDEN:
            return {
                message: "You don't have access to this project.",
                canRetry: false,
            };
        case ERROR_KINDS.NOT_FOUND:
        case ERROR_KINDS.BAD_REQUEST:
            return {
                message: "This project could not be found. It may have been deleted.",
                canRetry: false,
            };
        case ERROR_KINDS.UNAUTHORIZED:
            return {
                message: "Your session has expired. Please log in again.",
                canRetry: false,
            };
        case ERROR_KINDS.NETWORK:
            return {
                message: "Can't reach the server. Check your connection and try again.",
                canRetry: true,
            };
        default:
            return {
                message: `Something went wrong while loading ${what}.`,
                canRetry: true,
            };
    }
};

// `what` fills the generic message, e.g. "the dashboard" or "your projects".
const DashboardError = ({ error, onRetry, what = "the dashboard" }) => {
    const { message, canRetry } = describeError(getErrorKind(error), what);

    return (
        <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
            <p>{message}</p>
            {canRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                >
                    Try again
                </button>
            )}
        </div>
    );
};

export default DashboardError;
