import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getProjectIssue } from "./issues.api.js";

export const useProjectIssue = (projectId, issueId) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([projectId, issueId, reloadKey]);

    useEffect(() => {
        if (!projectId || !issueId) return undefined;

        const controller = new AbortController();
        getProjectIssue(projectId, issueId, { signal: controller.signal })
            .then((issue) => setResult({ requestKey, issue, error: null }))
            .catch((error) => {
                if (!isCanceled(error)) {
                    setResult({ requestKey, issue: null, error });
                }
            });

        return () => controller.abort();
    }, [projectId, issueId, reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        issue: isCurrentResult ? result.issue : null,
        error: isCurrentResult ? result.error : null,
        loading: Boolean(projectId && issueId && !isCurrentResult),
        refetch,
    };
};
