import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getProjectMembers } from "./projects.api.js";

export const useProjectMembers = (projectId, enabled = true) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!projectId || !enabled) return undefined;

        const controller = new AbortController();
        getProjectMembers(projectId, { signal: controller.signal })
            .then((members) =>
                setResult({ projectId, reloadKey, members, error: null })
            )
            .catch((error) => {
                if (!isCanceled(error)) {
                    setResult({
                        projectId,
                        reloadKey,
                        members: null,
                        error,
                    });
                }
            });

        return () => controller.abort();
    }, [projectId, enabled, reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult =
        result?.projectId === projectId && result?.reloadKey === reloadKey;

    return {
        members: isCurrentResult ? result.members : null,
        error: isCurrentResult ? result.error : null,
        loading: Boolean(enabled && projectId && !isCurrentResult),
        refetch,
    };
};
