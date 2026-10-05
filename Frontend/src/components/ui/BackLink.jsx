import { Link } from "react-router-dom";

export default function BackLink({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 shrink-0"
            >
                <path
                    d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="truncate">{children}</span>
        </Link>
    );
}
