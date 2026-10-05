import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    404 — Page not found
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    We can&apos;t find that page
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                    The link may be incorrect, or the page may have moved.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/dashboard"
                        className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/projects"
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        View Projects
                    </Link>
                </div>
            </section>
        </main>
    );
}
