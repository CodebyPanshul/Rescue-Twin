/**
 * Normalize API errors to a user-facing message.
 * @param {unknown} error - Caught error (Axios error or Error)
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (!error) return 'Something went wrong';
  if (typeof error === 'string') return error;
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    return Array.isArray(detail) ? detail.map((d) => d.msg || d).join(', ') : String(detail);
  }
  if (error.message) return error.message;
  return 'Request failed. Please try again.';
}
