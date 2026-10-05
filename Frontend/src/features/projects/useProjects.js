import { useCallback, useEffect, useState } from "react";
import { getProjects } from "./projects.api.js";
import { sortProjects } from "./projects.utils.js";
import { isCanceled } from "../../lib/errorKind.js";

// Loads the current user's projects (owned + member), sorted for display.
export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(null);

        getProjects({ signal: controller.signal })
            .then((data) => setProjects(sortProjects(data)))
            .catch((err) => {
                if (!isCanceled(err)) setError(err);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return { projects, loading, error, refetch };
};