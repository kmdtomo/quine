import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isGithubAppOAuthCallback = createRouteMatcher([
  "/signup/github-app/oauth/callback",
]);
const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/onboarding(.*)",
  "/settings(.*)",
  "/(app)(.*)",
  "/products/new(.*)",
  "/products/(.*)/edit(.*)",
  "/tech-stack/edit(.*)",
  "/signup(.*)",
  "/api/signup(.*)",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/onboarding");
    }
    if (
      isProtectedRoute(request) &&
      !(await convexAuth.isAuthenticated())
    ) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
  },
  {
    shouldHandleCode: (request) =>
      !isGithubAppOAuthCallback(request),
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
