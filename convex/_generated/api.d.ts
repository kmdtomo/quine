/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as application_githubAnalysis_beginExecution from "../application/githubAnalysis/beginExecution.js";
import type * as application_githubAnalysis_commitTechnologyAnalysis from "../application/githubAnalysis/commitTechnologyAnalysis.js";
import type * as application_githubAnalysis_retryTechnologyAnalysis from "../application/githubAnalysis/retryTechnologyAnalysis.js";
import type * as application_githubAnalysis_startTechnologyAnalysis from "../application/githubAnalysis/startTechnologyAnalysis.js";
import type * as application_githubInstallations_accountVerification from "../application/githubInstallations/accountVerification.js";
import type * as application_githubInstallations_activateDiscovered from "../application/githubInstallations/activateDiscovered.js";
import type * as application_githubInstallations_activateVerified from "../application/githubInstallations/activateVerified.js";
import type * as application_githubInstallations_beginVerification from "../application/githubInstallations/beginVerification.js";
import type * as application_githubInstallations_installationLimit from "../application/githubInstallations/installationLimit.js";
import type * as application_productAi_attachDraftToProduct from "../application/productAi/attachDraftToProduct.js";
import type * as application_productAi_commitRun from "../application/productAi/commitRun.js";
import type * as application_productAi_productAiError from "../application/productAi/productAiError.js";
import type * as application_productAi_retryRun from "../application/productAi/retryRun.js";
import type * as application_productAi_runState from "../application/productAi/runState.js";
import type * as application_productAi_startRun from "../application/productAi/startRun.js";
import type * as application_productAi_threadAccess from "../application/productAi/threadAccess.js";
import type * as application_productAi_upsertRepoContext from "../application/productAi/upsertRepoContext.js";
import type * as application_products_productAccess from "../application/products/productAccess.js";
import type * as application_products_productInput from "../application/products/productInput.js";
import type * as application_products_saveProductForm from "../application/products/saveProductForm.js";
import type * as application_profile_completeProfileOnboarding from "../application/profile/completeProfileOnboarding.js";
import type * as application_profile_socialLinks from "../application/profile/socialLinks.js";
import type * as auth from "../auth.js";
import type * as connections from "../connections.js";
import type * as developerTechnologies from "../developerTechnologies.js";
import type * as files from "../files.js";
import type * as githubAction from "../githubAction.js";
import type * as githubAnalysisLogs from "../githubAnalysisLogs.js";
import type * as githubAnalysisRuns from "../githubAnalysisRuns.js";
import type * as githubInstallations from "../githubInstallations.js";
import type * as githubOAuthAction from "../githubOAuthAction.js";
import type * as http from "../http.js";
import type * as infra_github_authorization from "../infra/github/authorization.js";
import type * as infra_github_githubError from "../infra/github/githubError.js";
import type * as infra_github_oauth from "../infra/github/oauth.js";
import type * as infra_openai_client from "../infra/openai/client.js";
import type * as infra_openai_strandsRuntime from "../infra/openai/strandsRuntime.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_github_client from "../lib/github/client.js";
import type * as lib_github_detection from "../lib/github/detection.js";
import type * as lib_github_types from "../lib/github/types.js";
import type * as lib_githubErrors from "../lib/githubErrors.js";
import type * as lib_productAi_context from "../lib/productAi/context.js";
import type * as lib_productAi_hash from "../lib/productAi/hash.js";
import type * as lib_productAi_productWritingAgent from "../lib/productAi/productWritingAgent.js";
import type * as lib_productAi_prompts from "../lib/productAi/prompts.js";
import type * as lib_productAi_schemas from "../lib/productAi/schemas.js";
import type * as lib_productAi_tools_index from "../lib/productAi/tools/index.js";
import type * as lib_productAi_tools_proposeFormUpdate from "../lib/productAi/tools/proposeFormUpdate.js";
import type * as lib_productAi_tools_proposeMarkdownEdit from "../lib/productAi/tools/proposeMarkdownEdit.js";
import type * as lib_productAi_tools_readAttachmentContext from "../lib/productAi/tools/readAttachmentContext.js";
import type * as lib_productAi_tools_readRepoContext from "../lib/productAi/tools/readRepoContext.js";
import type * as lib_productAssets from "../lib/productAssets.js";
import type * as lib_technologyKeys from "../lib/technologyKeys.js";
import type * as lib_username from "../lib/username.js";
import type * as lib_users from "../lib/users.js";
import type * as productAi from "../productAi.js";
import type * as productAiAction from "../productAiAction.js";
import type * as productDevelopers from "../productDevelopers.js";
import type * as productRepoContexts from "../productRepoContexts.js";
import type * as productTechnologies from "../productTechnologies.js";
import type * as products from "../products.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "application/githubAnalysis/beginExecution": typeof application_githubAnalysis_beginExecution;
  "application/githubAnalysis/commitTechnologyAnalysis": typeof application_githubAnalysis_commitTechnologyAnalysis;
  "application/githubAnalysis/retryTechnologyAnalysis": typeof application_githubAnalysis_retryTechnologyAnalysis;
  "application/githubAnalysis/startTechnologyAnalysis": typeof application_githubAnalysis_startTechnologyAnalysis;
  "application/githubInstallations/accountVerification": typeof application_githubInstallations_accountVerification;
  "application/githubInstallations/activateDiscovered": typeof application_githubInstallations_activateDiscovered;
  "application/githubInstallations/activateVerified": typeof application_githubInstallations_activateVerified;
  "application/githubInstallations/beginVerification": typeof application_githubInstallations_beginVerification;
  "application/githubInstallations/installationLimit": typeof application_githubInstallations_installationLimit;
  "application/productAi/attachDraftToProduct": typeof application_productAi_attachDraftToProduct;
  "application/productAi/commitRun": typeof application_productAi_commitRun;
  "application/productAi/productAiError": typeof application_productAi_productAiError;
  "application/productAi/retryRun": typeof application_productAi_retryRun;
  "application/productAi/runState": typeof application_productAi_runState;
  "application/productAi/startRun": typeof application_productAi_startRun;
  "application/productAi/threadAccess": typeof application_productAi_threadAccess;
  "application/productAi/upsertRepoContext": typeof application_productAi_upsertRepoContext;
  "application/products/productAccess": typeof application_products_productAccess;
  "application/products/productInput": typeof application_products_productInput;
  "application/products/saveProductForm": typeof application_products_saveProductForm;
  "application/profile/completeProfileOnboarding": typeof application_profile_completeProfileOnboarding;
  "application/profile/socialLinks": typeof application_profile_socialLinks;
  auth: typeof auth;
  connections: typeof connections;
  developerTechnologies: typeof developerTechnologies;
  files: typeof files;
  githubAction: typeof githubAction;
  githubAnalysisLogs: typeof githubAnalysisLogs;
  githubAnalysisRuns: typeof githubAnalysisRuns;
  githubInstallations: typeof githubInstallations;
  githubOAuthAction: typeof githubOAuthAction;
  http: typeof http;
  "infra/github/authorization": typeof infra_github_authorization;
  "infra/github/githubError": typeof infra_github_githubError;
  "infra/github/oauth": typeof infra_github_oauth;
  "infra/openai/client": typeof infra_openai_client;
  "infra/openai/strandsRuntime": typeof infra_openai_strandsRuntime;
  "lib/auth": typeof lib_auth;
  "lib/github/client": typeof lib_github_client;
  "lib/github/detection": typeof lib_github_detection;
  "lib/github/types": typeof lib_github_types;
  "lib/githubErrors": typeof lib_githubErrors;
  "lib/productAi/context": typeof lib_productAi_context;
  "lib/productAi/hash": typeof lib_productAi_hash;
  "lib/productAi/productWritingAgent": typeof lib_productAi_productWritingAgent;
  "lib/productAi/prompts": typeof lib_productAi_prompts;
  "lib/productAi/schemas": typeof lib_productAi_schemas;
  "lib/productAi/tools/index": typeof lib_productAi_tools_index;
  "lib/productAi/tools/proposeFormUpdate": typeof lib_productAi_tools_proposeFormUpdate;
  "lib/productAi/tools/proposeMarkdownEdit": typeof lib_productAi_tools_proposeMarkdownEdit;
  "lib/productAi/tools/readAttachmentContext": typeof lib_productAi_tools_readAttachmentContext;
  "lib/productAi/tools/readRepoContext": typeof lib_productAi_tools_readRepoContext;
  "lib/productAssets": typeof lib_productAssets;
  "lib/technologyKeys": typeof lib_technologyKeys;
  "lib/username": typeof lib_username;
  "lib/users": typeof lib_users;
  productAi: typeof productAi;
  productAiAction: typeof productAiAction;
  productDevelopers: typeof productDevelopers;
  productRepoContexts: typeof productRepoContexts;
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
