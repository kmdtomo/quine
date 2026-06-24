/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as connections from "../connections.js";
import type * as developerTechnologies from "../developerTechnologies.js";
import type * as githubAction from "../githubAction.js";
import type * as githubAnalysisLogs from "../githubAnalysisLogs.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_products from "../lib/products.js";
import type * as lib_technologyKeys from "../lib/technologyKeys.js";
import type * as lib_username from "../lib/username.js";
import type * as lib_users from "../lib/users.js";
import type * as productDevelopers from "../productDevelopers.js";
import type * as productTechnologies from "../productTechnologies.js";
import type * as products from "../products.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  connections: typeof connections;
  developerTechnologies: typeof developerTechnologies;
  githubAction: typeof githubAction;
  githubAnalysisLogs: typeof githubAnalysisLogs;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/products": typeof lib_products;
  "lib/technologyKeys": typeof lib_technologyKeys;
  "lib/username": typeof lib_username;
  "lib/users": typeof lib_users;
  productDevelopers: typeof productDevelopers;
  productTechnologies: typeof productTechnologies;
  products: typeof products;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
