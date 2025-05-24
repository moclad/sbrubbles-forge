export function isValidEmail(email: string) {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Converts error codes from SNAKE_CASE to camelCase
 * Example: INVALID_TWO_FACTOR_COOKIE -> invalidTwoFactorCookie
 */
export function errorCodeToCamelCase(errorCode: string): string {
  return errorCode
    .toLowerCase()
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function getSearchParam(paramName: string) {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get(paramName)
    : null;
}
