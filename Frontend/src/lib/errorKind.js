export const ERROR_KINDS = {
    UNAUTHORIZED: "unauthorized", // 401
    FORBIDDEN: "forbidden",       // 403
    NOT_FOUND: "notFound",        // 404
    BAD_REQUEST: "badRequest",    // 400
    NETWORK: "network",           // request made, no response
    UNKNOWN: "unknown",           // anything else (5xx, non-Axios errors)
};

// True when a request was cancelled via AbortController (not a real failure)
export const isCanceled = (error) => error?.code === "ERR_CANCELED";

// Classifies by status code only; never reads response.data.message, since
// the backend has no error middleware and the body shape isn't guaranteed.
export const getErrorKind = (error) => {
    const status = error?.response?.status;

    if (status === 401) return ERROR_KINDS.UNAUTHORIZED;
    if (status === 403) return ERROR_KINDS.FORBIDDEN;
    if (status === 404) return ERROR_KINDS.NOT_FOUND;
    if (status === 400) return ERROR_KINDS.BAD_REQUEST;
    if (error?.isAxiosError && !error.response) return ERROR_KINDS.NETWORK;

    return ERROR_KINDS.UNKNOWN;
};