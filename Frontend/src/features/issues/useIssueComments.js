import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getIssueComments } from "./comments.api.js";

export const useIssueComments = (projectId, issueId) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([projectId, issueId, reloadKey]);

    useEffect(() => {
        if (!projectId || !issueId) return undefined;

        const controller = new AbortController();
        getIssueComments(projectId, issueId, { signal: controller.signal })
            .then((comments) =>
                setResult({ requestKey, comments, error: null })
            )
            .catch((error) => {
                if (!isCanceled(error)) {
                    setResult({ requestKey, comments: null, error });
                }
            });

        return () => controller.abort();
    }, [projectId, issueId, reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        comments: isCurrentResult ? result.comments : null,
        error: isCurrentResult ? result.error : null,
        loading: Boolean(projectId && issueId && !isCurrentResult),
        refetch,
    };
};
