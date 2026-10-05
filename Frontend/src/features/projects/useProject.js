import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getProjectById } from "./projects.api.js";

export const useProject = (projectId) => {
    const [result, setResult] = useState({
        projectId: null,
        reloadKey: 0,
        project: null,
        error: null,
    });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!projectId) return undefined;

        const controller = new AbortController();

        getProjectById(projectId, { signal: controller.signal })
            .then((project) =>
                setResult({ projectId, reloadKey, project, error: null })
            )
            .catch((requestError) => {
                if (!isCanceled(requestError)) {
                    setResult({
                        projectId,
                        reloadKey,
                        project: null,
                        error: requestError,
                    });
                }
            });

        return () => controller.abort();
    }, [projectId, reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    const isCurrentResult =
        result.projectId === projectId && result.reloadKey === reloadKey;
    return {
        project: isCurrentResult ? result.project : null,
        loading: Boolean(projectId) && !isCurrentResult,
        error: isCurrentResult ? result.error : null,
        refetch,
    };
};
