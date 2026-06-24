"use node";

import { createSign } from "node:crypto";

import { v } from "convex/values";

import {
  allTechnologies,
  type CanonicalTechnology,
  type TechnologyKey,
} from "../data/tech-stack";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, type ActionCtx } from "./_generated/server";
import { auth } from "./auth";

const GITHUB_API_URL = "https://api.github.com";
const COMMON_WORKSPACE_DIRECTORIES = [
  "apps",
  "packages",
  "services",
  "frontend",
  "backend",
  "api",
  "web",
  "worker",
  "workers",
];

const MAX_GITHUB_API_REQUESTS = 95;
const MAX_REPOSITORY_LIST_PAGES = 5;
const MAX_REPOSITORIES_TO_ANALYZE = 30;
const MAX_MANIFEST_FILES_PER_REPOSITORY = 2;
const MAX_RECURSIVE_MANIFEST_TARGETS = 120;
const MAX_PRODUCT_IMPORT_REQUESTS = 35;
const GITHUB_FETCH_TIMEOUT_MS = 15_000;

type DetectionSource = {
  repository: string;
  path: string;
  detail: string;
};

type DetectedTechnology = {
  key: string;
  name: string;
  category: string;
  confidence: number;
  score: number;
  sources: DetectionSource[];
};

type RepositorySummary = {
  fullName: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  defaultBranch: string;
  primaryLanguage: string | null;
  primaryTechnologyKey: TechnologyKey | null;
  primaryTechnologyName: string | null;
  private: boolean;
  fork: boolean;
  stargazersCount: number;
  updatedAt: string | null;
};

type RepositoryAnalysis = {
  repository: RepositorySummary;
  languages: string[];
  filesRead: string[];
  detectedTechnologyKeys: string[];
  warnings: string[];
};

type InstallationSummary = {
  id: number;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  targetType: string;
};

type ManifestKind =
  | "packageJson"
  | "python"
  | "ruby"
  | "go"
  | "rust"
  | "php"
  | "dart"
  | "swift"
  | "java"
  | "docker"
  | "githubWorkflow"
  | "terraform"
  | "cloudFormation"
  | "pulumi"
  | "config"
  | "unknown";

type ManifestTarget = {
  path: string;
  kind: ManifestKind;
  baselineKeys: TechnologyKey[];
};

type DirectoryEntry = {
  name: string;
  path: string;
  type: "file" | "dir" | "other";
};

type FileReadResult = {
  exists: boolean;
  text: string | null;
};

type DetectionMaps = {
  languages: Map<string, TechnologyKey[]>;
  npm: Map<string, TechnologyKey[]>;
  python: Map<string, TechnologyKey[]>;
  ruby: Map<string, TechnologyKey[]>;
  go: Map<string, TechnologyKey[]>;
  rust: Map<string, TechnologyKey[]>;
  php: Map<string, TechnologyKey[]>;
  dart: Map<string, TechnologyKey[]>;
  swift: Map<string, TechnologyKey[]>;
  java: Map<string, TechnologyKey[]>;
  files: Map<string, TechnologyKey[]>;
  dockerImages: Map<string, TechnologyKey[]>;
  workflowUses: Map<string, TechnologyKey[]>;
  envVars: Map<string, TechnologyKey[]>;
  text: Map<string, TechnologyKey[]>;
};

type GitHubRequestBudget = {
  limit: number;
  used: number;
  exhausted: boolean;
  warnings: string[];
};

const catalogByKey = new Map<TechnologyKey, CanonicalTechnology>();
for (const technology of allTechnologies) {
  catalogByKey.set(technology.key, technology);
}

const detectionMaps = buildDetectionMaps();

const terraformResourceMap: Record<string, readonly TechnologyKey[]> = {
  aws_api_gateway_rest_api: ["aws_api_gateway"],
  aws_apigatewayv2_api: ["aws_api_gateway"],
  aws_appsync_graphql_api: ["aws_appsync"],
  aws_athena_database: ["aws_athena"],
  aws_athena_workgroup: ["aws_athena"],
  aws_batch_compute_environment: ["aws_batch"],
  aws_cloudfront_distribution: ["aws_cloudfront"],
  aws_cloudformation_stack: ["aws_cloudformation"],
  aws_cloudwatch_log_group: ["aws_cloudwatch"],
  aws_cognito_user_pool: ["aws_cognito"],
  aws_db_instance: ["aws_rds"],
  aws_docdb_cluster: ["aws_documentdb"],
  aws_dynamodb_table: ["aws_dynamodb"],
  aws_ecr_repository: ["aws_ecr"],
  aws_ecs_cluster: ["aws_ecs"],
  aws_ecs_service: ["aws_ecs"],
  aws_ecs_task_definition: ["aws_ecs"],
  aws_eks_cluster: ["aws_eks"],
  aws_elastic_beanstalk_application: ["aws_elastic_beanstalk"],
  aws_elasticache_cluster: ["aws_elasticache"],
  aws_elasticache_replication_group: ["aws_elasticache"],
  aws_eventbridge_rule: ["aws_eventbridge"],
  aws_glue_job: ["aws_glue"],
  aws_iam_role: ["aws_iam"],
  aws_instance: ["aws_ec2"],
  aws_kinesis_stream: ["aws_kinesis"],
  aws_kms_key: ["aws_kms"],
  aws_lambda_function: ["aws_lambda"],
  aws_lb: ["aws_elastic_load_balancing"],
  aws_opensearch_domain: ["aws_opensearch_service"],
  aws_rds_cluster: ["aws_rds", "aws_aurora"],
  aws_redshift_cluster: ["aws_redshift"],
  aws_route53_zone: ["aws_route53"],
  aws_s3_bucket: ["aws_s3"],
  aws_sagemaker_domain: ["aws_sagemaker"],
  aws_secretsmanager_secret: ["aws_secrets_manager"],
  aws_ses_domain_identity: ["aws_ses"],
  aws_sfn_state_machine: ["aws_step_functions"],
  aws_sns_topic: ["aws_sns"],
  aws_sqs_queue: ["aws_sqs"],
  aws_vpc: ["aws_vpc"],
  aws_wafv2_web_acl: ["aws_waf"],
  google_api_gateway_api: ["gcp_apigee"],
  google_artifact_registry_repository: ["gcp_artifact_registry"],
  google_bigquery_dataset: ["gcp_bigquery"],
  google_cloud_run_service: ["gcp_cloud_run"],
  google_cloud_run_v2_service: ["gcp_cloud_run"],
  google_cloud_scheduler_job: ["gcp_cloud_scheduler"],
  google_cloud_tasks_queue: ["gcp_cloud_tasks"],
  google_cloudbuild_trigger: ["gcp_cloud_build"],
  google_cloudfunctions_function: ["gcp_cloud_functions"],
  google_cloudfunctions2_function: ["gcp_cloud_functions"],
  google_composer_environment: ["gcp_cloud_composer"],
  google_compute_backend_service: ["gcp_cloud_load_balancing"],
  google_compute_global_forwarding_rule: ["gcp_cloud_load_balancing"],
  google_compute_instance: ["gcp_compute_engine"],
  google_compute_network: ["gcp_vpc"],
  google_compute_security_policy: ["gcp_cloud_armor"],
  google_container_cluster: ["gcp_gke"],
  google_dataflow_job: ["gcp_dataflow"],
  google_dataproc_cluster: ["gcp_dataproc"],
  google_eventarc_trigger: ["gcp_eventarc"],
  google_firestore_database: ["gcp_firestore"],
  google_logging_project_sink: ["gcp_cloud_logging"],
  google_monitoring_alert_policy: ["gcp_cloud_monitoring"],
  google_project_iam_member: ["gcp_cloud_iam"],
  google_pubsub_topic: ["gcp_pubsub"],
  google_redis_instance: ["gcp_memorystore"],
  google_secret_manager_secret: ["gcp_secret_manager"],
  google_spanner_instance: ["gcp_spanner"],
  google_sql_database_instance: ["gcp_cloud_sql"],
  google_storage_bucket: ["gcp_cloud_storage"],
  google_vertex_ai_endpoint: ["vertex_ai"],
  google_workflows_workflow: ["gcp_workflows"],
  azurerm_api_management: ["azure_api_management"],
  azurerm_app_service: ["azure_app_service"],
  azurerm_application_gateway: ["azure_application_gateway"],
  azurerm_application_insights: ["azure_application_insights"],
  azurerm_container_app: ["azure_container_apps"],
  azurerm_container_registry: ["azure_container_registry"],
  azurerm_cosmosdb_account: ["azure_cosmos_db"],
  azurerm_data_factory: ["azure_data_factory"],
  azurerm_eventgrid_topic: ["azure_event_grid"],
  azurerm_eventhub_namespace: ["azure_event_hubs"],
  azurerm_function_app: ["azure_functions"],
  azurerm_key_vault: ["azure_key_vault"],
  azurerm_kubernetes_cluster: ["azure_aks"],
  azurerm_lb: ["azure_load_balancer"],
  azurerm_linux_function_app: ["azure_functions"],
  azurerm_linux_virtual_machine: ["azure_virtual_machines"],
  azurerm_log_analytics_workspace: ["azure_log_analytics"],
  azurerm_logic_app_workflow: ["azure_logic_apps"],
  azurerm_monitor_action_group: ["azure_monitor"],
  azurerm_mssql_database: ["azure_sql_database"],
  azurerm_mysql_flexible_server: ["azure_database_for_mysql"],
  azurerm_postgresql_flexible_server: ["azure_database_for_postgresql"],
  azurerm_redis_cache: ["azure_cache_for_redis"],
  azurerm_search_service: ["azure_ai_search"],
  azurerm_servicebus_namespace: ["azure_service_bus"],
  azurerm_static_web_app: ["azure_static_web_apps"],
  azurerm_storage_account: ["azure_blob_storage"],
  azurerm_storage_queue: ["azure_queue_storage"],
  azurerm_windows_function_app: ["azure_functions"],
  azurerm_windows_virtual_machine: ["azure_virtual_machines"],
};

const cloudFormationResourceMap: Record<string, readonly TechnologyKey[]> = {
  "AWS::ApiGateway::RestApi": ["aws_api_gateway"],
  "AWS::ApiGatewayV2::Api": ["aws_api_gateway"],
  "AWS::AppSync::GraphQLApi": ["aws_appsync"],
  "AWS::Athena::WorkGroup": ["aws_athena"],
  "AWS::Batch::ComputeEnvironment": ["aws_batch"],
  "AWS::Bedrock::Agent": ["bedrock_agents"],
  "AWS::Bedrock::Guardrail": ["bedrock_guardrails"],
  "AWS::Bedrock::KnowledgeBase": ["bedrock_knowledge_bases"],
  "AWS::CloudFormation::Stack": ["aws_cloudformation"],
  "AWS::CloudFront::Distribution": ["aws_cloudfront"],
  "AWS::CloudWatch::Alarm": ["aws_cloudwatch"],
  "AWS::Cognito::UserPool": ["aws_cognito"],
  "AWS::DynamoDB::Table": ["aws_dynamodb"],
  "AWS::EC2::Instance": ["aws_ec2"],
  "AWS::EC2::VPC": ["aws_vpc"],
  "AWS::ECR::Repository": ["aws_ecr"],
  "AWS::ECS::Cluster": ["aws_ecs"],
  "AWS::ECS::Service": ["aws_ecs"],
  "AWS::EKS::Cluster": ["aws_eks"],
  "AWS::ElasticBeanstalk::Application": ["aws_elastic_beanstalk"],
  "AWS::ElasticLoadBalancingV2::LoadBalancer": ["aws_elastic_load_balancing"],
  "AWS::ElastiCache::CacheCluster": ["aws_elasticache"],
  "AWS::Events::Rule": ["aws_eventbridge"],
  "AWS::Glue::Job": ["aws_glue"],
  "AWS::IAM::Role": ["aws_iam"],
  "AWS::Kinesis::Stream": ["aws_kinesis"],
  "AWS::KMS::Key": ["aws_kms"],
  "AWS::Lambda::Function": ["aws_lambda"],
  "AWS::OpenSearchService::Domain": ["aws_opensearch_service"],
  "AWS::RDS::DBCluster": ["aws_rds", "aws_aurora"],
  "AWS::RDS::DBInstance": ["aws_rds"],
  "AWS::Redshift::Cluster": ["aws_redshift"],
  "AWS::Route53::HostedZone": ["aws_route53"],
  "AWS::S3::Bucket": ["aws_s3"],
  "AWS::SageMaker::Domain": ["aws_sagemaker"],
  "AWS::SecretsManager::Secret": ["aws_secrets_manager"],
  "AWS::SES::EmailIdentity": ["aws_ses"],
  "AWS::SNS::Topic": ["aws_sns"],
  "AWS::SQS::Queue": ["aws_sqs"],
  "AWS::Serverless::Api": ["aws_api_gateway"],
  "AWS::Serverless::Function": ["aws_lambda"],
  "AWS::StepFunctions::StateMachine": ["aws_step_functions"],
  "AWS::WAFv2::WebACL": ["aws_waf"],
};

const pulumiResourceMap: Record<string, readonly TechnologyKey[]> = {
  "aws:apigateway/restApi:RestApi": ["aws_api_gateway"],
  "aws:appsync/graphqlApi:GraphQLApi": ["aws_appsync"],
  "aws:cloudfront/distribution:Distribution": ["aws_cloudfront"],
  "aws:cognito/userPool:UserPool": ["aws_cognito"],
  "aws:dynamodb/table:Table": ["aws_dynamodb"],
  "aws:ec2/instance:Instance": ["aws_ec2"],
  "aws:ec2/vpc:Vpc": ["aws_vpc"],
  "aws:ecr/repository:Repository": ["aws_ecr"],
  "aws:ecs/cluster:Cluster": ["aws_ecs"],
  "aws:ecs/service:Service": ["aws_ecs"],
  "aws:eks/cluster:Cluster": ["aws_eks"],
  "aws:iam/role:Role": ["aws_iam"],
  "aws:kms/key:Key": ["aws_kms"],
  "aws:lambda/function:Function": ["aws_lambda"],
  "aws:rds/instance:Instance": ["aws_rds"],
  "aws:route53/zone:Zone": ["aws_route53"],
  "aws:s3/bucket:Bucket": ["aws_s3"],
  "aws:secretsmanager/secret:Secret": ["aws_secrets_manager"],
  "aws:sns/topic:Topic": ["aws_sns"],
  "aws:sqs/queue:Queue": ["aws_sqs"],
  "awsx:apigateway/api:API": ["aws_api_gateway"],
  "awsx:ecs/fargateService:FargateService": ["aws_fargate"],
  "azure-native:containerservice:ManagedCluster": ["azure_aks"],
  "azure-native:documentdb:DatabaseAccount": ["azure_cosmos_db"],
  "azure-native:storage:StorageAccount": ["azure_blob_storage"],
  "gcp:cloudrun/service:Service": ["gcp_cloud_run"],
  "gcp:cloudscheduler/job:Job": ["gcp_cloud_scheduler"],
  "gcp:compute/instance:Instance": ["gcp_compute_engine"],
  "gcp:compute/network:Network": ["gcp_vpc"],
  "gcp:container/cluster:Cluster": ["gcp_gke"],
  "gcp:pubsub/topic:Topic": ["gcp_pubsub"],
  "gcp:sql/databaseInstance:DatabaseInstance": ["gcp_cloud_sql"],
  "gcp:storage/bucket:Bucket": ["gcp_cloud_storage"],
};

const rootManifestTargets: ManifestTarget[] = [
  target("package.json", "packageJson", ["nodejs"]),
  target("bun.lock", "config", ["bun"]),
  target("bun.lockb", "config", ["bun"]),
  target("deno.json", "config", ["deno"]),
  target("deno.jsonc", "config", ["deno"]),
  target("tsconfig.json", "config", ["typescript"]),
  target("requirements.txt", "python", ["python"]),
  target("pyproject.toml", "python", ["python"]),
  target("Pipfile", "python", ["python"]),
  target("setup.py", "python", ["python"]),
  target("Gemfile", "ruby", ["ruby"]),
  target("go.mod", "go", ["go"]),
  target("Cargo.toml", "rust", ["rust"]),
  target("composer.json", "php", ["php"]),
  target("pubspec.yaml", "dart", ["dart"]),
  target("Package.swift", "swift", ["swift"]),
  target("pom.xml", "java", ["java", "jvm"]),
  target("build.gradle", "java", ["java", "jvm", "gradle"]),
  target("build.gradle.kts", "java", ["java", "kotlin", "jvm", "gradle"]),
  target("Dockerfile", "docker", ["docker"]),
  target("docker-compose.yml", "docker", ["docker", "docker_compose"]),
  target("compose.yml", "docker", ["docker", "docker_compose"]),
  target("vercel.json", "config", ["vercel"]),
  target("netlify.toml", "config", ["netlify"]),
  target("wrangler.toml", "config", ["cloudflare_workers"]),
  target("wrangler.json", "config", ["cloudflare_workers"]),
  target("wrangler.jsonc", "config", ["cloudflare_workers"]),
  target("railway.json", "config", ["railway"]),
  target("render.yaml", "config", ["render"]),
  target("fly.toml", "config", ["fly_io"]),
  target("Procfile", "config", ["heroku"]),
  target("prisma/schema.prisma", "config", ["prisma"]),
  target("drizzle.config.ts", "config", ["drizzle"]),
  target("drizzle.config.js", "config", ["drizzle"]),
  target("dbt_project.yml", "config", ["dbt"]),
  target("convex/schema.ts", "config", ["convex"]),
  target("convex.json", "config", ["convex"]),
  target("tailwind.config.js", "config", ["tailwind_css"]),
  target("tailwind.config.ts", "config", ["tailwind_css"]),
  target("components.json", "config", ["shadcn_ui"]),
  target("vite.config.js", "config", ["vite"]),
  target("vite.config.ts", "config", ["vite"]),
  target("next.config.js", "config", ["nextjs"]),
  target("next.config.mjs", "config", ["nextjs"]),
  target("next.config.ts", "config", ["nextjs"]),
  target("astro.config.mjs", "config", ["astro"]),
  target("astro.config.ts", "config", ["astro"]),
  target("playwright.config.ts", "config", ["playwright"]),
  target("playwright.config.js", "config", ["playwright"]),
  target("vitest.config.ts", "config", ["vitest"]),
  target("vitest.config.js", "config", ["vitest"]),
  target("jest.config.ts", "config", ["jest"]),
  target("jest.config.js", "config", ["jest"]),
  target("cypress.config.ts", "config", ["cypress"]),
  target("cypress.config.js", "config", ["cypress"]),
  target("eslint.config.js", "config", ["eslint"]),
  target("biome.json", "config", ["biome"]),
  target(".github/dependabot.yml", "config", ["dependabot"]),
];

export const analyzeRepos = action({
  args: {
    installationId: v.number(),
    runId: v.string(),
  },
  handler: async (ctx, { installationId, runId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const requestBudget = createGitHubRequestBudget(MAX_GITHUB_API_REQUESTS);
    await appendAnalysisLog(ctx, userId, runId, "info", "Starting GitHub repository analysis.");

    try {
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "info",
        `Request budget is ${requestBudget.limit}.`,
      );
      const token = await createInstallationToken(installationId, requestBudget);
      await appendAnalysisLog(ctx, userId, runId, "info", "Created GitHub App installation token.");

      const repositories = await listInstallationRepositories(token, requestBudget);
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "info",
        `Loaded ${repositories.length} repositories from the installation.`,
      );

      const visibleRepositories = repositories
        .filter((repository) => !repository.fork)
        .sort((a, b) => {
          const stars = b.stargazersCount - a.stargazersCount;
          if (stars !== 0) {
            return stars;
          }
          return compareNullableDates(b.updatedAt, a.updatedAt);
        });
      const selectedRepositories = selectRepositoriesForBudget(visibleRepositories);
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "info",
        `Selected ${selectedRepositories.length} repositories across language groups.`,
      );

      const detections = new Map<TechnologyKey, DetectedTechnology>();
      const analyses: RepositoryAnalysis[] = [];
      for (const repository of selectedRepositories) {
        if (requestBudget.exhausted) {
          break;
        }
        analyses.push(
          await analyzeRepository(
            ctx,
            userId,
            runId,
            token,
            repository,
            detections,
            requestBudget,
          ),
        );
      }

      const detectedTechnologies = Array.from(detections.values()).sort(
        (a, b) => b.score - a.score,
      );
      const warnings = [...requestBudget.warnings];
      if (visibleRepositories.length > selectedRepositories.length) {
        warnings.push(
          `Budgeted scan analyzed ${selectedRepositories.length} of ${visibleRepositories.length} visible repositories. You can edit the stack manually after this step.`,
        );
      }
      if (repositories.length === 0) {
        warnings.push("GitHub App から参照できる repository がありません。");
      }
      for (const warning of warnings) {
        await appendAnalysisLog(ctx, userId, runId, "warn", warning);
      }
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "info",
        `Finished with ${detectedTechnologies.length} detected technologies using ${requestBudget.used} requests.`,
      );
      await ctx.runMutation(api.developerTechnologies.saveDetected, {
        installationId,
        technologyKeys: detectedTechnologies.map((technology) => technology.key),
      });
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "info",
        `Saved ${detectedTechnologies.length} technologies to your stack.`,
      );

      return {
        installationId,
        repositoryCount: repositories.length,
        analyzedRepositoryCount: analyses.length,
        requestCount: requestBudget.used,
        requestLimit: requestBudget.limit,
        technologies: detectedTechnologies,
        repositories: analyses,
        warnings,
      };
    } catch (unknownError: unknown) {
      await appendAnalysisLog(
        ctx,
        userId,
        runId,
        "error",
        unknownError instanceof Error
          ? unknownError.message
          : "GitHub repository analysis failed.",
      );
      throw unknownError;
    }
  },
});

export const listInstallations = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const requestBudget = createGitHubRequestBudget(20);
    const jwt = createGitHubAppJwt();
    const response = await githubJson(
      `${GITHUB_API_URL}/app/installations?per_page=100`,
      jwt,
      "GET",
      requestBudget,
    );
    if (!Array.isArray(response.data)) {
      return [];
    }

    const installations: InstallationSummary[] = [];
    for (const item of response.data) {
      const installation = parseInstallation(item);
      if (installation) {
        installations.push(installation);
      }
    }

    return installations.sort((a, b) =>
      a.accountLogin.localeCompare(b.accountLogin),
    );
  },
});

export const listProductRepositories = action({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const installationId = await getCurrentUserGithubInstallationId(ctx);
    if (installationId === undefined) {
      return {
        status: "not_installed",
        repositories: [],
      };
    }

    const requestBudget = createGitHubRequestBudget(12);
    const token = await createInstallationToken(installationId, requestBudget);
    const repositories = await listInstallationRepositories(token, requestBudget);

    return {
      status: "ready",
      installationId,
      requestCount: requestBudget.used,
      requestLimit: requestBudget.limit,
      repositories: sortRepositoriesForSelection(repositories).map(
        toProductRepository,
      ),
      warnings: requestBudget.warnings,
    };
  },
});

export const importProductRepository = action({
  args: {
    repositoryFullName: v.string(),
  },
  handler: async (ctx, { repositoryFullName }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const normalizedRepositoryFullName = repositoryFullName.trim();
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(normalizedRepositoryFullName)) {
      throw new Error("Invalid repository.");
    }

    const installationId = await getCurrentUserGithubInstallationId(ctx);
    if (installationId === undefined) {
      throw new Error("GitHub App is not installed.");
    }

    const requestBudget = createGitHubRequestBudget(MAX_PRODUCT_IMPORT_REQUESTS);
    const token = await createInstallationToken(installationId, requestBudget);
    const repositories = await listInstallationRepositories(token, requestBudget);
    const repository = repositories.find(
      (item) => item.fullName === normalizedRepositoryFullName,
    );
    if (!repository) {
      throw new Error("Repository is not available to this GitHub App installation.");
    }

    const detections = new Map<TechnologyKey, DetectedTechnology>();
    const runId = `product-import-${Date.now()}`;
    const analysis = await analyzeRepository(
      ctx,
      userId,
      runId,
      token,
      repository,
      detections,
      requestBudget,
    );
    const technologyKeys = Array.from(detections.values())
      .sort((a, b) => b.score - a.score)
      .map((technology) => technology.key);

    return {
      repository: toProductRepository(repository),
      requestCount: requestBudget.used,
      requestLimit: requestBudget.limit,
      draft: {
        githubUrl: repository.htmlUrl,
        name: repository.name,
        ...(repository.homepage ? { productUrl: repository.homepage } : {}),
        projectType: repository.private ? "work" : "open_source",
        technologyKeys,
      },
      analysis,
      warnings: requestBudget.warnings,
    };
  },
});

async function analyzeRepository(
  ctx: ActionCtx,
  userId: Id<"users">,
  runId: string,
  token: string,
  repository: RepositorySummary,
  detections: Map<TechnologyKey, DetectedTechnology>,
  requestBudget: GitHubRequestBudget,
): Promise<RepositoryAnalysis> {
  await appendAnalysisLog(
    ctx,
    userId,
    runId,
    "info",
    "Reading repository tree.",
    repository.fullName,
  );

  const filesRead: string[] = [];
  const warnings: string[] = [];
  const repoTechnologyKeys = new Set<TechnologyKey>();
  const languageNames = repository.primaryLanguage ? [repository.primaryLanguage] : [];

  for (const languageName of languageNames) {
    for (const technologyKey of getDetectionKeys(detectionMaps.languages, languageName)) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 4, {
        repository: repository.fullName,
        path: "repository.language",
        detail: `${languageName} appears as the repository primary language`,
      });
    }
  }

  const manifestTargets = await discoverManifestTargets(
    token,
    repository,
    requestBudget,
  );
  const limitedManifestTargets = manifestTargets.slice(
    0,
    MAX_MANIFEST_FILES_PER_REPOSITORY,
  );
  await appendAnalysisLog(
    ctx,
    userId,
    runId,
    "info",
    `Found ${manifestTargets.length} matching files; reading ${limitedManifestTargets.length}.`,
    repository.fullName,
  );
  for (const manifestTarget of limitedManifestTargets) {
    if (requestBudget.exhausted) {
      break;
    }

    const content = await readFile(
      token,
      repository.fullName,
      manifestTarget.path,
      requestBudget,
    );
    if (!content.exists) {
      continue;
    }

    filesRead.push(manifestTarget.path);
    for (const technologyKey of manifestTarget.baselineKeys) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 5, {
        repository: repository.fullName,
        path: manifestTarget.path,
        detail: `${manifestTarget.path} exists`,
      });
    }

    if (!content.text) {
      continue;
    }

    const inferredKeys = inferTechnologiesFromManifest(
      manifestTarget,
      content.text,
    );
    for (const technologyKey of inferredKeys) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 8, {
        repository: repository.fullName,
        path: manifestTarget.path,
        detail: `${technologyKey} detected from ${manifestTarget.path}`,
      });
    }
  }

  await appendAnalysisLog(
    ctx,
    userId,
    runId,
    "info",
    `Detected ${repoTechnologyKeys.size} technology keys.`,
    repository.fullName,
  );

  return {
    repository,
    languages: languageNames,
    filesRead: filesRead.sort(),
    detectedTechnologyKeys: Array.from(repoTechnologyKeys).sort(),
    warnings,
  };
}

async function discoverManifestTargets(
  token: string,
  repository: RepositorySummary,
  requestBudget: GitHubRequestBudget,
): Promise<ManifestTarget[]> {
  const targetsByPath = new Map<string, ManifestTarget>();
  const treePaths = await readRepositoryTree(
    token,
    repository.fullName,
    repository.defaultBranch,
    requestBudget,
  );
  for (const path of treePaths) {
    addTreePathTarget(targetsByPath, path);
    if (targetsByPath.size >= MAX_RECURSIVE_MANIFEST_TARGETS) {
      break;
    }
  }

  return Array.from(targetsByPath.values()).sort(compareManifestTargets);
}

function addTreePathTarget(
  targetsByPath: Map<string, ManifestTarget>,
  path: string,
) {
  const treeTarget = inferRepositoryTreeTarget(path);
  if (treeTarget) {
    mergeManifestTarget(targetsByPath, treeTarget);
  }

  for (const rootTarget of rootManifestTargets) {
    if (matchesDetectionPath(path, rootTarget.path)) {
      mergeManifestTarget(targetsByPath, {
        ...rootTarget,
        path,
        kind: inferManifestKind(path),
      });
    }
  }

  for (const [filePath, technologyKeys] of detectionMaps.files) {
    if (!matchesDetectionPath(path, filePath)) {
      continue;
    }
    mergeManifestTarget(targetsByPath, {
      path,
      kind: inferManifestKind(path),
      baselineKeys: technologyKeys,
    });
  }
}

function addCatalogFileTargets(
  targetsByPath: Map<string, ManifestTarget>,
  prefix: string,
) {
  for (const [filePath, technologyKeys] of detectionMaps.files) {
    if (filePath.includes("*")) {
      continue;
    }
    const path = prefix ? `${prefix}/${filePath}` : filePath;
    const existing = targetsByPath.get(path);
    if (existing) {
      targetsByPath.set(path, {
        ...existing,
        baselineKeys: mergeTechnologyKeys(existing.baselineKeys, technologyKeys),
      });
      continue;
    }
    targetsByPath.set(path, {
      path,
      kind: inferManifestKind(filePath),
      baselineKeys: technologyKeys,
    });
  }
}

function addTargetsForPrefix(
  targetsByPath: Map<string, ManifestTarget>,
  prefix: string,
) {
  for (const rootTarget of rootManifestTargets) {
    if (rootTarget.path.includes("/")) {
      continue;
    }
    const path = `${prefix}/${rootTarget.path}`;
    targetsByPath.set(path, {
      ...rootTarget,
      path,
    });
  }
}

function mergeManifestTarget(
  targetsByPath: Map<string, ManifestTarget>,
  manifestTarget: ManifestTarget,
) {
  const existing = targetsByPath.get(manifestTarget.path);
  if (!existing) {
    targetsByPath.set(manifestTarget.path, manifestTarget);
    return;
  }

  targetsByPath.set(manifestTarget.path, {
    ...existing,
    kind: existing.kind === "config" ? manifestTarget.kind : existing.kind,
    baselineKeys: mergeTechnologyKeys(
      existing.baselineKeys,
      manifestTarget.baselineKeys,
    ),
  });
}

function matchesDetectionPath(path: string, pattern: string): boolean {
  const normalizedPath = path.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();
  if (normalizedPattern.includes("*")) {
    const suffix = normalizedPattern.startsWith("*")
      ? normalizedPattern.slice(1)
      : normalizedPattern.replaceAll("*", "");
    return suffix ? normalizedPath.endsWith(suffix) : false;
  }
  return (
    normalizedPath === normalizedPattern ||
    normalizedPath.endsWith(`/${normalizedPattern}`)
  );
}

function compareManifestTargets(a: ManifestTarget, b: ManifestTarget): number {
  const priority = getManifestPriority(a) - getManifestPriority(b);
  if (priority !== 0) {
    return priority;
  }
  const depth = a.path.split("/").length - b.path.split("/").length;
  if (depth !== 0) {
    return depth;
  }
  return a.path.localeCompare(b.path);
}

function getManifestPriority(manifestTarget: ManifestTarget): number {
  if (manifestTarget.kind === "packageJson") {
    return 0;
  }
  if (
    manifestTarget.kind === "python" ||
    manifestTarget.kind === "go" ||
    manifestTarget.kind === "rust" ||
    manifestTarget.kind === "ruby" ||
    manifestTarget.kind === "php" ||
    manifestTarget.kind === "dart" ||
    manifestTarget.kind === "swift" ||
    manifestTarget.kind === "java"
  ) {
    return 1;
  }
  if (
    manifestTarget.kind === "terraform" ||
    manifestTarget.kind === "cloudFormation" ||
    manifestTarget.kind === "pulumi"
  ) {
    return 2;
  }
  if (manifestTarget.kind === "docker") {
    return 3;
  }
  if (manifestTarget.kind === "githubWorkflow") {
    return 4;
  }
  return 5;
}

function inferManifestKind(path: string): ManifestKind {
  const filename = path.split("/").at(-1) ?? path;
  if (isTerraformPath(path)) {
    return "terraform";
  }
  if (isPulumiPath(path)) {
    return "pulumi";
  }
  if (isCloudFormationPath(path)) {
    return "cloudFormation";
  }
  if (filename === "package.json") {
    return "packageJson";
  }
  if (
    filename === "requirements.txt" ||
    filename === "pyproject.toml" ||
    filename === "Pipfile" ||
    filename === "setup.py"
  ) {
    return "python";
  }
  if (filename === "Gemfile") {
    return "ruby";
  }
  if (filename === "go.mod") {
    return "go";
  }
  if (filename === "Cargo.toml") {
    return "rust";
  }
  if (filename === "composer.json") {
    return "php";
  }
  if (filename === "pubspec.yaml") {
    return "dart";
  }
  if (filename === "Package.swift") {
    return "swift";
  }
  if (
    filename === "pom.xml" ||
    filename === "build.gradle" ||
    filename === "build.gradle.kts"
  ) {
    return "java";
  }
  if (
    filename === "Dockerfile" ||
    filename === "docker-compose.yml" ||
    filename === "compose.yml"
  ) {
    return "docker";
  }
  if (filename.endsWith(".yml") || filename.endsWith(".yaml")) {
    return "githubWorkflow";
  }
  return "config";
}

function inferRepositoryTreeTarget(path: string): ManifestTarget | null {
  if (isTerraformPath(path)) {
    return target(path, "terraform", ["terraform"]);
  }
  if (isPulumiPath(path)) {
    return target(path, "pulumi", ["pulumi"]);
  }
  if (isCloudFormationPath(path)) {
    return target(path, "cloudFormation", []);
  }
  return null;
}

function isTerraformPath(path: string): boolean {
  return (
    path.endsWith(".tf") ||
    path.endsWith(".tf.json") ||
    path.endsWith(".terraform.lock.hcl")
  );
}

function isPulumiPath(path: string): boolean {
  const filename = path.split("/").at(-1) ?? path;
  return (
    filename === "Pulumi.yaml" ||
    filename === "Pulumi.yml" ||
    /^Pulumi\.[^.]+\.ya?ml$/.test(filename)
  );
}

function isCloudFormationPath(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  const filename = normalizedPath.split("/").at(-1) ?? normalizedPath;
  if (!/\.(ya?ml|json)$/.test(filename)) {
    return false;
  }
  if (
    filename.includes("cloudformation") ||
    filename.includes("cloud-formation") ||
    filename.includes("cfn")
  ) {
    return true;
  }
  if (
    filename === "template.yaml" ||
    filename === "template.yml" ||
    filename === "template.json" ||
    filename.endsWith(".template.json") ||
    filename.endsWith(".template.yaml") ||
    filename.endsWith(".template.yml")
  ) {
    return true;
  }
  return (
    normalizedPath.includes("cloudformation/") ||
    normalizedPath.includes("cfn/") ||
    normalizedPath.includes("cdk.out/")
  );
}

function inferTechnologiesFromManifest(
  manifestTarget: ManifestTarget,
  text: string,
): TechnologyKey[] {
  const technologyKeys = new Set<TechnologyKey>();

  addTextDetections(technologyKeys, text);

  if (manifestTarget.kind === "packageJson") {
    addPackageJsonDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "python") {
    addLinePackageDetections(technologyKeys, text, detectionMaps.python);
  } else if (manifestTarget.kind === "ruby") {
    addLinePackageDetections(technologyKeys, text, detectionMaps.ruby);
  } else if (manifestTarget.kind === "go") {
    addGoModuleDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "rust") {
    addTomlDependencyDetections(technologyKeys, text, detectionMaps.rust);
  } else if (manifestTarget.kind === "php") {
    addComposerDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "dart") {
    addYamlPackageDetections(technologyKeys, text, detectionMaps.dart);
  } else if (manifestTarget.kind === "swift") {
    addLinePackageDetections(technologyKeys, text, detectionMaps.swift);
  } else if (manifestTarget.kind === "java") {
    addLinePackageDetections(technologyKeys, text, detectionMaps.java);
  } else if (manifestTarget.kind === "docker") {
    addDockerDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "githubWorkflow") {
    addWorkflowDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "terraform") {
    addTerraformDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "cloudFormation") {
    addCloudFormationDetections(technologyKeys, text);
  } else if (manifestTarget.kind === "pulumi") {
    addPulumiDetections(technologyKeys, text);
  }

  return Array.from(technologyKeys);
}

function addPackageJsonDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  const parsed = parseJsonObject(text);
  if (!parsed) {
    return;
  }

  const dependencyNames = collectDependencyNames(parsed);
  for (const dependencyName of dependencyNames) {
    addAll(technologyKeys, getDetectionKeys(detectionMaps.npm, dependencyName));
  }

  const packageManager = readString(parsed, "packageManager");
  if (packageManager?.startsWith("bun@")) {
    technologyKeys.add("bun");
  }
}

function addComposerDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  const parsed = parseJsonObject(text);
  if (!parsed) {
    return;
  }
  const requireValue = parsed.require;
  if (isRecord(requireValue)) {
    for (const packageName of Object.keys(requireValue)) {
      addAll(technologyKeys, getDetectionKeys(detectionMaps.php, packageName));
    }
  }
  const requireDevValue = parsed["require-dev"];
  if (isRecord(requireDevValue)) {
    for (const packageName of Object.keys(requireDevValue)) {
      addAll(technologyKeys, getDetectionKeys(detectionMaps.php, packageName));
    }
  }
}

function addLinePackageDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
  packageMap: Map<string, TechnologyKey[]>,
) {
  for (const line of text.split("\n")) {
    const normalizedLine = normalizePackageName(line);
    if (!normalizedLine) {
      continue;
    }
    addAll(technologyKeys, getDetectionKeys(packageMap, normalizedLine));
  }
}

function addGoModuleDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) {
      continue;
    }
    const segments = trimmed.split(/\s+/);
    const moduleName = segments[0] === "require" ? segments[1] : segments[0];
    if (moduleName) {
      addAll(technologyKeys, getDetectionKeys(detectionMaps.go, moduleName));
    }
  }
}

function addTomlDependencyDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
  packageMap: Map<string, TechnologyKey[]>,
) {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const packageName = trimmed.split("=")[0]?.trim().replaceAll('"', "");
    if (packageName) {
      addAll(technologyKeys, getDetectionKeys(packageMap, packageName));
    }
  }
}

function addYamlPackageDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
  packageMap: Map<string, TechnologyKey[]>,
) {
  for (const line of text.split("\n")) {
    const match = /^\s{2,}([a-zA-Z0-9_-]+):/.exec(line);
    const packageName = match?.[1];
    if (packageName) {
      addAll(technologyKeys, getDetectionKeys(packageMap, packageName));
    }
  }
}

function addDockerDetections(technologyKeys: Set<TechnologyKey>, text: string) {
  for (const line of text.split("\n")) {
    const fromMatch = /^\s*FROM\s+([^\s:]+)(?::[^\s]+)?/i.exec(line);
    const imageMatch = /^\s*image:\s*["']?([^"'\s:]+)(?::[^"'\s]+)?/i.exec(line);
    const imageName = fromMatch?.[1] ?? imageMatch?.[1];
    if (imageName) {
      addAll(technologyKeys, getDetectionKeys(detectionMaps.dockerImages, imageName));
    }
  }
}

function addWorkflowDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  for (const line of text.split("\n")) {
    const usesMatch = /^\s*uses:\s*["']?([^"'\s]+)["']?/i.exec(line);
    const workflowUse = usesMatch?.[1];
    if (workflowUse) {
      addAll(technologyKeys, getDetectionKeys(detectionMaps.workflowUses, workflowUse));
    }
  }
}

function addTerraformDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  technologyKeys.add("terraform");

  const resourceMatches = text.matchAll(/resource\s+"([^"]+)"/g);
  for (const match of resourceMatches) {
    const resourceType = match[1];
    if (resourceType) {
      addAll(technologyKeys, terraformResourceMap[resourceType] ?? []);
    }
  }

  for (const [resourceType, keys] of Object.entries(terraformResourceMap)) {
    if (text.includes(resourceType)) {
      addAll(technologyKeys, keys);
    }
  }
}

function addCloudFormationDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  let hasCloudFormationResource = false;
  for (const [resourceType, keys] of Object.entries(cloudFormationResourceMap)) {
    if (text.includes(resourceType)) {
      hasCloudFormationResource = true;
      addAll(technologyKeys, keys);
    }
  }

  if (hasCloudFormationResource) {
    technologyKeys.add("aws_cloudformation");
  }
}

function addPulumiDetections(
  technologyKeys: Set<TechnologyKey>,
  text: string,
) {
  technologyKeys.add("pulumi");

  const normalizedText = text.toLowerCase();
  for (const [resourceType, keys] of Object.entries(pulumiResourceMap)) {
    if (normalizedText.includes(resourceType.toLowerCase())) {
      addAll(technologyKeys, keys);
    }
  }

  const textPatterns: readonly {
    needle: string;
    keys: readonly TechnologyKey[];
  }[] = [
    { needle: "aws.s3.bucket", keys: ["aws_s3"] },
    { needle: "aws.lambda.function", keys: ["aws_lambda"] },
    { needle: "aws.dynamodb.table", keys: ["aws_dynamodb"] },
    { needle: "aws.ec2.instance", keys: ["aws_ec2"] },
    { needle: "aws.ecs.service", keys: ["aws_ecs"] },
    { needle: "aws.eks.cluster", keys: ["aws_eks"] },
    { needle: "aws.sqs.queue", keys: ["aws_sqs"] },
    { needle: "aws.sns.topic", keys: ["aws_sns"] },
    { needle: "aws.iam.role", keys: ["aws_iam"] },
    { needle: "gcp.cloudrun.service", keys: ["gcp_cloud_run"] },
    { needle: "gcp.storage.bucket", keys: ["gcp_cloud_storage"] },
    { needle: "gcp.compute.instance", keys: ["gcp_compute_engine"] },
    { needle: "gcp.container.cluster", keys: ["gcp_gke"] },
    { needle: "gcp.sql.databaseinstance", keys: ["gcp_cloud_sql"] },
    { needle: "azure.storage.storageaccount", keys: ["azure_blob_storage"] },
    { needle: "azure.containerservice.managedcluster", keys: ["azure_aks"] },
    { needle: "azure.documentdb.databaseaccount", keys: ["azure_cosmos_db"] },
  ];

  for (const { needle, keys } of textPatterns) {
    if (normalizedText.includes(needle)) {
      addAll(technologyKeys, keys);
    }
  }
}

function addTextDetections(technologyKeys: Set<TechnologyKey>, text: string) {
  const normalizedText = text.toLowerCase();
  for (const [needle, keys] of detectionMaps.text) {
    if (normalizedText.includes(needle)) {
      addAll(technologyKeys, keys);
    }
  }
  for (const [envVar, keys] of detectionMaps.envVars) {
    if (text.includes(envVar)) {
      addAll(technologyKeys, keys);
    }
  }
}

function collectDependencyNames(packageJson: Record<string, unknown>): string[] {
  const fields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  const names: string[] = [];
  for (const field of fields) {
    const dependencies = packageJson[field];
    if (isRecord(dependencies)) {
      names.push(...Object.keys(dependencies));
    }
  }
  return names;
}

function selectRepositoriesForBudget(
  repositories: RepositorySummary[],
): RepositorySummary[] {
  const groups = new Map<string, RepositorySummary[]>();
  for (const repository of repositories) {
    const groupKey = repository.primaryLanguage ?? "unknown";
    const group = groups.get(groupKey) ?? [];
    group.push(repository);
    groups.set(groupKey, group);
  }

  const sortedGroups = Array.from(groups.values())
    .map((group) => group.sort(compareRepositoriesForSampling))
    .sort((a, b) => {
      const first = a[0];
      const second = b[0];
      if (!first && !second) {
        return 0;
      }
      if (!first) {
        return 1;
      }
      if (!second) {
        return -1;
      }
      return compareRepositoriesForSampling(first, second);
    });

  const selected: RepositorySummary[] = [];
  let cursor = 0;
  while (selected.length < MAX_REPOSITORIES_TO_ANALYZE) {
    let added = false;
    for (const group of sortedGroups) {
      const repository = group[cursor];
      if (!repository) {
        continue;
      }
      selected.push(repository);
      added = true;
      if (selected.length >= MAX_REPOSITORIES_TO_ANALYZE) {
        break;
      }
    }
    if (!added) {
      break;
    }
    cursor += 1;
  }

  return selected;
}

function compareRepositoriesForSampling(
  a: RepositorySummary,
  b: RepositorySummary,
): number {
  const stars = b.stargazersCount - a.stargazersCount;
  if (stars !== 0) {
    return stars;
  }
  return compareNullableDates(b.updatedAt, a.updatedAt);
}

async function appendAnalysisLog(
  ctx: ActionCtx,
  userId: Id<"users">,
  runId: string,
  level: "info" | "warn" | "error",
  message: string,
  repository?: string,
) {
  await ctx.runMutation(internal.githubAnalysisLogs.append, {
    runId,
    userId,
    createdAt: Date.now(),
    level,
    message,
    ...(repository ? { repository } : {}),
  });
}

async function getCurrentUserGithubInstallationId(
  ctx: ActionCtx,
): Promise<number | undefined> {
  const installation: { githubInstallationId: number | undefined } =
    await ctx.runQuery(api.users.getGithubInstallationForCurrentUser, {});
  return installation.githubInstallationId;
}

function createGitHubRequestBudget(limit: number): GitHubRequestBudget {
  return {
    limit,
    used: 0,
    exhausted: false,
    warnings: [],
  };
}

function spendGitHubRequest(
  requestBudget: GitHubRequestBudget,
  url: string,
): boolean {
  if (requestBudget.used >= requestBudget.limit) {
    if (!requestBudget.exhausted) {
      const endpoint = new URL(url);
      requestBudget.warnings.push(
        `GitHub API request budget reached before ${endpoint.pathname}.`,
      );
    }
    requestBudget.exhausted = true;
    return false;
  }

  requestBudget.used += 1;
  return true;
}

async function createInstallationToken(
  installationId: number,
  requestBudget: GitHubRequestBudget,
): Promise<string> {
  const jwt = createGitHubAppJwt();
  const response = await githubJson(
    `${GITHUB_API_URL}/app/installations/${installationId}/access_tokens`,
    jwt,
    "POST",
    requestBudget,
  );

  if (!isRecord(response.data)) {
    throw new Error("GitHub did not return an installation token.");
  }

  const token = readString(response.data, "token");
  if (!token) {
    throw new Error("GitHub installation token response was missing token.");
  }
  return token;
}

function createGitHubAppJwt(): string {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyBase64 = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!appId || !privateKeyBase64) {
    throw new Error("GitHub App env is missing.");
  }

  const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");
  return `${unsignedToken}.${signature}`;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

async function listInstallationRepositories(
  token: string,
  requestBudget: GitHubRequestBudget,
): Promise<RepositorySummary[]> {
  const repositories: RepositorySummary[] = [];
  let page = 1;
  while (page <= MAX_REPOSITORY_LIST_PAGES && !requestBudget.exhausted) {
    const response = await githubJson(
      `${GITHUB_API_URL}/installation/repositories?per_page=100&page=${page}`,
      token,
      "GET",
      requestBudget,
    );
    if (!isRecord(response.data)) {
      break;
    }

    const repositoriesValue = response.data.repositories;
    if (!Array.isArray(repositoriesValue)) {
      break;
    }

    for (const item of repositoriesValue) {
      const repository = parseRepository(item);
      if (repository) {
        repositories.push(repository);
      }
    }
    if (repositoriesValue.length < 100) {
      break;
    }
    page += 1;
  }
  if (page > MAX_REPOSITORY_LIST_PAGES) {
    requestBudget.warnings.push(
      `Repository listing stopped after ${MAX_REPOSITORY_LIST_PAGES} pages to stay within the request budget.`,
    );
  }
  return repositories;
}

async function readLanguages(
  token: string,
  repositoryFullName: string,
  warnings: string[],
  requestBudget: GitHubRequestBudget,
): Promise<string[]> {
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/languages`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 409) {
    warnings.push(`${repositoryFullName} is empty.`);
    return [];
  }
  if (!isRecord(response.data)) {
    warnings.push(`Could not read languages for ${repositoryFullName}.`);
    return [];
  }

  return Object.entries(response.data)
    .filter(([, bytes]) => typeof bytes === "number" && bytes > 0)
    .sort(([, a], [, b]) => {
      const aValue = typeof a === "number" ? a : 0;
      const bValue = typeof b === "number" ? b : 0;
      return bValue - aValue;
    })
    .map(([language]) => language);
}

async function readDirectory(
  token: string,
  repositoryFullName: string,
  path: string,
  requestBudget: GitHubRequestBudget,
): Promise<DirectoryEntry[]> {
  const encodedPath = encodeRepositoryPath(path);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/contents/${encodedPath}`,
    token,
    "GET",
    requestBudget,
  );
  if (
    response.status === 404 ||
    response.status === 409 ||
    !Array.isArray(response.data)
  ) {
    return [];
  }

  const entries: DirectoryEntry[] = [];
  for (const item of response.data) {
    if (!isRecord(item)) {
      continue;
    }
    const name = readString(item, "name");
    const itemPath = readString(item, "path");
    const type = readString(item, "type");
    if (!name || !itemPath) {
      continue;
    }
    entries.push({
      name,
      path: itemPath,
      type: type === "file" || type === "dir" ? type : "other",
    });
  }
  return entries;
}

async function readRepositoryTree(
  token: string,
  repositoryFullName: string,
  defaultBranch: string,
  requestBudget: GitHubRequestBudget,
): Promise<string[]> {
  const encodedBranch = encodeURIComponent(defaultBranch);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/git/trees/${encodedBranch}?recursive=1`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 409) {
    return [];
  }
  if (!isRecord(response.data)) {
    return [];
  }

  const tree = response.data.tree;
  if (!Array.isArray(tree)) {
    return [];
  }

  const paths: string[] = [];
  for (const item of tree) {
    if (!isRecord(item)) {
      continue;
    }
    const type = readString(item, "type");
    const path = readString(item, "path");
    if (type === "blob" && path) {
      paths.push(path);
    }
  }
  return paths.sort();
}

async function readFile(
  token: string,
  repositoryFullName: string,
  path: string,
  requestBudget: GitHubRequestBudget,
): Promise<FileReadResult> {
  const encodedPath = encodeRepositoryPath(path);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/contents/${encodedPath}`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 404 || response.status === 409) {
    return { exists: false, text: null };
  }

  if (!isRecord(response.data)) {
    return { exists: true, text: null };
  }

  const encoding = readString(response.data, "encoding");
  const content = readString(response.data, "content");
  if (encoding !== "base64" || !content) {
    return { exists: true, text: null };
  }

  return {
    exists: true,
    text: Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8"),
  };
}

function encodeRepositoryPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function githubJson(
  url: string,
  token: string,
  method: "GET" | "POST",
  requestBudget: GitHubRequestBudget,
): Promise<{ status: number; data: unknown }> {
  if (!spendGitHubRequest(requestBudget, url)) {
    return { status: 0, data: null };
  }

  const response = await fetch(url, {
    method,
    signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 404 || response.status === 409) {
    return { status: response.status, data: null };
  }

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = isRecord(data) ? readString(data, "message") : null;
    const endpoint = new URL(url);
    const rateLimitReset = response.headers.get("x-ratelimit-reset");
    const resetUnixSeconds = rateLimitReset ? Number(rateLimitReset) : null;
    const resetAt =
      resetUnixSeconds !== null && Number.isFinite(resetUnixSeconds)
        ? ` Reset at ${new Date(resetUnixSeconds * 1000).toISOString()}.`
        : "";
    const remaining = response.headers.get("x-ratelimit-remaining");
    const remainingText = remaining ? ` Remaining: ${remaining}.` : "";
    throw new Error(
      `GitHub API ${response.status} ${endpoint.pathname}: ${
        message ?? "Request failed"
      }${remainingText}${resetAt}`,
    );
  }
  return { status: response.status, data };
}

function parseRepository(value: unknown): RepositorySummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const fullName = readString(value, "full_name");
  const name = readString(value, "name");
  const htmlUrl = readString(value, "html_url");
  const homepage = readString(value, "homepage");
  const defaultBranch = readString(value, "default_branch");
  if (!fullName || !name || !htmlUrl || !defaultBranch) {
    return null;
  }

  const description = readString(value, "description");
  const updatedAt = readString(value, "updated_at");
  const primaryLanguage = readString(value, "language");
  const primaryTechnology = getPrimaryTechnologyFromLanguage(primaryLanguage);
  const privateValue = value.private;
  const forkValue = value.fork;
  const starsValue = value.stargazers_count;

  return {
    fullName,
    name,
    description,
    htmlUrl,
    homepage: homepage && homepage.trim().length > 0 ? homepage : null,
    defaultBranch,
    primaryLanguage,
    primaryTechnologyKey: primaryTechnology?.key ?? null,
    primaryTechnologyName: primaryTechnology?.name ?? null,
    private: typeof privateValue === "boolean" ? privateValue : false,
    fork: typeof forkValue === "boolean" ? forkValue : false,
    stargazersCount: typeof starsValue === "number" ? starsValue : 0,
    updatedAt,
  };
}

function sortRepositoriesForSelection(
  repositories: RepositorySummary[],
): RepositorySummary[] {
  return [...repositories].sort((a, b) => {
    if (a.fork !== b.fork) {
      return a.fork ? 1 : -1;
    }
    const stars = b.stargazersCount - a.stargazersCount;
    if (stars !== 0) {
      return stars;
    }
    return compareNullableDates(b.updatedAt, a.updatedAt);
  });
}

function toProductRepository(repository: RepositorySummary) {
  return {
    fullName: repository.fullName,
    name: repository.name,
    description: repository.description,
    htmlUrl: repository.htmlUrl,
    homepage: repository.homepage,
    primaryLanguage: repository.primaryLanguage,
    primaryTechnologyKey: repository.primaryTechnologyKey,
    primaryTechnologyName: repository.primaryTechnologyName,
    private: repository.private,
    fork: repository.fork,
    stargazersCount: repository.stargazersCount,
    updatedAt: repository.updatedAt,
  };
}

function getPrimaryTechnologyFromLanguage(language: string | null) {
  if (!language) {
    return null;
  }

  const technologyKey = getDetectionKeys(detectionMaps.languages, language)[0];
  return technologyKey === undefined ? null : catalogByKey.get(technologyKey) ?? null;
}

function parseInstallation(value: unknown): InstallationSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const account = value.account;
  const repositorySelection = readString(value, "repository_selection");
  const targetType = readString(value, "target_type");
  if (
    typeof id !== "number" ||
    !isRecord(account) ||
    !repositorySelection ||
    !targetType
  ) {
    return null;
  }

  const accountLogin = readString(account, "login");
  const accountType = readString(account, "type");
  if (!accountLogin || !accountType) {
    return null;
  }

  return {
    id,
    accountLogin,
    accountType,
    repositorySelection,
    targetType,
  };
}

function recordTechnology(
  detections: Map<TechnologyKey, DetectedTechnology>,
  repoTechnologyKeys: Set<TechnologyKey>,
  key: TechnologyKey,
  score: number,
  source: DetectionSource,
) {
  addTechnology(detections, key, score, source);
  repoTechnologyKeys.add(key);
}

function addTechnology(
  detections: Map<TechnologyKey, DetectedTechnology>,
  key: TechnologyKey,
  score: number,
  source: DetectionSource,
) {
  const technology = catalogByKey.get(key);
  if (!technology) {
    return;
  }

  const existing = detections.get(key);
  if (existing) {
    existing.score += score;
    existing.confidence = Math.min(0.98, existing.confidence + score / 100);
    existing.sources.push(source);
    return;
  }

  detections.set(key, {
    key,
    name: technology.name,
    category: technology.categoryName,
    confidence: Math.min(0.95, 0.45 + score / 20),
    score,
    sources: [source],
  });
}

function buildDetectionMaps(): DetectionMaps {
  const maps: DetectionMaps = {
    languages: new Map(),
    npm: new Map(),
    python: new Map(),
    ruby: new Map(),
    go: new Map(),
    rust: new Map(),
    php: new Map(),
    dart: new Map(),
    swift: new Map(),
    java: new Map(),
    files: new Map(),
    dockerImages: new Map(),
    workflowUses: new Map(),
    envVars: new Map(),
    text: new Map(),
  };

  for (const technology of allTechnologies) {
    const detection = technology.detection;
    if (!detection) {
      continue;
    }
    addDetectionList(maps.languages, detection.githubLanguages, technology.key);
    addDetectionList(maps.npm, detection.npmPackages, technology.key);
    addDetectionList(maps.python, detection.pythonPackages, technology.key);
    addDetectionList(maps.ruby, detection.rubyGems, technology.key);
    addDetectionList(maps.go, detection.goModules, technology.key);
    addDetectionList(maps.rust, detection.rustCrates, technology.key);
    addDetectionList(maps.php, detection.phpPackages, technology.key);
    addDetectionList(maps.dart, detection.dartPackages, technology.key);
    addDetectionList(maps.swift, detection.swiftPackages, technology.key);
    addDetectionList(maps.java, detection.javaPackages, technology.key);
    addDetectionList(maps.files, detection.files, technology.key);
    addDetectionList(maps.dockerImages, detection.dockerImages, technology.key);
    addDetectionList(maps.workflowUses, detection.workflowUses, technology.key);
    addDetectionList(maps.envVars, detection.envVars, technology.key, false);
    addDetectionList(maps.text, detection.text, technology.key);
  }

  return maps;
}

function addDetectionList(
  map: Map<string, TechnologyKey[]>,
  values: readonly string[] | undefined,
  key: TechnologyKey,
  normalize = true,
) {
  if (!values) {
    return;
  }

  for (const value of values) {
    const mapKey = normalize ? normalizeLookup(value) : value;
    const existing = map.get(mapKey) ?? [];
    existing.push(key);
    map.set(mapKey, existing);
  }
}

function getDetectionKeys(
  map: Map<string, TechnologyKey[]>,
  value: string,
): TechnologyKey[] {
  return map.get(normalizeLookup(value)) ?? [];
}

function addAll(target: Set<TechnologyKey>, values: readonly TechnologyKey[]) {
  for (const value of values) {
    target.add(value);
  }
}

function mergeTechnologyKeys(
  first: TechnologyKey[],
  second: TechnologyKey[],
): TechnologyKey[] {
  return Array.from(new Set([...first, ...second]));
}

function target(
  path: string,
  kind: ManifestKind,
  baselineKeys: TechnologyKey[],
): ManifestTarget {
  return {
    path,
    kind,
    baselineKeys,
  };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizePackageName(line: string): string | null {
  const trimmed = line.trim().toLowerCase();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return null;
  }
  const withoutExtras = trimmed.split("[")[0] ?? trimmed;
  const packageName = withoutExtras.split(/[<>=~!;\s]+/)[0]?.trim();
  return packageName || null;
}

function normalizeLookup(value: string): string {
  return value.trim().toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function compareNullableDates(a: string | null, b: string | null): number {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  return new Date(a).getTime() - new Date(b).getTime();
}
