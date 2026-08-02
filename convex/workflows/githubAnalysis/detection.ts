import {
  allTechnologies,
  type CanonicalTechnology,
  type TechnologyKey,
} from "../../../data/tech-stack";

import type {
  DetectedTechnology,
  DetectionMaps,
  DetectionSource,
  ManifestKind,
  ManifestTarget,
  RepositoryAnalysis,
  RepositorySummary,
} from "./types";

const MAX_REPOSITORIES_TO_ANALYZE = 30;

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

export function addTreePathTarget(
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

export function compareManifestTargets(a: ManifestTarget, b: ManifestTarget): number {
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

export function inferTechnologiesFromManifest(
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

export function selectRepositoriesForBudget(
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

export function compareRepositoriesForSampling(
  a: RepositorySummary,
  b: RepositorySummary,
): number {
  const stars = b.stargazersCount - a.stargazersCount;
  if (stars !== 0) {
    return stars;
  }
  return compareNullableDates(b.updatedAt, a.updatedAt);
}


export function buildDependencySummary(
  analysis: RepositoryAnalysis,
  technologyKeys: TechnologyKey[],
) {
  const technologyNames = technologyKeys
    .map((key) => catalogByKey.get(key)?.name ?? key)
    .slice(0, 24);
  const lines = [
    `Repository: ${analysis.repository.fullName}`,
    `Default branch: ${analysis.repository.defaultBranch}`,
  ];

  if (analysis.repository.primaryLanguage) {
    lines.push(`Primary language: ${analysis.repository.primaryLanguage}`);
  }
  if (analysis.filesRead.length > 0) {
    lines.push(`Dependency/config files read: ${analysis.filesRead.join(", ")}`);
  } else {
    lines.push("Dependency/config files read: none");
  }
  if (technologyNames.length > 0) {
    lines.push(`Detected technology keys: ${technologyNames.join(", ")}`);
  } else {
    lines.push("Detected technology keys: none");
  }
  if (analysis.warnings.length > 0) {
    lines.push(`Warnings: ${analysis.warnings.join("; ")}`);
  }

  return lines.join("\n");
}

export function getPrimaryTechnologyFromLanguage(language: string | null) {
  if (!language) {
    return null;
  }

  const technologyKey = getDetectionKeys(detectionMaps.languages, language)[0];
  return technologyKey === undefined ? null : catalogByKey.get(technologyKey) ?? null;
}

export function recordTechnology(
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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

export function compareNullableDates(a: string | null, b: string | null): number {
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

export function getTechnologyKeysForLanguage(
  language: string,
): TechnologyKey[] {
  return getDetectionKeys(detectionMaps.languages, language);
}
