import { useCallback, useEffect, useState } from "react";
import { getProjectStats } from "./dashboard.api.js";
import { isCanceled } from "../../lib/errorKind.js";

// Loads dashboard stats for one project. Refetches when projectId changes;
// an in-flight request for the previous project is aborted.
export const useProjectStats = (projectId) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(Boolean(projectId));
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!projectId) {
            setStats(null);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        setStats(null);
        setError(null);
        setLoading(true);

        getProjectStats(projectId, { signal: controller.signal })
            .then((data) => setStats(data))
            .catch((err) => {
                if (!isCanceled(err)) setError(err);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [projectId, reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return { stats, loading, error, refetch };
};