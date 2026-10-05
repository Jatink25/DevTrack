// The backend has no error middleware, so Express sends an HTML error page
// (with the right HTTP status, because ApiError sets statusCode).
// We therefore map the status code to a message instead of reading the body.
export function getErrorMessage(error, statusMessages = {}) {
  if (!error.response) {
    return 'Cannot reach the server. Check that the backend is running.'
  }

  const { status, data } = error.response

  // Use a JSON message only if the server happens to send one.
  if (data && typeof data === 'object' && typeof data.message === 'string') {
    return data.message
  }

  return statusMessages[status] || 'Something went wrong. Please try again.'
}
