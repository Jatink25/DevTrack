import { useCallback, useEffect, useState } from "react";
import { getProjects } from "./projects.api.js";
import { sortProjects } from "./projects.utils.js";
import { isCanceled } from "../../lib/errorKind.js";

// Loads the current user's projects (owned + member), sorted for display.
export const useProjects = () => {
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = JSON.stringify([reloadKey]);

    useEffect(() => {
        const controller = new AbortController();

        getProjects({ signal: controller.signal })
            .then((data) =>
                setResult({
                    requestKey,
                    projects: sortProjects(data),
                    error: null,
                })
            )
            .catch((err) => {
                if (!isCanceled(err)) {
                    setResult({
                        requestKey,
                        projects: null,
                        error: err,
                    });
                }
            });

        return () => controller.abort();
    }, [reloadKey, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);
    const isCurrentResult = result?.requestKey === requestKey;

    return {
        projects: isCurrentResult ? result.projects : [],
        loading: !isCurrentResult,
        error: isCurrentResult ? result.error : null,
        refetch,
    };
};