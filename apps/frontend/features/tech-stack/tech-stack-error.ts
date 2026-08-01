const TECH_STACK_ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN: "You do not have permission to perform this action.",
  GITHUB_ANALYSIS_NOT_FOUND:
    "This analysis is no longer available. Start a new GitHub connection.",
  GITHUB_ANALYSIS_NOT_RETRYABLE:
    "This analysis can no longer be retried. Start a new connection.",
  GITHUB_ANALYSIS_REQUEST_FAILED:
    "GitHub repository analysis failed. Please retry.",
  GITHUB_APP_NOT_CONFIGURED: "GitHub App credentials are not configured.",
  GITHUB_INSTALLATION_NOT_FOUND:
    "The verified GitHub installation is no longer available.",
  INVALID_YEARS: "Years must be an integer between 1 and 11.",
  TECHNOLOGY_NOT_SELECTED: "The technology is no longer selected.",
  UNAUTHORIZED: "Sign in before continuing.",
  UNKNOWN_TECHNOLOGY: "Choose a supported technology.",
};

export function getTechStackErrorMessage(
  unknownError: unknown,
  fallback: string,
) {
  const code = readErrorCode(unknownError);
  return code === undefined
    ? fallback
    : TECH_STACK_ERROR_MESSAGES[code] ?? fallback;
}

export function getAnalysisErrorMessage(
  errorCode: string | undefined,
): string {
  return errorCode === undefined
    ? "GitHub repository analysis failed. Please retry."
    : TECH_STACK_ERROR_MESSAGES[errorCode] ??
        "GitHub repository analysis failed. Please retry.";
}

function readErrorCode(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  if ("code" in value && typeof value.code === "string") {
    return value.code;
  }
  if ("data" in value) {
    return readErrorCode(value.data);
  }
  return undefined;
}
