/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as application_connections_addConnection from "../application/connections/addConnection.js";
import type * as application_connections_approveConnection from "../application/connections/approveConnection.js";
import type * as application_connections_resolveDeveloper from "../application/connections/resolveDeveloper.js";
import type * as application_developerTechnologies_reorder from "../application/developerTechnologies/reorder.js";
import type * as application_developerTechnologies_saveDetected from "../application/developerTechnologies/saveDetected.js";
import type * as application_developerTechnologies_setManyYears from "../application/developerTechnologies/setManyYears.js";
import type * as application_developerTechnologies_technologyRules from "../application/developerTechnologies/technologyRules.js";
import type * as application_files_consumeUploadIntent from "../application/files/consumeUploadIntent.js";
import type * as application_files_createUploadIntent from "../application/files/createUploadIntent.js";
import type * as application_files_finalizeUpload from "../application/files/finalizeUpload.js";
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
import type * as application_productAi_markdownContentHash from "../application/productAi/markdownContentHash.js";
import type * as application_productAi_productAiError from "../application/productAi/productAiError.js";
import type * as application_productAi_retryRun from "../application/productAi/retryRun.js";
import type * as application_productAi_runState from "../application/productAi/runState.js";
import type * as application_productAi_startRun from "../application/productAi/startRun.js";
import type * as application_productAi_threadAccess from "../application/productAi/threadAccess.js";
import type * as application_productAi_upsertRepoContext from "../application/productAi/upsertRepoContext.js";
import type * as application_productDevelopers_approveDeveloper from "../application/productDevelopers/approveDeveloper.js";
import type * as application_productDevelopers_declineInvitation from "../application/productDevelopers/declineInvitation.js";
import type * as application_productDevelopers_inviteDeveloper from "../application/productDevelopers/inviteDeveloper.js";
import type * as application_productDevelopers_productDeveloperAccess from "../application/productDevelopers/productDeveloperAccess.js";
import type * as application_productDevelopers_productDeveloperRoles from "../application/productDevelopers/productDeveloperRoles.js";
import type * as application_productDevelopers_removeDeveloper from "../application/productDevelopers/removeDeveloper.js";
import type * as application_productDevelopers_requestToJoinProduct from "../application/productDevelopers/requestToJoinProduct.js";
import type * as application_productTechnologies_addProductTechnology from "../application/productTechnologies/addProductTechnology.js";
import type * as application_productTechnologies_productTechnologyLimits from "../application/productTechnologies/productTechnologyLimits.js";
import type * as application_productTechnologies_reorderProductTechnologies from "../application/productTechnologies/reorderProductTechnologies.js";
import type * as application_productTechnologies_setManyProductTechnologies from "../application/productTechnologies/setManyProductTechnologies.js";
import type * as application_products_productAccess from "../application/products/productAccess.js";
import type * as application_products_productAssetLimits from "../application/products/productAssetLimits.js";
import type * as application_products_productAssets from "../application/products/productAssets.js";
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
import type * as infra_github_client from "../infra/github/client.js";
import type * as infra_github_githubError from "../infra/github/githubError.js";
import type * as infra_github_oauth from "../infra/github/oauth.js";
import type * as infra_github_types from "../infra/github/types.js";
import type * as infra_openai_client from "../infra/openai/client.js";
import type * as infra_openai_strandsRuntime from "../infra/openai/strandsRuntime.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_githubErrors from "../lib/githubErrors.js";
import type * as lib_technologyKeys from "../lib/technologyKeys.js";
import type * as lib_uploadIntents from "../lib/uploadIntents.js";
import type * as lib_username from "../lib/username.js";
import type * as lib_users from "../lib/users.js";
import type * as productAi from "../productAi.js";
import type * as productAiAction from "../productAiAction.js";
import type * as productDevelopers from "../productDevelopers.js";
import type * as productRepoContexts from "../productRepoContexts.js";
import type * as productTechnologies from "../productTechnologies.js";
import type * as products from "../products.js";
import type * as users from "../users.js";
import type * as workflows_githubAnalysis_detection from "../workflows/githubAnalysis/detection.js";
import type * as workflows_githubAnalysis_repositories from "../workflows/githubAnalysis/repositories.js";
import type * as workflows_githubAnalysis_types from "../workflows/githubAnalysis/types.js";
import type * as workflows_productAi_productWritingAgent from "../workflows/productAi/productWritingAgent.js";
import type * as workflows_productAi_productWritingContext from "../workflows/productAi/productWritingContext.js";
import type * as workflows_productAi_productWritingPrompt from "../workflows/productAi/productWritingPrompt.js";
import type * as workflows_productAi_toolSchemas from "../workflows/productAi/toolSchemas.js";
import type * as workflows_productAi_tools_index from "../workflows/productAi/tools/index.js";
import type * as workflows_productAi_tools_proposeFormUpdate from "../workflows/productAi/tools/proposeFormUpdate.js";
import type * as workflows_productAi_tools_proposeMarkdownEdit from "../workflows/productAi/tools/proposeMarkdownEdit.js";
import type * as workflows_productAi_tools_readAttachmentContext from "../workflows/productAi/tools/readAttachmentContext.js";
import type * as workflows_productAi_tools_readRepoContext from "../workflows/productAi/tools/readRepoContext.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "application/connections/addConnection": typeof application_connections_addConnection;
  "application/connections/approveConnection": typeof application_connections_approveConnection;
  "application/connections/resolveDeveloper": typeof application_connections_resolveDeveloper;
  "application/developerTechnologies/reorder": typeof application_developerTechnologies_reorder;
  "application/developerTechnologies/saveDetected": typeof application_developerTechnologies_saveDetected;
  "application/developerTechnologies/setManyYears": typeof application_developerTechnologies_setManyYears;
  "application/developerTechnologies/technologyRules": typeof application_developerTechnologies_technologyRules;
  "application/files/consumeUploadIntent": typeof application_files_consumeUploadIntent;
  "application/files/createUploadIntent": typeof application_files_createUploadIntent;
  "application/files/finalizeUpload": typeof application_files_finalizeUpload;
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
  "application/productAi/markdownContentHash": typeof application_productAi_markdownContentHash;
  "application/productAi/productAiError": typeof application_productAi_productAiError;
  "application/productAi/retryRun": typeof application_productAi_retryRun;
  "application/productAi/runState": typeof application_productAi_runState;
  "application/productAi/startRun": typeof application_productAi_startRun;
  "application/productAi/threadAccess": typeof application_productAi_threadAccess;
  "application/productAi/upsertRepoContext": typeof application_productAi_upsertRepoContext;
  "application/productDevelopers/approveDeveloper": typeof application_productDevelopers_approveDeveloper;
  "application/productDevelopers/declineInvitation": typeof application_productDevelopers_declineInvitation;
  "application/productDevelopers/inviteDeveloper": typeof application_productDevelopers_inviteDeveloper;
  "application/productDevelopers/productDeveloperAccess": typeof application_productDevelopers_productDeveloperAccess;
  "application/productDevelopers/productDeveloperRoles": typeof application_productDevelopers_productDeveloperRoles;
  "application/productDevelopers/removeDeveloper": typeof application_productDevelopers_removeDeveloper;
  "application/productDevelopers/requestToJoinProduct": typeof application_productDevelopers_requestToJoinProduct;
  "application/productTechnologies/addProductTechnology": typeof application_productTechnologies_addProductTechnology;
  "application/productTechnologies/productTechnologyLimits": typeof application_productTechnologies_productTechnologyLimits;
  "application/productTechnologies/reorderProductTechnologies": typeof application_productTechnologies_reorderProductTechnologies;
  "application/productTechnologies/setManyProductTechnologies": typeof application_productTechnologies_setManyProductTechnologies;
  "application/products/productAccess": typeof application_products_productAccess;
  "application/products/productAssetLimits": typeof application_products_productAssetLimits;
  "application/products/productAssets": typeof application_products_productAssets;
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
  "infra/github/client": typeof infra_github_client;
  "infra/github/githubError": typeof infra_github_githubError;
  "infra/github/oauth": typeof infra_github_oauth;
  "infra/github/types": typeof infra_github_types;
  "infra/openai/client": typeof infra_openai_client;
  "infra/openai/strandsRuntime": typeof infra_openai_strandsRuntime;
  "lib/auth": typeof lib_auth;
  "lib/githubErrors": typeof lib_githubErrors;
  "lib/technologyKeys": typeof lib_technologyKeys;
  "lib/uploadIntents": typeof lib_uploadIntents;
  "lib/username": typeof lib_username;
  "lib/users": typeof lib_users;
  productAi: typeof productAi;
  productAiAction: typeof productAiAction;
  productDevelopers: typeof productDevelopers;
  productRepoContexts: typeof productRepoContexts;
  productTechnologies: typeof productTechnologies;
  products: typeof products;
  users: typeof users;
  "workflows/githubAnalysis/detection": typeof workflows_githubAnalysis_detection;
  "workflows/githubAnalysis/repositories": typeof workflows_githubAnalysis_repositories;
  "workflows/githubAnalysis/types": typeof workflows_githubAnalysis_types;
  "workflows/productAi/productWritingAgent": typeof workflows_productAi_productWritingAgent;
  "workflows/productAi/productWritingContext": typeof workflows_productAi_productWritingContext;
  "workflows/productAi/productWritingPrompt": typeof workflows_productAi_productWritingPrompt;
  "workflows/productAi/toolSchemas": typeof workflows_productAi_toolSchemas;
  "workflows/productAi/tools/index": typeof workflows_productAi_tools_index;
  "workflows/productAi/tools/proposeFormUpdate": typeof workflows_productAi_tools_proposeFormUpdate;
  "workflows/productAi/tools/proposeMarkdownEdit": typeof workflows_productAi_tools_proposeMarkdownEdit;
  "workflows/productAi/tools/readAttachmentContext": typeof workflows_productAi_tools_readAttachmentContext;
  "workflows/productAi/tools/readRepoContext": typeof workflows_productAi_tools_readRepoContext;
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
