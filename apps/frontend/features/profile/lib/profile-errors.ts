import { ConvexError } from "convex/values";

export function getProfileErrorMessage(error: unknown): string {
  switch (readConvexErrorCode(error)) {
    case "PROFILE_NAME_REQUIRED":
      return "Display name is required.";
    case "PROFILE_NAME_TOO_LONG":
      return "Display name is too long.";
    case "PROFILE_ROLE_REQUIRED":
      return "Role is required.";
    case "PROFILE_ROLE_TOO_LONG":
      return "Role is too long.";
    case "PROFILE_COMPANY_REQUIRED":
      return "Company is required.";
    case "PROFILE_COMPANY_TOO_LONG":
      return "Company is too long.";
    case "PROFILE_BIO_TOO_LONG":
      return "Bio must be 120 characters or fewer.";
    case "PROFILE_FILE_TOO_LARGE":
      return "Image must be 6MB or smaller.";
    case "PROFILE_INVALID_FILE_TYPE":
      return "Use a JPEG, PNG, WebP, or GIF image.";
    case "PROFILE_FILE_NOT_FOUND":
      return "The uploaded image expired. Choose it again.";
    case "PROFILE_INVALID_BANNER":
      return "Choose a banner from the available gallery.";
    case "PROFILE_TOO_MANY_SOCIAL_LINKS":
      return "You can add up to four social links.";
    case "PROFILE_INVALID_SOCIAL_PLATFORM":
      return "Choose a supported social platform.";
    case "PROFILE_INVALID_SOCIAL_URL":
      return "Social links must use a valid http or https URL.";
    default:
      return "Could not save profile.";
  }
}

export function getProductErrorMessage(error: unknown): string {
  void error;
  return "Could not create product.";
}

export function getConnectionErrorMessage(error: unknown): string {
  void error;
  return "Could not add connection.";
}

function readConvexErrorCode(error: unknown): string | null {
  if (
    !(error instanceof ConvexError) ||
    typeof error.data !== "object" ||
    error.data === null ||
    !("code" in error.data) ||
    typeof error.data.code !== "string"
  ) {
    return null;
  }
  return error.data.code;
}
