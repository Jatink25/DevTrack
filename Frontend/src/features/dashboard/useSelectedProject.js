import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const STORAGE_KEY = "devtrack:lastProjectId";

// Only a project id is stored here, never anything auth-related.
export const readStoredProjectId = () => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const writeStoredId = (id) => {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {
        // storage unavailable: the URL still carries the selection
    }
};

// Decides which project the dashboard shows. `projects` is the sorted list
// from useProjects; `loading` is its loading flag.
//
// Priority: valid ?project= id -> valid last-used id -> first Active project
// -> first project of any status. The resolved id is written back to the URL
// so the URL is always the source of truth.
export const useSelectedProject = (projects, loading) => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const urlId = searchParams.get("project");

    const selectedId = useMemo(() => {
        if (loading || projects.length === 0) return null;

        const exists = (id) => projects.some((project) => project._id === id);

        if (urlId && exists(urlId)) return urlId;

        const storedId = readStoredProjectId();
        if (storedId && exists(storedId)) return storedId;

        const firstActive = projects.find((project) => project.status === "Active");
        return (firstActive ?? projects[0])._id;
    }, [projects, loading, urlId]);

    // Keep the URL in sync with the resolved selection (replace, not push, so
    // the back button isn't polluted). If the URL had an id that isn't in the
    // list, that condition is reflected in `usedFallback` below.
    useEffect(() => {
        if (!selectedId || urlId === selectedId) return;

        navigate(
            {
                pathname: location.pathname,
                search: `?project=${encodeURIComponent(selectedId)}`,
            },
            {
                replace: true,
                state: {
                    ...location.state,
                    usedFallback:
                        Boolean(urlId) || Boolean(location.state?.usedFallback),
                },
            }
        );
    }, [selectedId, urlId, navigate, location.pathname, location.state]);

    // Called by the selector: explicit user choice, remembered for next time.
    const selectProject = useCallback(
        (id) => {
            writeStoredId(id);
            navigate(
                {
                    pathname: location.pathname,
                    search: `?project=${encodeURIComponent(id)}`,
                },
                {
                    state: { ...location.state, usedFallback: false },
                }
            );
        },
        [navigate, location.pathname, location.state]
    );

    const selectedProject = useMemo(
        () => projects.find((project) => project._id === selectedId) ?? null,
        [projects, selectedId]
    );
    const usedFallback = Boolean(location.state?.usedFallback);

    return { selectedId, selectedProject, selectProject, usedFallback };
};