import { useCallback, useEffect, useState } from "react";
import { getProjectStats } from "./dashboard.api.js";
import { isCanceled } from "../../lib/errorKind.js";

// Loads dashboard stats for one project. Refetches when projectId changes;
// an in-flight request for the previous project is aborted.
export const useProjectStats = (projectId) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([projectId, reloadKey]);

    useEffect(() => {
        if (!projectId) return undefined;

        const controller = new AbortController();

        getProjectStats(projectId, { signal: controller.signal })
            .then((stats) =>
                setResult({ requestKey, stats, error: null })
            )
            .catch((err) => {
                if (!isCanceled(err)) {
                    setResult({ requestKey, stats: null, error: err });
                }
            });

        return () => controller.abort();
    }, [projectId, reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        stats: isCurrentResult ? result.stats : null,
        loading: Boolean(projectId && !isCurrentResult),
        error: isCurrentResult ? result.error : null,
        refetch,
    };
};