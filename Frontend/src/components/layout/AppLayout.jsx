import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.jsx";

const NAV_ITEMS = [
    { label: "Dashboard", to: "/dashboard", end: true },
    { label: "Projects", to: "/projects" },
];

function UserIdentity({ user, compact = false }) {
    const displayName = user?.username || user?.email || "Account";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className={`flex min-w-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                {initial}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-900">
                    {displayName}
                </span>
                {!compact && user?.email && user.email !== displayName && (
                    <span className="block truncate text-xs text-gray-500">
                        {user.email}
                    </span>
                )}
            </span>
        </div>
    );
}

function NavigationLinks({ onNavigate }) {
    return (
        <nav aria-label="Main navigation" className="space-y-1">
            {NAV_ITEMS.map(({ label, to, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                    `flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                                ? "bg-blue-50 text-blue-800"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`
                    }
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
                <div className="flex h-16 items-center border-b border-gray-100 px-6">
                    <NavLink
                        to="/dashboard"
                        className="cursor-pointer text-xl font-bold tracking-tight text-gray-900"
                    >
                        Dev<span className="text-blue-700">Track</span>
                    </NavLink>
                </div>

                <div className="flex-1 px-4 py-6">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Workspace
                    </p>
                    <NavigationLinks />
                </div>

                <div className="space-y-4 border-t border-gray-100 p-4">
                    <UserIdentity user={user} />
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white lg:hidden">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                        <NavLink
                            to="/dashboard"
                            className="cursor-pointer text-lg font-bold tracking-tight text-gray-900"
                        >
                            Dev<span className="text-blue-700">Track</span>
                        </NavLink>
                        <div className="flex items-center gap-3">
                            <UserIdentity user={user} compact />
                            <button
                                type="button"
                                aria-expanded={mobileMenuOpen}
                                aria-controls="mobile-global-navigation"
                                aria-label={
                                    mobileMenuOpen
                                        ? "Close navigation menu"
                                        : "Open navigation menu"
                                }
                                onClick={() =>
                                    setMobileMenuOpen((isOpen) => !isOpen)
                                }
                                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {mobileMenuOpen ? "Close" : "Menu"}
                            </button>
                        </div>
                    </div>
                    {mobileMenuOpen && (
                        <div
                            id="mobile-global-navigation"
                            className="space-y-3 border-t border-gray-100 px-4 py-4 sm:px-6"
                        >
                            <NavigationLinks
                                onNavigate={() => setMobileMenuOpen(false)}
                            />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </header>

                <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
