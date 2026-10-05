import { useCallback, useEffect, useState } from "react";
import { isCanceled } from "../../lib/errorKind.js";
import { getProjectActivity } from "./activity.api.js";

export const useProjectActivity = (projectId) => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([projectId, reloadKey]);

    useEffect(() => {
        if (!projectId) return undefined;

        const controller = new AbortController();
        getProjectActivity(projectId, { signal: controller.signal })
            .then((activities) =>
                setResult({ requestKey, activities, error: null })
            )
            .catch((error) => {
                if (!isCanceled(error)) {
                    setResult({ requestKey, activities: null, error });
                }
            });

        return () => controller.abort();
    }, [projectId, reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        activities: isCurrentResult ? result.activities : null,
        error: isCurrentResult ? result.error : null,
        loading: Boolean(projectId && !isCurrentResult),
        refetch,
    };
};
