import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getProjectIssues } from "./issues.api.js";

export const useProjectIssues = (
    projectId,
    { status, priority, search, page }
) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([
        projectId,
        status,
        priority,
        search,
        page,
        reloadKey,
    ]);

    useEffect(() => {
        if (!projectId) return undefined;

        const controller = new AbortController();
        getProjectIssues(projectId, {
            status,
            priority,
            search,
            page,
            signal: controller.signal,
        })
            .then((data) => setResult({ requestKey, data, error: null }))
            .catch((error) => {
                if (!isCanceled(error)) {
                    setResult({ requestKey, data: null, error });
                }
            });

        return () => controller.abort();
    }, [projectId, status, priority, search, page, reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        data: isCurrentResult ? result.data : null,
        error: isCurrentResult ? result.error : null,
        loading: Boolean(projectId) && !isCurrentResult,
        refetch,
    };
};
