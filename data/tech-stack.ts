export type TechnologyCategoryKey =
  | "languages"
  | "runtimes"
  | "frontend"
  | "mobile"
  | "backend_api"
  | "app_platform_baas"
  | "databases"
  | "orm_database_tooling"
  | "data_analytics"
  | "cloud_hosting"
  | "aws"
  | "google_cloud"
  | "azure"
  | "ai_models"
  | "ai_platforms"
  | "ai_product_apis"
  | "ai_search_retrieval"
  | "vector_rag"
  | "ai_frameworks"
  | "ai_observability_evals"
  | "ai_patterns"
  | "product_apis"
  | "devops_infrastructure"
  | "observability"
  | "testing_quality"
  | "design_collaboration";

export type TechnologyTier = "core" | "extended" | "legacy";

export type TechnologyDetection = {
  githubLanguages?: readonly string[];
  npmPackages?: readonly string[];
  pythonPackages?: readonly string[];
  rubyGems?: readonly string[];
  goModules?: readonly string[];
  rustCrates?: readonly string[];
  phpPackages?: readonly string[];
  dartPackages?: readonly string[];
  swiftPackages?: readonly string[];
  javaPackages?: readonly string[];
  files?: readonly string[];
  dockerImages?: readonly string[];
  workflowUses?: readonly string[];
  envVars?: readonly string[];
  text?: readonly string[];
};

export type TechnologyLogo =
  | {
      source: "simple-icons";
      slug: string;
    }
  | {
      source: "aws-icons" | "google-cloud-icons" | "azure-icons";
      path: string;
    }
  | {
      source: "manual";
      path: string;
    };

export type Technology = {
  key: string;
  name: string;
  description: string;
  tier: TechnologyTier;
  logo?: TechnologyLogo;
  logoKey?: string;
  aliases?: readonly string[];
  detection?: TechnologyDetection;
};

export type TechnologyCategory = {
  key: TechnologyCategoryKey;
  name: string;
  description: string;
  technologies: readonly Technology[];
};

function defineTechStack<const T extends readonly TechnologyCategory[]>(
  categories: T,
): T {
  return categories;
}

export const techStackCategories = defineTechStack([
  {
    key: "languages",
    name: "Languages",
    description: "Programming languages used to build the product.",
    technologies: [
      tech("typescript", "TypeScript", "Typed JavaScript for application development.", "core", {
        logo: { source: "simple-icons", slug: "typescript" },
        githubLanguages: ["TypeScript"],
        npmPackages: ["typescript"],
        files: ["tsconfig.json"],
        aliases: ["ts"],
      }),
      tech("javascript", "JavaScript", "The language of the web platform.", "core", {
        logo: { source: "simple-icons", slug: "javascript" },
        githubLanguages: ["JavaScript"],
        aliases: ["js"],
      }),
      tech("python", "Python", "General-purpose language widely used for backend, automation, and AI.", "core", {
        logo: { source: "simple-icons", slug: "python" },
        githubLanguages: ["Python"],
        files: ["requirements.txt", "pyproject.toml", "Pipfile", "setup.py"],
      }),
      tech("go", "Go", "Compiled language for services and cloud infrastructure.", "core", {
        logo: { source: "simple-icons", slug: "go" },
        githubLanguages: ["Go"],
        files: ["go.mod"],
        aliases: ["golang"],
      }),
      tech("rust", "Rust", "Systems language focused on safety and performance.", "core", {
        logo: { source: "simple-icons", slug: "rust" },
        githubLanguages: ["Rust"],
        files: ["Cargo.toml"],
      }),
      tech("java", "Java", "JVM language used for backend and enterprise systems.", "core", {
        githubLanguages: ["Java"],
        files: ["pom.xml", "build.gradle", "build.gradle.kts"],
      }),
      tech("kotlin", "Kotlin", "Modern JVM and Android language.", "core", {
        logo: { source: "simple-icons", slug: "kotlin" },
        githubLanguages: ["Kotlin"],
      }),
      tech("swift", "Swift", "Apple platform language.", "core", {
        logo: { source: "simple-icons", slug: "swift" },
        githubLanguages: ["Swift"],
        files: ["Package.swift"],
      }),
      tech("ruby", "Ruby", "Dynamic language popular for web applications.", "core", {
        logo: { source: "simple-icons", slug: "ruby" },
        githubLanguages: ["Ruby"],
        files: ["Gemfile"],
      }),
      tech("php", "PHP", "Server-side language for web applications.", "core", {
        logo: { source: "simple-icons", slug: "php" },
        githubLanguages: ["PHP"],
        files: ["composer.json"],
      }),
      tech("csharp", "C#", "Microsoft language for .NET applications.", "core", {
        logo: { source: "simple-icons", slug: "sharp" },
        githubLanguages: ["C#"],
        aliases: ["c_sharp"],
      }),
      tech("cpp", "C++", "Systems and performance-oriented language.", "core", {
        logo: { source: "simple-icons", slug: "cplusplus" },
        githubLanguages: ["C++"],
        aliases: ["c_plus_plus"],
      }),
      tech("c", "C", "Low-level systems programming language.", "extended", {
        logo: { source: "simple-icons", slug: "c" },
        githubLanguages: ["C"],
      }),
      tech("dart", "Dart", "Client language used with Flutter.", "core", {
        logo: { source: "simple-icons", slug: "dart" },
        githubLanguages: ["Dart"],
        files: ["pubspec.yaml"],
      }),
      tech("elixir", "Elixir", "Functional language for concurrent systems.", "extended", {
        logo: { source: "simple-icons", slug: "elixir" },
        githubLanguages: ["Elixir"],
      }),
      tech("scala", "Scala", "JVM language combining object-oriented and functional programming.", "extended", {
        logo: { source: "simple-icons", slug: "scala" },
        githubLanguages: ["Scala"],
      }),
      tech("r", "R", "Language for statistics and data analysis.", "extended", {
        logo: { source: "simple-icons", slug: "r" },
        githubLanguages: ["R"],
      }),
      tech("sql", "SQL", "Language for querying relational databases.", "core", {
        githubLanguages: ["SQL", "PLpgSQL", "TSQL"],
      }),
      tech("shell", "Shell", "Command-line scripting for automation.", "core", {
        logo: { source: "simple-icons", slug: "gnubash" },
        githubLanguages: ["Shell"],
        aliases: ["bash", "shell_bash"],
      }),
    ],
  },
  {
    key: "runtimes",
    name: "Runtimes",
    description: "Execution environments and runtime platforms.",
    technologies: [
      tech("nodejs", "Node.js", "JavaScript runtime for server-side applications.", "core", {
        logo: { source: "simple-icons", slug: "nodedotjs" },
        npmPackages: ["@types/node"],
        files: ["package.json"],
        aliases: ["node", "node.js"],
      }),
      tech("bun", "Bun", "Fast JavaScript runtime and package manager.", "core", {
        logo: { source: "simple-icons", slug: "bun" },
        files: ["bun.lock", "bun.lockb"],
      }),
      tech("deno", "Deno", "Secure JavaScript and TypeScript runtime.", "extended", {
        logo: { source: "simple-icons", slug: "deno" },
        files: ["deno.json", "deno.jsonc"],
      }),
      tech("jvm", "JVM", "Java Virtual Machine runtime ecosystem.", "extended", {
        files: ["pom.xml", "build.gradle", "build.gradle.kts"],
      }),
      tech("dotnet", ".NET", "Runtime and framework for C# and F# applications.", "extended", {
        logo: { source: "simple-icons", slug: "dotnet" },
        files: ["global.json"],
        aliases: [".net"],
      }),
    ],
  },
  {
    key: "frontend",
    name: "Frontend",
    description: "Web UI frameworks, styling, state, and frontend tooling.",
    technologies: [
      tech("react", "React", "Library for building user interfaces.", "core", {
        logo: { source: "simple-icons", slug: "react" },
        npmPackages: ["react", "react-dom"],
      }),
      tech("nextjs", "Next.js", "React framework for full-stack web applications.", "core", {
        logo: { source: "simple-icons", slug: "nextdotjs" },
        npmPackages: ["next"],
        files: ["next.config.js", "next.config.mjs", "next.config.ts"],
        aliases: ["next.js"],
      }),
      tech("vuejs", "Vue.js", "Progressive frontend framework.", "core", {
        logo: { source: "simple-icons", slug: "vuedotjs" },
        npmPackages: ["vue", "@vue/runtime-core"],
        aliases: ["vue"],
      }),
      tech("nuxtjs", "Nuxt", "Vue framework for full-stack applications.", "core", {
        logo: { source: "simple-icons", slug: "nuxt" },
        npmPackages: ["nuxt"],
        files: ["nuxt.config.js", "nuxt.config.ts"],
        aliases: ["nuxt"],
      }),
      tech("svelte", "Svelte", "Compiler-driven UI framework.", "core", {
        logo: { source: "simple-icons", slug: "svelte" },
        npmPackages: ["svelte"],
      }),
      tech("sveltekit", "SvelteKit", "Full-stack framework for Svelte.", "core", {
        npmPackages: ["@sveltejs/kit"],
      }),
      tech("angular", "Angular", "Full-featured frontend framework.", "extended", {
        logo: { source: "simple-icons", slug: "angular" },
        npmPackages: ["@angular/core"],
        files: ["angular.json"],
      }),
      tech("remix", "Remix", "Full-stack React framework.", "core", {
        logo: { source: "simple-icons", slug: "remix" },
        npmPackages: ["@remix-run/react", "@remix-run/node"],
      }),
      tech("astro", "Astro", "Content-focused web framework.", "core", {
        logo: { source: "simple-icons", slug: "astro" },
        npmPackages: ["astro"],
        files: ["astro.config.mjs", "astro.config.ts"],
      }),
      tech("solidjs", "SolidJS", "Fine-grained reactive UI library.", "extended", {
        logo: { source: "simple-icons", slug: "solid" },
        npmPackages: ["solid-js"],
      }),
      tech("qwik", "Qwik", "Resumable web framework.", "extended", {
        logo: { source: "simple-icons", slug: "qwik" },
        npmPackages: ["@builder.io/qwik"],
      }),
      tech("vite", "Vite", "Fast frontend build tool.", "core", {
        logo: { source: "simple-icons", slug: "vite" },
        npmPackages: ["vite"],
        files: ["vite.config.js", "vite.config.ts", "vite.config.mjs"],
      }),
      tech("webpack", "Webpack", "JavaScript module bundler.", "extended", {
        logo: { source: "simple-icons", slug: "webpack" },
        npmPackages: ["webpack"],
        files: ["webpack.config.js"],
      }),
      tech("turbopack", "Turbopack", "Rust-based bundler from Vercel.", "extended", {
        npmPackages: ["turbopack"],
      }),
      tech("tailwind_css", "Tailwind CSS", "Utility-first CSS framework.", "core", {
        logo: { source: "simple-icons", slug: "tailwindcss" },
        npmPackages: ["tailwindcss", "@tailwindcss/postcss", "@tailwindcss/vite"],
        files: ["tailwind.config.js", "tailwind.config.ts"],
      }),
      tech("shadcn_ui", "shadcn/ui", "Composable UI components built on Radix and Tailwind.", "core", {
        logo: { source: "simple-icons", slug: "shadcnui" },
        npmPackages: ["shadcn", "shadcn-ui"],
        files: ["components.json"],
        aliases: ["shadcn"],
        logoKey: "shadcn",
      }),
      tech("radix_ui", "Radix UI", "Unstyled accessible UI primitives.", "core", {
        logo: { source: "simple-icons", slug: "radixui" },
        npmPackages: ["@radix-ui/react-dialog", "@radix-ui/react-slot", "@radix-ui/react-popover"],
        aliases: ["radix"],
      }),
      tech("mui", "MUI", "React component library implementing Material Design.", "core", {
        logo: { source: "simple-icons", slug: "mui" },
        npmPackages: ["@mui/material", "@mui/system"],
        aliases: ["material_ui", "material-ui"],
      }),
      tech("chakra_ui", "Chakra UI", "Accessible component library for React.", "extended", {
        logo: { source: "simple-icons", slug: "chakraui" },
        npmPackages: ["@chakra-ui/react"],
      }),
      tech("mantine", "Mantine", "React component and hooks library.", "extended", {
        logo: { source: "simple-icons", slug: "mantine" },
        npmPackages: ["@mantine/core"],
      }),
      tech("ant_design", "Ant Design", "Enterprise React UI library.", "extended", {
        logo: { source: "simple-icons", slug: "antdesign" },
        npmPackages: ["antd"],
      }),
      tech("tanstack_query", "TanStack Query", "Async state and server-state library.", "core", {
        logo: { source: "simple-icons", slug: "reactquery" },
        npmPackages: ["@tanstack/react-query", "@tanstack/query-core"],
      }),
      tech("tanstack_router", "TanStack Router", "Type-safe router for React.", "extended", {
        logo: { source: "simple-icons", slug: "reactrouter" },
        npmPackages: ["@tanstack/react-router"],
      }),
      tech("redux", "Redux", "Predictable state container.", "extended", {
        logo: { source: "simple-icons", slug: "redux" },
        npmPackages: ["redux", "@reduxjs/toolkit", "react-redux"],
      }),
      tech("zustand", "Zustand", "Small state-management library for React.", "core", {
        npmPackages: ["zustand"],
      }),
      tech("jotai", "Jotai", "Atomic state management for React.", "extended", {
        npmPackages: ["jotai"],
      }),
      tech("react_hook_form", "React Hook Form", "Form state management for React.", "core", {
        logo: { source: "simple-icons", slug: "reacthookform" },
        npmPackages: ["react-hook-form"],
      }),
      tech("zod", "Zod", "TypeScript-first schema validation.", "core", {
        logo: { source: "simple-icons", slug: "zod" },
        npmPackages: ["zod"],
      }),
      tech("valibot", "Valibot", "Lightweight schema validation library.", "extended", {
        npmPackages: ["valibot"],
      }),
    ],
  },
  {
    key: "mobile",
    name: "Mobile",
    description: "Mobile and desktop application frameworks.",
    technologies: [
      tech("react_native", "React Native", "React framework for native mobile apps.", "core", {
        logo: { source: "simple-icons", slug: "react" },
        npmPackages: ["react-native"],
      }),
      tech("expo", "Expo", "React Native app platform and tooling.", "core", {
        logo: { source: "simple-icons", slug: "expo" },
        npmPackages: ["expo"],
        files: ["app.json", "app.config.js", "app.config.ts"],
      }),
      tech("flutter", "Flutter", "Cross-platform UI toolkit.", "core", {
        logo: { source: "simple-icons", slug: "flutter" },
        dartPackages: ["flutter"],
        files: ["pubspec.yaml"],
      }),
      tech("swiftui", "SwiftUI", "Declarative UI framework for Apple platforms.", "core", {
        text: ["SwiftUI"],
      }),
      tech("uikit", "UIKit", "Apple UI framework for iOS and iPadOS.", "extended", {
        logo: { source: "simple-icons", slug: "uikit" },
        text: ["UIKit"],
      }),
      tech("jetpack_compose", "Jetpack Compose", "Modern Android UI toolkit.", "core", {
        logo: { source: "simple-icons", slug: "jetpackcompose" },
        javaPackages: ["androidx.compose"],
      }),
      tech("kotlin_multiplatform", "Kotlin Multiplatform", "Kotlin framework for sharing code across platforms.", "extended", {
        logo: { source: "simple-icons", slug: "kotlin" },
        text: ["kotlin-multiplatform", "kotlin(\"multiplatform\")"],
      }),
      tech("electron", "Electron", "Desktop app framework using web technologies.", "extended", {
        logo: { source: "simple-icons", slug: "electron" },
        npmPackages: ["electron"],
      }),
      tech("tauri", "Tauri", "Lightweight desktop app framework.", "extended", {
        logo: { source: "simple-icons", slug: "tauri" },
        npmPackages: ["@tauri-apps/cli"],
        rustCrates: ["tauri"],
        files: ["tauri.conf.json"],
      }),
      tech("capacitor", "Capacitor", "Native runtime for web apps.", "extended", {
        logo: { source: "simple-icons", slug: "capacitor" },
        npmPackages: ["@capacitor/core"],
      }),
      tech("ionic", "Ionic", "Cross-platform mobile UI toolkit.", "extended", {
        logo: { source: "simple-icons", slug: "ionic" },
        npmPackages: ["@ionic/react", "@ionic/angular", "@ionic/vue"],
      }),
    ],
  },
  {
    key: "backend_api",
    name: "Backend & API",
    description: "Backend frameworks, API layers, and server libraries.",
    technologies: [
      tech("hono", "Hono", "Small, fast web framework for edge and server runtimes.", "core", {
        logo: { source: "simple-icons", slug: "hono" },
        npmPackages: ["hono"],
      }),
      tech("express", "Express", "Minimal Node.js web framework.", "core", {
        logo: { source: "simple-icons", slug: "express" },
        npmPackages: ["express"],
        aliases: ["express.js"],
      }),
      tech("fastify", "Fastify", "Fast Node.js web framework.", "core", {
        logo: { source: "simple-icons", slug: "fastify" },
        npmPackages: ["fastify"],
      }),
      tech("nestjs", "NestJS", "Structured Node.js framework for scalable backend apps.", "core", {
        logo: { source: "simple-icons", slug: "nestjs" },
        npmPackages: ["@nestjs/core", "@nestjs/common"],
      }),
      tech("trpc", "tRPC", "End-to-end type-safe API layer.", "core", {
        logo: { source: "simple-icons", slug: "trpc" },
        npmPackages: ["@trpc/server", "@trpc/client"],
      }),
      tech("graphql", "GraphQL", "Query language and runtime for APIs.", "core", {
        logo: { source: "simple-icons", slug: "graphql" },
        npmPackages: ["graphql"],
      }),
      tech("apollo", "Apollo", "GraphQL client and server tooling.", "extended", {
        npmPackages: ["@apollo/client", "@apollo/server", "apollo-server"],
      }),
      tech("fastapi", "FastAPI", "Modern Python web framework for APIs.", "core", {
        logo: { source: "simple-icons", slug: "fastapi" },
        pythonPackages: ["fastapi"],
      }),
      tech("django", "Django", "High-level Python web framework.", "core", {
        logo: { source: "simple-icons", slug: "django" },
        pythonPackages: ["django"],
      }),
      tech("flask", "Flask", "Minimal Python web framework.", "extended", {
        logo: { source: "simple-icons", slug: "flask" },
        pythonPackages: ["flask"],
      }),
      tech("ruby_on_rails", "Ruby on Rails", "Full-stack Ruby web framework.", "core", {
        logo: { source: "simple-icons", slug: "rubyonrails" },
        rubyGems: ["rails"],
        aliases: ["rails"],
      }),
      tech("laravel", "Laravel", "PHP web application framework.", "core", {
        logo: { source: "simple-icons", slug: "laravel" },
        phpPackages: ["laravel/framework"],
      }),
      tech("spring_boot", "Spring Boot", "Java framework for production-grade applications.", "core", {
        logo: { source: "simple-icons", slug: "springboot" },
        javaPackages: ["org.springframework.boot", "spring-boot"],
        aliases: ["springboot"],
      }),
      tech("aspnet_core", "ASP.NET Core", "Cross-platform .NET web framework.", "extended", {
        logo: { source: "simple-icons", slug: "dotnet" },
        text: ["Microsoft.AspNetCore"],
        aliases: ["asp_net", "asp.net core"],
      }),
      tech("gin", "Gin", "HTTP web framework for Go.", "extended", {
        logo: { source: "simple-icons", slug: "gin" },
        goModules: ["github.com/gin-gonic/gin"],
      }),
      tech("echo", "Echo", "High performance Go web framework.", "extended", {
        goModules: ["github.com/labstack/echo"],
      }),
      tech("phoenix", "Phoenix", "Elixir web framework.", "extended", {
        text: ["phoenix"],
      }),
      tech("ktor", "Ktor", "Kotlin framework for connected applications.", "extended", {
        logo: { source: "simple-icons", slug: "ktor" },
        javaPackages: ["io.ktor"],
      }),
      tech("actix_web", "Actix Web", "Powerful Rust web framework.", "extended", {
        rustCrates: ["actix-web"],
      }),
    ],
  },
  {
    key: "app_platform_baas",
    name: "App Platform / BaaS",
    description: "Application platforms, backend-as-a-service, and realtime systems.",
    technologies: [
      tech("convex", "Convex", "Reactive backend platform with database, functions, and realtime sync.", "core", {
        logo: { source: "simple-icons", slug: "convex" },
        npmPackages: ["convex", "@convex-dev/auth"],
        files: ["convex/schema.ts", "convex.json"],
      }),
      tech("supabase", "Supabase", "Open source Firebase alternative built on Postgres.", "core", {
        logo: { source: "simple-icons", slug: "supabase" },
        npmPackages: ["@supabase/supabase-js", "@supabase/ssr"],
        pythonPackages: ["supabase"],
      }),
      tech("firebase", "Firebase", "Google app development platform.", "core", {
        logo: { source: "simple-icons", slug: "firebase" },
        npmPackages: ["firebase", "firebase-admin"],
        pythonPackages: ["firebase-admin"],
        aliases: ["gcp_firebase"],
      }),
      tech("appwrite", "Appwrite", "Open source backend server for web and mobile apps.", "extended", {
        logo: { source: "simple-icons", slug: "appwrite" },
        npmPackages: ["appwrite"],
      }),
      tech("hasura", "Hasura", "GraphQL engine for data APIs.", "extended", {
        logo: { source: "simple-icons", slug: "hasura" },
        files: ["config.yaml"],
      }),
      tech("pocketbase", "PocketBase", "Single-file backend with realtime database and auth.", "extended", {
        logo: { source: "simple-icons", slug: "pocketbase" },
      }),
      tech("neon", "Neon", "Serverless Postgres platform.", "core", {
        logo: { source: "simple-icons", slug: "neon" },
        aliases: ["neon postgres"],
      }),
      tech("turso", "Turso", "Edge SQLite database platform.", "core", {
        logo: { source: "simple-icons", slug: "turso" },
        npmPackages: ["@libsql/client"],
      }),
      tech("planetscale", "PlanetScale", "Serverless MySQL platform.", "extended", {
        logo: { source: "simple-icons", slug: "planetscale" },
        aliases: ["planet_scale"],
      }),
      tech("upstash", "Upstash", "Serverless Redis, Kafka, and vector platform.", "core", {
        logo: { source: "simple-icons", slug: "upstash" },
        npmPackages: ["@upstash/redis", "@upstash/vector", "@upstash/qstash"],
      }),
    ],
  },
  {
    key: "databases",
    name: "Databases",
    description: "Primary databases, caches, and search engines.",
    technologies: [
      tech("postgresql", "PostgreSQL", "Open source relational database.", "core", {
        logo: { source: "simple-icons", slug: "postgresql" },
        npmPackages: ["pg", "postgres"],
        pythonPackages: ["psycopg", "psycopg2", "asyncpg"],
        dockerImages: ["postgres"],
        aliases: ["postgres"],
      }),
      tech("mysql", "MySQL", "Popular relational database.", "core", {
        logo: { source: "simple-icons", slug: "mysql" },
        npmPackages: ["mysql", "mysql2"],
        dockerImages: ["mysql"],
      }),
      tech("sqlite", "SQLite", "Embedded relational database.", "core", {
        logo: { source: "simple-icons", slug: "sqlite" },
        npmPackages: ["sqlite3", "better-sqlite3"],
        pythonPackages: ["sqlite-utils"],
      }),
      tech("redis", "Redis", "In-memory data store and cache.", "core", {
        logo: { source: "simple-icons", slug: "redis" },
        npmPackages: ["redis", "ioredis"],
        pythonPackages: ["redis"],
        dockerImages: ["redis"],
      }),
      tech("mongodb", "MongoDB", "Document database.", "core", {
        logo: { source: "simple-icons", slug: "mongodb" },
        npmPackages: ["mongodb", "mongoose"],
        pythonPackages: ["pymongo", "motor"],
        dockerImages: ["mongo"],
      }),
      tech("clickhouse", "ClickHouse", "Column-oriented analytics database.", "core", {
        logo: { source: "simple-icons", slug: "clickhouse" },
        npmPackages: ["@clickhouse/client"],
        pythonPackages: ["clickhouse-connect"],
        dockerImages: ["clickhouse/clickhouse-server"],
      }),
      tech("cassandra", "Apache Cassandra", "Distributed wide-column database.", "extended", {
        logo: { source: "simple-icons", slug: "apachecassandra" },
        dockerImages: ["cassandra"],
      }),
      tech("mariadb", "MariaDB", "Open source relational database compatible with MySQL.", "extended", {
        logo: { source: "simple-icons", slug: "mariadb" },
        dockerImages: ["mariadb"],
      }),
      tech("neo4j", "Neo4j", "Graph database.", "extended", {
        logo: { source: "simple-icons", slug: "neo4j" },
        dockerImages: ["neo4j"],
      }),
      tech("duckdb", "DuckDB", "In-process analytical database.", "core", {
        logo: { source: "simple-icons", slug: "duckdb" },
        npmPackages: ["duckdb", "@duckdb/node-api"],
        pythonPackages: ["duckdb"],
      }),
      tech("elasticsearch", "Elasticsearch", "Distributed search and analytics engine.", "core", {
        logo: { source: "simple-icons", slug: "elasticsearch" },
        npmPackages: ["@elastic/elasticsearch"],
        dockerImages: ["elasticsearch", "docker.elastic.co/elasticsearch/elasticsearch"],
      }),
      tech("opensearch", "OpenSearch", "Open source search and analytics suite.", "extended", {
        logo: { source: "simple-icons", slug: "opensearch" },
        npmPackages: ["@opensearch-project/opensearch"],
        dockerImages: ["opensearchproject/opensearch"],
      }),
      tech("meilisearch", "Meilisearch", "Fast typo-tolerant search engine.", "extended", {
        logo: { source: "simple-icons", slug: "meilisearch" },
        npmPackages: ["meilisearch"],
        dockerImages: ["getmeili/meilisearch"],
      }),
      tech("typesense", "Typesense", "Fast open source search engine.", "extended", {
        npmPackages: ["typesense"],
        dockerImages: ["typesense/typesense"],
      }),
      tech("algolia", "Algolia", "Hosted search API.", "core", {
        logo: { source: "simple-icons", slug: "algolia" },
        npmPackages: ["algoliasearch"],
      }),
    ],
  },
  {
    key: "orm_database_tooling",
    name: "ORM / Database Tooling",
    description: "ORMs, query builders, migrations, and database clients.",
    technologies: [
      tech("prisma", "Prisma", "Type-safe ORM for Node.js and TypeScript.", "core", {
        logo: { source: "simple-icons", slug: "prisma" },
        npmPackages: ["prisma", "@prisma/client"],
        files: ["prisma/schema.prisma"],
      }),
      tech("drizzle", "Drizzle ORM", "TypeScript ORM with SQL-like query builder.", "core", {
        logo: { source: "simple-icons", slug: "drizzle" },
        npmPackages: ["drizzle-orm", "drizzle-kit"],
        files: ["drizzle.config.ts", "drizzle.config.js"],
      }),
      tech("typeorm", "TypeORM", "ORM for TypeScript and JavaScript.", "extended", {
        logo: { source: "simple-icons", slug: "typeorm" },
        npmPackages: ["typeorm"],
      }),
      tech("sequelize", "Sequelize", "Promise-based Node.js ORM.", "extended", {
        logo: { source: "simple-icons", slug: "sequelize" },
        npmPackages: ["sequelize"],
      }),
      tech("sqlalchemy", "SQLAlchemy", "Python SQL toolkit and ORM.", "core", {
        logo: { source: "simple-icons", slug: "sqlalchemy" },
        pythonPackages: ["sqlalchemy"],
      }),
      tech("alembic", "Alembic", "Database migration tool for SQLAlchemy.", "extended", {
        pythonPackages: ["alembic"],
      }),
      tech("knex", "Knex.js", "SQL query builder for JavaScript.", "extended", {
        logo: { source: "simple-icons", slug: "knexdotjs" },
        npmPackages: ["knex"],
      }),
      tech("kysely", "Kysely", "Type-safe SQL query builder for TypeScript.", "core", {
        npmPackages: ["kysely"],
      }),
      tech("diesel", "Diesel", "Rust ORM and query builder.", "extended", {
        rustCrates: ["diesel"],
      }),
      tech("ent", "Ent", "Entity framework for Go.", "extended", {
        goModules: ["entgo.io/ent"],
      }),
      tech("hibernate", "Hibernate", "Java ORM framework.", "extended", {
        logo: { source: "simple-icons", slug: "hibernate" },
        javaPackages: ["org.hibernate"],
      }),
      tech("flyway", "Flyway", "Database migration tool.", "extended", {
        logo: { source: "simple-icons", slug: "flyway" },
        javaPackages: ["org.flywaydb"],
      }),
      tech("liquibase", "Liquibase", "Database schema change management.", "extended", {
        logo: { source: "simple-icons", slug: "liquibase" },
        javaPackages: ["org.liquibase"],
      }),
    ],
  },
  {
    key: "data_analytics",
    name: "Data & Analytics",
    description: "Data engineering, analytics, BI, and ML libraries.",
    technologies: [
      tech("pandas", "pandas", "Python data analysis library.", "core", {
        logo: { source: "simple-icons", slug: "pandas" },
        pythonPackages: ["pandas"],
      }),
      tech("numpy", "NumPy", "Python numerical computing library.", "core", {
        logo: { source: "simple-icons", slug: "numpy" },
        pythonPackages: ["numpy"],
      }),
      tech("polars", "Polars", "Fast dataframe library.", "core", {
        logo: { source: "simple-icons", slug: "polars" },
        pythonPackages: ["polars"],
        npmPackages: ["nodejs-polars"],
      }),
      tech("jupyter", "Jupyter", "Interactive notebooks for code and data.", "core", {
        logo: { source: "simple-icons", slug: "jupyter" },
        pythonPackages: ["jupyter", "notebook", "jupyterlab"],
        files: ["*.ipynb"],
        aliases: ["jupyter_notebook"],
      }),
      tech("dbt", "dbt", "Analytics engineering and data transformation framework.", "core", {
        pythonPackages: ["dbt-core"],
        files: ["dbt_project.yml"],
      }),
      tech("airbyte", "Airbyte", "Open source data integration platform.", "extended", {
        logo: { source: "simple-icons", slug: "airbyte" },
      }),
      tech("fivetran", "Fivetran", "Managed data movement platform.", "extended"),
      tech("dagster", "Dagster", "Data orchestration platform.", "extended", {
        pythonPackages: ["dagster"],
      }),
      tech("airflow", "Apache Airflow", "Workflow orchestration for data pipelines.", "core", {
        logo: { source: "simple-icons", slug: "apacheairflow" },
        pythonPackages: ["apache-airflow"],
      }),
      tech("prefect", "Prefect", "Workflow orchestration for data and ML pipelines.", "extended", {
        logo: { source: "simple-icons", slug: "prefect" },
        pythonPackages: ["prefect"],
      }),
      tech("spark", "Apache Spark", "Distributed data processing engine.", "core", {
        logo: { source: "simple-icons", slug: "apachespark" },
        pythonPackages: ["pyspark"],
      }),
      tech("databricks", "Databricks", "Lakehouse platform for data and AI.", "core", {
        logo: { source: "simple-icons", slug: "databricks" },
      }),
      tech("snowflake", "Snowflake", "Cloud data platform.", "core", {
        logo: { source: "simple-icons", slug: "snowflake" },
      }),
      tech("bigquery", "BigQuery", "Google serverless data warehouse.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/BigQuery/SVG/BigQuery-512-color.svg" },
        npmPackages: ["@google-cloud/bigquery"],
        pythonPackages: ["google-cloud-bigquery"],
      }),
      tech("redshift", "Amazon Redshift", "AWS cloud data warehouse.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-Redshift_32.svg" },
      }),
      tech("metabase", "Metabase", "Open source BI and analytics.", "extended", {
        logo: { source: "simple-icons", slug: "metabase" },
      }),
      tech("superset", "Apache Superset", "Open source BI and visualization.", "extended", {
        logo: { source: "simple-icons", slug: "apachesuperset" },
      }),
      tech("tableau", "Tableau", "Business intelligence and visualization platform.", "extended"),
      tech("looker", "Looker", "Google BI platform.", "extended", {
        logo: { source: "simple-icons", slug: "looker" },
      }),
      tech("posthog", "PostHog", "Product analytics platform.", "core", {
        logo: { source: "simple-icons", slug: "posthog" },
        npmPackages: ["posthog-js", "posthog-node"],
        pythonPackages: ["posthog"],
      }),
      tech("amplitude", "Amplitude", "Digital analytics platform.", "extended", {
        npmPackages: ["@amplitude/analytics-browser", "@amplitude/analytics-node"],
      }),
      tech("segment", "Segment", "Customer data platform.", "extended", {
        npmPackages: ["@segment/analytics-next", "@segment/analytics-node"],
      }),
      tech("tensorflow", "TensorFlow", "Machine learning framework.", "core", {
        logo: { source: "simple-icons", slug: "tensorflow" },
        pythonPackages: ["tensorflow"],
        npmPackages: ["@tensorflow/tfjs"],
      }),
      tech("pytorch", "PyTorch", "Machine learning framework.", "core", {
        logo: { source: "simple-icons", slug: "pytorch" },
        pythonPackages: ["torch", "pytorch-lightning"],
        aliases: ["torch"],
      }),
      tech("scikit_learn", "scikit-learn", "Machine learning library for Python.", "core", {
        logo: { source: "simple-icons", slug: "scikitlearn" },
        pythonPackages: ["scikit-learn", "sklearn"],
      }),
      tech("xgboost", "XGBoost", "Gradient boosting machine learning library.", "extended", {
        pythonPackages: ["xgboost"],
      }),
      tech("lightgbm", "LightGBM", "Gradient boosting framework.", "extended", {
        pythonPackages: ["lightgbm"],
      }),
      tech("mlflow", "MLflow", "ML experiment tracking and model lifecycle platform.", "extended", {
        logo: { source: "simple-icons", slug: "mlflow" },
        pythonPackages: ["mlflow"],
      }),
      tech("wandb", "Weights & Biases", "ML experiment tracking and model observability.", "extended", {
        logo: { source: "simple-icons", slug: "weightsandbiases" },
        pythonPackages: ["wandb"],
        npmPackages: ["@wandb/sdk"],
      }),
    ],
  },
  {
    key: "cloud_hosting",
    name: "Cloud / Hosting",
    description: "Hosting platforms and deployment surfaces.",
    technologies: [
      tech("vercel", "Vercel", "Frontend cloud and serverless platform.", "core", {
        logo: { source: "simple-icons", slug: "vercel" },
        files: ["vercel.json"],
      }),
      tech("netlify", "Netlify", "Web hosting and serverless platform.", "core", {
        logo: { source: "simple-icons", slug: "netlify" },
        files: ["netlify.toml"],
      }),
      tech("cloudflare_workers", "Cloudflare Workers", "Edge compute platform.", "core", {
        logo: { source: "simple-icons", slug: "cloudflareworkers" },
        npmPackages: ["wrangler"],
        files: ["wrangler.toml", "wrangler.json", "wrangler.jsonc"],
        logoKey: "cloudflare",
      }),
      tech("cloudflare_pages", "Cloudflare Pages", "Static and full-stack web hosting on Cloudflare.", "extended", {
        logo: { source: "simple-icons", slug: "cloudflarepages" },
        logoKey: "cloudflare",
      }),
      tech("railway", "Railway", "Application hosting platform.", "core", {
        logo: { source: "simple-icons", slug: "railway" },
        files: ["railway.json"],
      }),
      tech("render", "Render", "Cloud application hosting platform.", "core", {
        logo: { source: "simple-icons", slug: "render" },
        files: ["render.yaml"],
      }),
      tech("fly_io", "Fly.io", "Application runtime close to users.", "core", {
        logo: { source: "simple-icons", slug: "flydotio" },
        files: ["fly.toml"],
        aliases: ["fly"],
      }),
      tech("heroku", "Heroku", "Platform-as-a-service for apps.", "extended", {
        files: ["Procfile", "app.json"],
      }),
      tech("digitalocean", "DigitalOcean", "Cloud infrastructure provider.", "extended", {
        logo: { source: "simple-icons", slug: "digitalocean" },
      }),
      tech("hetzner", "Hetzner", "Cloud and dedicated server provider.", "extended", {
        logo: { source: "simple-icons", slug: "hetzner" },
      }),
      tech("cloudflare", "Cloudflare", "Edge network, security, and developer platform.", "core", {
        logo: { source: "simple-icons", slug: "cloudflare" },
      }),
      tech("akamai", "Akamai", "Edge and CDN platform.", "extended", {
        logo: { source: "simple-icons", slug: "akamai" },
      }),
      tech("fastly", "Fastly", "Edge cloud platform.", "extended", {
        logo: { source: "simple-icons", slug: "fastly" },
      }),
    ],
  },
  {
    key: "aws",
    name: "AWS",
    description: "AWS infrastructure and application services.",
    technologies: [
      tech("aws_s3", "Amazon S3", "Object storage service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Storage/32/Arch_Amazon-Simple-Storage-Service_32.svg" },
        npmPackages: ["@aws-sdk/client-s3"],
      }),
      tech("aws_ec2", "Amazon EC2", "Virtual machine compute service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Compute/32/Arch_Amazon-EC2_32.svg" },
      }),
      tech("aws_amplify", "AWS Amplify", "Full-stack web and mobile hosting platform.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Front-End-Web-Mobile/32/Arch_AWS-Amplify_32.svg" },
        npmPackages: ["aws-amplify", "@aws-amplify/ui-react"],
        aliases: ["amplify"],
      }),
      tech("aws_lambda", "AWS Lambda", "Serverless function compute.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Compute/32/Arch_AWS-Lambda_32.svg" },
        npmPackages: ["@aws-sdk/client-lambda"],
      }),
      tech("aws_elastic_beanstalk", "AWS Elastic Beanstalk", "Managed application deployment platform.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Compute/32/Arch_AWS-Elastic-Beanstalk_32.svg" },
        aliases: ["elastic beanstalk", "beanstalk"],
      }),
      tech("aws_ecs", "Amazon ECS", "Container orchestration service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Containers/32/Arch_Amazon-Elastic-Container-Service_32.svg" },
        aliases: ["aws_elastic_container_service"],
      }),
      tech("aws_eks", "Amazon EKS", "Managed Kubernetes service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Containers/32/Arch_Amazon-Elastic-Kubernetes-Service_32.svg" },
        aliases: ["aws_elastic_kubernetes_service"],
      }),
      tech("aws_fargate", "AWS Fargate", "Serverless container compute.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Containers/32/Arch_AWS-Fargate_32.svg" },
      }),
      tech("aws_rds", "Amazon RDS", "Managed relational databases.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Databases/32/Arch_Amazon-RDS_32.svg" },
      }),
      tech("aws_aurora", "Amazon Aurora", "Cloud-native relational database.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Databases/32/Arch_Amazon-Aurora_32.svg" },
      }),
      tech("aws_dynamodb", "Amazon DynamoDB", "Serverless NoSQL database.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Databases/32/Arch_Amazon-DynamoDB_32.svg" },
        npmPackages: ["@aws-sdk/client-dynamodb"],
        aliases: ["dynamodb"],
      }),
      tech("aws_documentdb", "Amazon DocumentDB", "MongoDB-compatible managed document database.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Databases/32/Arch_Amazon-DocumentDB_32.svg" },
        aliases: ["documentdb"],
      }),
      tech("aws_elasticache", "Amazon ElastiCache", "Managed Redis, Valkey, and Memcached cache service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Databases/32/Arch_Amazon-ElastiCache_32.svg" },
        aliases: ["elasticache"],
      }),
      tech("aws_cloudfront", "Amazon CloudFront", "Content delivery network.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Networking-Content-Delivery/32/Arch_Amazon-CloudFront_32.svg" },
      }),
      tech("aws_route53", "Amazon Route 53", "DNS and domain routing service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Networking-Content-Delivery/32/Arch_Amazon-Route-53_32.svg" },
        aliases: ["route53", "route_53", "aws_route_53"],
      }),
      tech("aws_elastic_load_balancing", "Elastic Load Balancing", "AWS managed load balancing service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Networking-Content-Delivery/32/Arch_Elastic-Load-Balancing_32.svg" },
        aliases: ["elb", "aws_elb", "application_load_balancer", "network_load_balancer"],
      }),
      tech("aws_vpc", "Amazon VPC", "Virtual private cloud networking.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Group-Icons_01302026/Virtual-private-cloud-VPC_32.svg" },
        aliases: ["vpc", "amazon_vpc"],
      }),
      tech("aws_api_gateway", "Amazon API Gateway", "Managed API gateway.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Networking-Content-Delivery/32/Arch_Amazon-API-Gateway_32.svg" },
        npmPackages: ["@aws-sdk/client-api-gateway"],
      }),
      tech("aws_appsync", "AWS AppSync", "Managed GraphQL API service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Application-Integration/32/Arch_AWS-AppSync_32.svg" },
        npmPackages: ["@aws-sdk/client-appsync", "aws-appsync"],
      }),
      tech("aws_sqs", "Amazon SQS", "Managed message queues.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Application-Integration/32/Arch_Amazon-Simple-Queue-Service_32.svg" },
        npmPackages: ["@aws-sdk/client-sqs"],
      }),
      tech("aws_sns", "Amazon SNS", "Managed pub/sub messaging.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Application-Integration/32/Arch_Amazon-Simple-Notification-Service_32.svg" },
        npmPackages: ["@aws-sdk/client-sns"],
      }),
      tech("aws_eventbridge", "Amazon EventBridge", "Event bus and scheduler.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Application-Integration/32/Arch_Amazon-EventBridge_32.svg" },
        npmPackages: ["@aws-sdk/client-eventbridge"],
      }),
      tech("aws_step_functions", "AWS Step Functions", "Serverless workflow orchestration.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Application-Integration/32/Arch_AWS-Step-Functions_32.svg" },
      }),
      tech("aws_cognito", "Amazon Cognito", "Authentication and identity service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Security-Identity/32/Arch_Amazon-Cognito_32.svg" },
      }),
      tech("aws_iam", "AWS IAM", "Identity and access management.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Security-Identity/32/Arch_AWS-IAM-Identity-Center_32.svg" },
        aliases: ["aws_identity_and_access_management"],
      }),
      tech("aws_kms", "AWS KMS", "Managed encryption key service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Security-Identity/32/Arch_AWS-Key-Management-Service_32.svg" },
        npmPackages: ["@aws-sdk/client-kms"],
        aliases: ["aws_key_management_service"],
      }),
      tech("aws_secrets_manager", "AWS Secrets Manager", "Secrets storage and rotation service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Security-Identity/32/Arch_AWS-Secrets-Manager_32.svg" },
        npmPackages: ["@aws-sdk/client-secrets-manager"],
      }),
      tech("aws_waf", "AWS WAF", "Web application firewall service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Security-Identity/32/Arch_AWS-WAF_32.svg" },
      }),
      tech("aws_cloudwatch", "Amazon CloudWatch", "Monitoring and observability service.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Management-Tools/32/Arch_Amazon-CloudWatch_32.svg" },
      }),
      tech("aws_cloudtrail", "AWS CloudTrail", "AWS account activity and audit logging.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Management-Tools/32/Arch_AWS-CloudTrail_32.svg" },
      }),
      tech("aws_cloudformation", "AWS CloudFormation", "Infrastructure-as-code provisioning service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Management-Tools/32/Arch_AWS-CloudFormation_32.svg" },
        npmPackages: ["@aws-sdk/client-cloudformation"],
        files: ["template.yaml", "template.yml"],
      }),
      tech("aws_codebuild", "AWS CodeBuild", "Managed build service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Developer-Tools/32/Arch_AWS-CodeBuild_32.svg" },
        npmPackages: ["@aws-sdk/client-codebuild"],
      }),
      tech("aws_codepipeline", "AWS CodePipeline", "Managed release pipeline service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Developer-Tools/32/Arch_AWS-CodePipeline_32.svg" },
        npmPackages: ["@aws-sdk/client-codepipeline"],
      }),
      tech("aws_kinesis", "Amazon Kinesis", "Streaming data platform.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-Kinesis_32.svg" },
      }),
      tech("aws_glue", "AWS Glue", "Serverless data integration service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_AWS-Glue_32.svg" },
      }),
      tech("aws_athena", "Amazon Athena", "Serverless query service for data lakes.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-Athena_32.svg" },
      }),
      tech("aws_redshift", "Amazon Redshift", "Cloud data warehouse.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-Redshift_32.svg" },
      }),
      tech("aws_opensearch_service", "Amazon OpenSearch Service", "Managed OpenSearch search and analytics service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-OpenSearch-Service_32.svg" },
        aliases: ["aws_opensearch", "amazon_opensearch"],
      }),
      tech("aws_sagemaker", "Amazon SageMaker", "Managed machine learning platform.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Analytics/32/Arch_Amazon-SageMaker_32.svg" },
        pythonPackages: ["sagemaker"],
      }),
      tech("aws_ses", "Amazon SES", "Email sending service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Business-Applications/32/Arch_Amazon-Simple-Email-Service_32.svg" },
        npmPackages: ["@aws-sdk/client-ses", "@aws-sdk/client-sesv2"],
      }),
      tech("aws_batch", "AWS Batch", "Managed batch compute service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Compute/32/Arch_AWS-Batch_32.svg" },
        npmPackages: ["@aws-sdk/client-batch"],
      }),
      tech("aws_ecr", "Amazon ECR", "Container registry.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Containers/32/Arch_Amazon-Elastic-Container-Registry_32.svg" },
        aliases: ["aws_elastic_container_registry"],
      }),
    ],
  },
  {
    key: "google_cloud",
    name: "Google Cloud",
    description: "Google Cloud infrastructure and application services.",
    technologies: [
      tech("gcp_cloud_run", "Cloud Run", "Serverless containers on Google Cloud.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg" },
      }),
      tech("gcp_cloud_functions", "Cloud Functions", "Serverless functions on Google Cloud.", "core", {
        logo: { source: "google-cloud-icons", path: "cloud_functions/cloud_functions.svg" },
      }),
      tech("gcp_cloud_storage", "Cloud Storage", "Object storage on Google Cloud.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg" },
        npmPackages: ["@google-cloud/storage"],
      }),
      tech("gcp_compute_engine", "Compute Engine", "Virtual machine compute on Google Cloud.", "extended", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Compute Engine/SVG/ComputeEngine-512-color-rgb.svg" },
      }),
      tech("gcp_app_engine", "App Engine", "Google Cloud platform as a service.", "extended", {
        logo: { source: "google-cloud-icons", path: "app_engine/app_engine.svg" },
        aliases: ["google_app_engine"],
      }),
      tech("gcp_gke", "Google Kubernetes Engine", "Managed Kubernetes service.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/GKE/SVG/GKE-512-color.svg" },
        aliases: ["gcp_kubernetes_engine", "gke"],
      }),
      tech("gcp_firestore", "Firestore", "Serverless document database.", "core", {
        logo: { source: "google-cloud-icons", path: "firestore/firestore.svg" },
        npmPackages: ["@google-cloud/firestore"],
      }),
      tech("gcp_bigquery", "BigQuery", "Serverless data warehouse.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/BigQuery/SVG/BigQuery-512-color.svg" },
        npmPackages: ["@google-cloud/bigquery"],
      }),
      tech("gcp_cloud_sql", "Cloud SQL", "Managed relational database service.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Cloud SQL/SVG/CloudSQL-512-color.svg" },
        npmPackages: ["@google-cloud/cloud-sql-connector"],
      }),
      tech("gcp_spanner", "Cloud Spanner", "Globally distributed relational database.", "extended", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Cloud Spanner/SVG/CloudSpanner-512-color.svg" },
        npmPackages: ["@google-cloud/spanner"],
      }),
      tech("gcp_memorystore", "Memorystore", "Managed Redis and Memcached service.", "extended", {
        logo: { source: "google-cloud-icons", path: "memorystore/memorystore.svg" },
      }),
      tech("gcp_pubsub", "Cloud Pub/Sub", "Messaging and event ingestion service.", "core", {
        logo: { source: "google-cloud-icons", path: "pubsub/pubsub.svg" },
        npmPackages: ["@google-cloud/pubsub"],
        aliases: ["gcp_cloud_pub_sub"],
      }),
      tech("gcp_eventarc", "Eventarc", "Event routing service for Google Cloud.", "extended", {
        logo: { source: "google-cloud-icons", path: "eventarc/eventarc.svg" },
      }),
      tech("gcp_cloud_tasks", "Cloud Tasks", "Managed task queues.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_tasks/cloud_tasks.svg" },
      }),
      tech("gcp_cloud_scheduler", "Cloud Scheduler", "Managed cron scheduler.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_scheduler/cloud_scheduler.svg" },
      }),
      tech("gcp_workflows", "Workflows", "Serverless workflow orchestration.", "extended", {
        logo: { source: "google-cloud-icons", path: "workflows/workflows.svg" },
      }),
      tech("gcp_cloud_build", "Cloud Build", "CI/CD on Google Cloud.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_build/cloud_build.svg" },
      }),
      tech("gcp_cloud_deploy", "Cloud Deploy", "Managed continuous delivery service.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_deploy/cloud_deploy.svg" },
      }),
      tech("gcp_artifact_registry", "Artifact Registry", "Package and container registry.", "extended", {
        logo: { source: "google-cloud-icons", path: "artifact_registry/artifact_registry.svg" },
      }),
      tech("gcp_secret_manager", "Secret Manager", "Google Cloud secret storage service.", "core", {
        logo: { source: "google-cloud-icons", path: "secret_manager/secret_manager.svg" },
        npmPackages: ["@google-cloud/secret-manager"],
      }),
      tech("gcp_cloud_iam", "Cloud IAM", "Google Cloud identity and access management.", "core", {
        logo: { source: "google-cloud-icons", path: "identity_and_access_management/identity_and_access_management.svg" },
        aliases: ["google_cloud_iam"],
      }),
      tech("gcp_vpc", "Virtual Private Cloud", "Google Cloud virtual networking.", "core", {
        logo: { source: "google-cloud-icons", path: "virtual_private_cloud/virtual_private_cloud.svg" },
        aliases: ["google_cloud_vpc"],
      }),
      tech("gcp_cloud_load_balancing", "Cloud Load Balancing", "Global load balancing service.", "core", {
        logo: { source: "google-cloud-icons", path: "cloud_load_balancing/cloud_load_balancing.svg" },
      }),
      tech("gcp_cloud_cdn", "Cloud CDN", "Google Cloud content delivery network.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_cdn/cloud_cdn.svg" },
      }),
      tech("gcp_cloud_armor", "Cloud Armor", "DDoS protection and web application firewall.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_armor/cloud_armor.svg" },
      }),
      tech("gcp_cloud_logging", "Cloud Logging", "Centralized logging service.", "core", {
        logo: { source: "google-cloud-icons", path: "cloud_logging/cloud_logging.svg" },
        npmPackages: ["@google-cloud/logging"],
      }),
      tech("gcp_cloud_monitoring", "Cloud Monitoring", "Metrics and observability service.", "core", {
        logo: { source: "google-cloud-icons", path: "cloud_monitoring/cloud_monitoring.svg" },
        npmPackages: ["@google-cloud/monitoring"],
      }),
      tech("gcp_dataflow", "Dataflow", "Managed stream and batch processing service.", "extended", {
        logo: { source: "google-cloud-icons", path: "dataflow/dataflow.svg" },
      }),
      tech("gcp_dataproc", "Dataproc", "Managed Spark and Hadoop service.", "extended", {
        logo: { source: "google-cloud-icons", path: "dataproc/dataproc.svg" },
      }),
      tech("gcp_cloud_composer", "Cloud Composer", "Managed Apache Airflow service.", "extended", {
        logo: { source: "google-cloud-icons", path: "cloud_composer/cloud_composer.svg" },
      }),
      tech("gcp_apigee", "Apigee", "Google Cloud API management platform.", "extended", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Apigee/SVG/Apigee-512-color-rgb.svg" },
      }),
    ],
  },
  {
    key: "azure",
    name: "Azure",
    description: "Azure infrastructure and application services.",
    technologies: [
      tech("azure_functions", "Azure Functions", "Serverless functions on Azure.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/compute/10029-icon-service-Function-Apps.svg" },
      }),
      tech("azure_virtual_machines", "Azure Virtual Machines", "Virtual machine compute on Azure.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/compute/10021-icon-service-Virtual-Machine.svg" },
        aliases: ["azure_vm", "azure_vms"],
      }),
      tech("azure_app_service", "Azure App Service", "Managed web application hosting.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/web/10035-icon-service-App-Services.svg" },
      }),
      tech("azure_static_web_apps", "Azure Static Web Apps", "Static and full-stack web app hosting.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/web/01007-icon-service-Static-Apps.svg" },
      }),
      tech("azure_blob_storage", "Azure Blob Storage", "Object storage on Azure.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/storage/10086-icon-service-Storage-Accounts.svg" },
      }),
      tech("azure_container_apps", "Azure Container Apps", "Serverless container platform.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/other/02989-icon-service-Container-Apps-Environments.svg" },
      }),
      tech("azure_aks", "Azure Kubernetes Service", "Managed Kubernetes service.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/containers/10023-icon-service-Kubernetes-Services.svg" },
        aliases: ["aks"],
      }),
      tech("azure_container_registry", "Azure Container Registry", "Managed container registry.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/containers/10105-icon-service-Container-Registries.svg" },
        aliases: ["acr"],
      }),
      tech("azure_cosmos_db", "Azure Cosmos DB", "Globally distributed NoSQL database.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/databases/10121-icon-service-Azure-Cosmos-DB.svg" },
      }),
      tech("azure_sql_database", "Azure SQL Database", "Managed SQL Server database.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/databases/10130-icon-service-SQL-Database.svg" },
      }),
      tech("azure_database_for_postgresql", "Azure Database for PostgreSQL", "Managed PostgreSQL on Azure.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/databases/10131-icon-service-Azure-Database-PostgreSQL-Server.svg" },
      }),
      tech("azure_database_for_mysql", "Azure Database for MySQL", "Managed MySQL on Azure.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/databases/10122-icon-service-Azure-Database-MySQL-Server.svg" },
      }),
      tech("azure_cache_for_redis", "Azure Cache for Redis", "Managed Redis cache service.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/databases/10137-icon-service-Cache-Redis.svg" },
      }),
      tech("azure_service_bus", "Azure Service Bus", "Enterprise message broker.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/integration/10836-icon-service-Azure-Service-Bus.svg" },
        npmPackages: ["@azure/service-bus"],
      }),
      tech("azure_event_grid", "Azure Event Grid", "Event routing service.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/integration/10206-icon-service-Event-Grid-Topics.svg" },
        npmPackages: ["@azure/eventgrid"],
      }),
      tech("azure_event_hubs", "Azure Event Hubs", "Event streaming platform.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/iot/00039-icon-service-Event-Hubs.svg" },
        npmPackages: ["@azure/event-hubs"],
      }),
      tech("azure_queue_storage", "Azure Queue Storage", "Queue messaging on Azure Storage.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/general/10840-icon-service-Storage-Queue.svg" },
        npmPackages: ["@azure/storage-queue"],
      }),
      tech("azure_api_management", "Azure API Management", "Managed API gateway and developer portal.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/devops/10042-icon-service-API-Management-Services.svg" },
      }),
      tech("azure_front_door", "Azure Front Door", "Global edge routing and acceleration service.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/networking/10073-icon-service-Front-Door-and-CDN-Profiles.svg" },
      }),
      tech("azure_load_balancer", "Azure Load Balancer", "Layer 4 load balancing service.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/networking/10062-icon-service-Load-Balancers.svg" },
      }),
      tech("azure_application_gateway", "Azure Application Gateway", "Layer 7 load balancer and web application firewall.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/networking/10076-icon-service-Application-Gateways.svg" },
      }),
      tech("azure_devops", "Azure DevOps", "Azure CI/CD and project tooling.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/devops/10261-icon-service-Azure-DevOps.svg" },
      }),
      tech("azure_data_factory", "Azure Data Factory", "Data integration and ETL service.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/analytics/10126-icon-service-Data-Factories.svg" },
      }),
      tech("azure_logic_apps", "Azure Logic Apps", "Workflow automation and integration service.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/integration/02631-icon-service-Logic-Apps.svg" },
      }),
      tech("azure_ai_search", "Azure AI Search", "Managed search and retrieval service.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/ai + machine learning/10044-icon-service-Cognitive-Search.svg" },
        aliases: ["azure_cognitive_search"],
      }),
      tech("azure_monitor", "Azure Monitor", "Azure metrics, logs, and alerting.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/monitor/00001-icon-service-Monitor.svg" },
      }),
      tech("azure_log_analytics", "Log Analytics", "Azure Monitor log analytics workspace.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/monitor/00009-icon-service-Log-Analytics-Workspaces.svg" },
      }),
      tech("azure_application_insights", "Application Insights", "Application performance monitoring.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/monitor/00012-icon-service-Application-Insights.svg" },
      }),
      tech("azure_key_vault", "Azure Key Vault", "Secrets and key management service.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/security/10245-icon-service-Key-Vaults.svg" },
      }),
    ],
  },
  {
    key: "ai_models",
    name: "AI Models",
    description: "Model families selected by product behavior or explicit model usage.",
    technologies: [
      tech("gpt", "GPT", "OpenAI GPT model family.", "core", {
        text: ["gpt-4", "gpt-4o", "gpt-4.1", "gpt-5", "o3", "o4-mini"],
        aliases: ["openai gpt"],
      }),
      tech("claude", "Claude", "Anthropic Claude model family.", "core", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["claude-", "claude-3", "claude-3-5", "claude-3-7", "claude-4", "claude-opus", "claude-sonnet", "claude-haiku"],
        aliases: ["anthropic claude"],
      }),
      tech("gemini", "Gemini", "Google Gemini model family.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["gemini-", "gemini-1.5", "gemini-2", "gemini-pro", "gemini-flash"],
        aliases: ["google gemini"],
      }),
      tech("llama", "Llama", "Meta Llama model family.", "core", {
        text: ["llama", "meta-llama", "LlamaForCausalLM"],
        aliases: ["meta llama"],
      }),
      tech("mistral_models", "Mistral Models", "Mistral and Mixtral model families.", "core", {
        logo: { source: "simple-icons", slug: "mistralai" },
        text: ["mistral-", "mixtral", "codestral"],
        aliases: ["mistral", "mixtral", "codestral"],
      }),
      tech("qwen", "Qwen", "Alibaba Qwen model family.", "extended", {
        logo: { source: "simple-icons", slug: "qwen" },
        text: ["qwen", "qwen2", "qwen3"],
      }),
      tech("deepseek", "DeepSeek", "DeepSeek model family.", "extended", {
        logo: { source: "simple-icons", slug: "deepseek" },
        text: ["deepseek", "deepseek-chat", "deepseek-reasoner"],
      }),
    ],
  },
  {
    key: "ai_platforms",
    name: "AI Platforms",
    description: "Model API providers, gateways, and inference platforms.",
    technologies: [
      tech("openai", "OpenAI", "AI model API provider.", "core", {
        npmPackages: ["openai"],
        pythonPackages: ["openai"],
        envVars: ["OPENAI_API_KEY"],
      }),
      tech("anthropic", "Anthropic", "Claude model API provider.", "core", {
        logo: { source: "simple-icons", slug: "anthropic" },
        npmPackages: ["@anthropic-ai/sdk"],
        pythonPackages: ["anthropic"],
        envVars: ["ANTHROPIC_API_KEY"],
      }),
      tech("gemini_api", "Gemini API", "Google Gemini model API.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        npmPackages: ["@google/genai", "@google/generative-ai"],
        pythonPackages: ["google-genai", "google-generativeai"],
        envVars: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
        aliases: ["google gemini api"],
      }),
      tech("azure_openai", "Azure OpenAI Service", "OpenAI models hosted through Azure.", "core", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/ai + machine learning/03438-icon-service-Azure-OpenAI.svg" },
        npmPackages: ["@azure/openai"],
        pythonPackages: ["azure-ai-openai"],
        envVars: ["AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT"],
      }),
      tech("amazon_bedrock", "Amazon Bedrock", "AWS managed foundation model platform.", "core", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Bedrock_32.svg" },
        npmPackages: ["@aws-sdk/client-bedrock-runtime", "@aws-sdk/client-bedrock"],
        text: ["bedrock-runtime", "BedrockRuntime"],
      }),
      tech("vertex_ai", "Vertex AI", "Google Cloud AI platform.", "core", {
        logo: { source: "google-cloud-icons", path: "Unique Icons/Vertex AI/SVG/VertexAI-512-color.svg" },
        npmPackages: ["@google-cloud/vertexai"],
        pythonPackages: ["google-cloud-aiplatform"],
        aliases: ["gcp_vertex_ai"],
      }),
      tech("mistral_ai", "Mistral AI", "Model API provider.", "core", {
        logo: { source: "simple-icons", slug: "mistralai" },
        npmPackages: ["@mistralai/mistralai"],
        pythonPackages: ["mistralai"],
        envVars: ["MISTRAL_API_KEY"],
      }),
      tech("cohere", "Cohere", "Enterprise AI model API provider.", "extended", {
        npmPackages: ["cohere-ai"],
        pythonPackages: ["cohere"],
        envVars: ["COHERE_API_KEY"],
      }),
      tech("groq", "Groq", "Fast AI inference API provider.", "core", {
        npmPackages: ["groq-sdk"],
        pythonPackages: ["groq"],
        envVars: ["GROQ_API_KEY"],
      }),
      tech("together_ai", "Together AI", "AI inference and fine-tuning platform.", "core", {
        npmPackages: ["together-ai"],
        pythonPackages: ["together"],
        envVars: ["TOGETHER_API_KEY"],
      }),
      tech("fireworks_ai", "Fireworks AI", "Serverless AI inference platform.", "extended", {
        pythonPackages: ["fireworks-ai"],
        envVars: ["FIREWORKS_API_KEY"],
      }),
      tech("openrouter", "OpenRouter", "Unified API for many AI models.", "core", {
        logo: { source: "simple-icons", slug: "openrouter" },
        envVars: ["OPENROUTER_API_KEY"],
        text: ["openrouter.ai"],
      }),
      tech("perplexity_api", "Perplexity API", "AI answer and search API.", "core", {
        envVars: ["PERPLEXITY_API_KEY"],
        text: ["api.perplexity.ai"],
      }),
      tech("replicate", "Replicate", "Hosted API for open-source models.", "core", {
        logo: { source: "simple-icons", slug: "replicate" },
        npmPackages: ["replicate"],
        pythonPackages: ["replicate"],
        envVars: ["REPLICATE_API_TOKEN"],
      }),
      tech("hugging_face", "Hugging Face", "Model hub and inference platform.", "core", {
        logo: { source: "simple-icons", slug: "huggingface" },
        npmPackages: ["@huggingface/inference", "@xenova/transformers"],
        pythonPackages: ["huggingface-hub", "transformers"],
        envVars: ["HUGGINGFACE_API_KEY", "HF_TOKEN"],
        aliases: ["huggingface", "huggingface_transformers"],
      }),
      tech("ollama", "Ollama", "Local LLM runtime.", "core", {
        logo: { source: "simple-icons", slug: "ollama" },
        npmPackages: ["ollama"],
        pythonPackages: ["ollama"],
        text: ["localhost:11434"],
      }),
      tech("vllm", "vLLM", "High-throughput LLM serving engine.", "extended", {
        logo: { source: "simple-icons", slug: "vllm" },
        pythonPackages: ["vllm"],
      }),
      tech("lm_studio", "LM Studio", "Local LLM desktop runtime and server.", "extended", {
        text: ["lmstudio", "localhost:1234"],
      }),
    ],
  },
  {
    key: "ai_product_apis",
    name: "AI Product APIs",
    description: "Provider-specific APIs and product capabilities for model-powered features.",
    technologies: [
      tech("openai_embeddings", "OpenAI Embeddings", "OpenAI embedding models and API.", "core", {
        text: ["embeddings.create", "text-embedding-3"],
      }),
      tech("openai_speech_to_text", "OpenAI Speech-to-Text", "OpenAI audio transcription API.", "core", {
        text: ["audio.transcriptions", "whisper-1", "gpt-4o-transcribe"],
      }),
      tech("openai_text_to_speech", "OpenAI Text-to-Speech", "OpenAI speech generation API.", "core", {
        text: ["audio.speech", "tts-1", "gpt-4o-mini-tts"],
      }),
      tech("openai_realtime_api", "OpenAI Realtime API", "OpenAI realtime voice and multimodal API.", "core", {
        text: ["realtime", "gpt-realtime", "OpenAIRealtime"],
      }),
      tech("openai_image", "OpenAI Image", "OpenAI image generation and editing API.", "core", {
        text: ["images.generate", "gpt-image-1", "dall-e"],
      }),
      tech("whisper", "Whisper", "Speech recognition model from OpenAI.", "core", {
        pythonPackages: ["openai-whisper", "faster-whisper"],
      }),
      tech("claude_messages_api", "Claude Messages API", "Anthropic Claude message generation API.", "core", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["/v1/messages", "client.messages.create", "anthropic-version"],
      }),
      tech("claude_vision", "Claude Vision", "Claude multimodal image understanding.", "core", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["type: \"image\"", "media_type: \"image", "Claude vision"],
      }),
      tech("claude_tool_use", "Claude Tool Use", "Function and tool calling with Claude.", "core", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["tool_use", "tool_result", "tool_choice", "input_schema"],
      }),
      tech("claude_computer_use", "Claude Computer Use", "Claude API computer control tool.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["computer_202", "computer-use", "computer use"],
      }),
      tech("claude_web_search", "Claude Web Search", "Anthropic hosted web search tool.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["web_search", "web search tool", "anthropic web search"],
      }),
      tech("claude_citations", "Claude Citations", "Claude document and search result citation support.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["citations.enabled", "cited_text", "search_result"],
      }),
      tech("claude_files_pdf", "Claude Files & PDF", "Claude Files API and PDF processing.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["files-api", "file_id", "application/pdf"],
      }),
      tech("claude_prompt_caching", "Claude Prompt Caching", "Anthropic prompt caching for repeated context.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["cache_control", "cache_creation_input_tokens", "cache_read_input_tokens"],
      }),
      tech("claude_batch_api", "Claude Batch API", "Anthropic batch processing API.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["messages/batches", "message_batches"],
      }),
      tech("claude_extended_thinking", "Claude Extended Thinking", "Claude reasoning mode for complex tasks.", "extended", {
        logo: { source: "simple-icons", slug: "claude" },
        text: ["extended thinking", "thinking_budget"],
      }),
      tech("gemini_embeddings", "Gemini Embeddings", "Google Gemini text embedding API.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["models.embedContent", "embed_content", "text-embedding-004", "gemini-embedding"],
      }),
      tech("gemini_live_api", "Gemini Live API", "Realtime multimodal Gemini API.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["live.connect", "Gemini Live", "BidiGenerateContent"],
      }),
      tech("gemini_function_calling", "Gemini Function Calling", "Tool and function calling with Gemini.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["functionDeclarations", "function_calling_config", "toolConfig"],
      }),
      tech("gemini_structured_outputs", "Gemini Structured Outputs", "Schema-constrained Gemini responses.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["responseSchema", "response_mime_type"],
      }),
      tech("gemini_file_api", "Gemini File API", "File upload and multimodal file processing for Gemini.", "extended", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["files.upload", "File API", "fileData"],
      }),
      tech("google_imagen", "Google Imagen", "Google image generation API.", "core", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["imagen", "predictImagen"],
      }),
      tech("google_veo", "Google Veo", "Google video generation API.", "extended", {
        logo: { source: "simple-icons", slug: "googlegemini" },
        text: ["veo", "generateVideos"],
      }),
      tech("mistral_embeddings", "Mistral Embeddings", "Mistral embedding API.", "core", {
        logo: { source: "simple-icons", slug: "mistralai" },
        text: ["mistral-embed", "client.embeddings.create"],
      }),
      tech("mistral_ocr", "Mistral OCR", "Mistral Document AI OCR API.", "core", {
        logo: { source: "simple-icons", slug: "mistralai" },
        text: ["/v1/ocr", "mistral-ocr-latest", "client.ocr.process"],
      }),
      tech("mistral_agents", "Mistral Agents", "Mistral Agents and Conversations API.", "extended", {
        logo: { source: "simple-icons", slug: "mistralai" },
        text: ["client.beta.agents.create", "client.beta.conversations", "Mistral Agents"],
      }),
      tech("mistral_function_calling", "Mistral Function Calling", "Tool and function calling with Mistral models.", "extended", {
        logo: { source: "simple-icons", slug: "mistralai" },
        text: ["tool_calls", "parallel_tool_calls", "mistral function calling"],
      }),
      tech("cohere_embed", "Cohere Embed", "Cohere embedding API.", "core", {
        text: ["co.embed", "embed-v4", "embed-english", "embed-multilingual"],
      }),
      tech("cohere_rerank", "Cohere Rerank", "Cohere semantic reranking API.", "core", {
        text: ["co.rerank", "rerank-v3", "rerank-v4", "Rerank API"],
      }),
      tech("bedrock_agents", "Bedrock Agents", "Amazon Bedrock agent orchestration.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Bedrock_32.svg" },
        logoKey: "amazon_bedrock",
        text: ["bedrock-agent", "bedrock-agent-runtime", "Agents for Amazon Bedrock"],
      }),
      tech("bedrock_knowledge_bases", "Bedrock Knowledge Bases", "Managed RAG knowledge bases in Amazon Bedrock.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Bedrock_32.svg" },
        logoKey: "amazon_bedrock",
        text: ["retrieveAndGenerate", "knowledge-base", "Knowledge Bases for Amazon Bedrock"],
      }),
      tech("bedrock_guardrails", "Bedrock Guardrails", "Amazon Bedrock safety and policy guardrails.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Bedrock_32.svg" },
        logoKey: "amazon_bedrock",
        text: ["guardrailIdentifier", "applyGuardrail", "Bedrock Guardrails"],
      }),
      tech("vertex_ai_embeddings", "Vertex AI Embeddings", "Google Vertex AI embedding APIs.", "extended", {
        logoKey: "vertex_ai",
        text: ["textembedding-gecko", "text-embedding", "Vertex AI embeddings"],
      }),
      tech("elevenlabs", "ElevenLabs", "Voice AI and text-to-speech API.", "core", {
        logo: { source: "simple-icons", slug: "elevenlabs" },
        npmPackages: ["elevenlabs"],
        pythonPackages: ["elevenlabs"],
        envVars: ["ELEVENLABS_API_KEY"],
      }),
      tech("deepgram", "Deepgram", "Speech-to-text and voice AI API.", "core", {
        logo: { source: "simple-icons", slug: "deepgram" },
        npmPackages: ["@deepgram/sdk"],
        pythonPackages: ["deepgram-sdk"],
        envVars: ["DEEPGRAM_API_KEY"],
      }),
      tech("assemblyai", "AssemblyAI", "Speech AI and transcription API.", "core", {
        npmPackages: ["assemblyai"],
        pythonPackages: ["assemblyai"],
        envVars: ["ASSEMBLYAI_API_KEY"],
      }),
      tech("cartesia", "Cartesia", "Low-latency voice generation API.", "core", {
        npmPackages: ["@cartesia/cartesia-js"],
        pythonPackages: ["cartesia"],
        envVars: ["CARTESIA_API_KEY"],
      }),
      tech("playht", "PlayHT", "AI text-to-speech API.", "extended", {
        envVars: ["PLAYHT_API_KEY"],
      }),
      tech("google_speech_to_text", "Google Speech-to-Text", "Google Cloud speech recognition API.", "extended", {
        logo: { source: "google-cloud-icons", path: "speech-to-text/speech-to-text.svg" },
        pythonPackages: ["google-cloud-speech"],
        npmPackages: ["@google-cloud/speech"],
      }),
      tech("azure_speech", "Azure Speech", "Azure speech-to-text and text-to-speech services.", "extended", {
        logo: { source: "azure-icons", path: "Azure_Public_Service_Icons/Icons/ai + machine learning/00797-icon-service-Speech-Services.svg" },
        npmPackages: ["microsoft-cognitiveservices-speech-sdk"],
        pythonPackages: ["azure-cognitiveservices-speech"],
      }),
      tech("amazon_transcribe", "Amazon Transcribe", "AWS automatic speech recognition service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Transcribe_32.svg" },
        npmPackages: ["@aws-sdk/client-transcribe"],
      }),
      tech("amazon_polly", "Amazon Polly", "AWS text-to-speech service.", "extended", {
        logo: { source: "aws-icons", path: "Architecture-Service-Icons_01302026/Arch_Artificial-Intelligence/32/Arch_Amazon-Polly_32.svg" },
        npmPackages: ["@aws-sdk/client-polly"],
      }),
      tech("fal_ai", "fal.ai", "Generative media inference platform.", "core", {
        npmPackages: ["@fal-ai/client"],
        pythonPackages: ["fal-client"],
        envVars: ["FAL_KEY"],
      }),
      tech("stability_ai", "Stability AI", "Image generation model API provider.", "extended", {
        envVars: ["STABILITY_API_KEY"],
      }),
      tech("runway", "Runway", "Generative video platform.", "extended"),
      tech("luma", "Luma AI", "Generative video and 3D AI platform.", "extended"),
      tech("pika", "Pika", "Generative video platform.", "extended"),
    ],
  },
  {
    key: "ai_search_retrieval",
    name: "AI Search & Retrieval",
    description: "Search, crawling, and retrieval APIs used in AI products.",
    technologies: [
      tech("tavily", "Tavily", "Search API built for AI agents and RAG.", "core", {
        npmPackages: ["@tavily/core"],
        pythonPackages: ["tavily-python"],
        envVars: ["TAVILY_API_KEY"],
      }),
      tech("exa", "Exa", "Neural search API for AI applications.", "core", {
        npmPackages: ["exa-js"],
        pythonPackages: ["exa-py"],
        envVars: ["EXA_API_KEY"],
      }),
      tech("serpapi", "SerpAPI", "Search engine results API.", "extended", {
        npmPackages: ["google-search-results-nodejs"],
        pythonPackages: ["google-search-results"],
        envVars: ["SERPAPI_API_KEY"],
      }),
      tech("brave_search_api", "Brave Search API", "Web search API from Brave.", "core", {
        logo: { source: "simple-icons", slug: "brave" },
        envVars: ["BRAVE_SEARCH_API_KEY"],
      }),
      tech("google_custom_search", "Google Custom Search", "Programmable Google search API.", "extended", {
        logo: { source: "simple-icons", slug: "google" },
        envVars: ["GOOGLE_CUSTOM_SEARCH_API_KEY", "GOOGLE_CSE_ID"],
      }),
      tech("bing_web_search", "Bing Web Search", "Microsoft Bing search API.", "extended", {
        envVars: ["BING_SEARCH_API_KEY"],
      }),
      tech("firecrawl", "Firecrawl", "Web crawling and extraction API for AI apps.", "core", {
        npmPackages: ["@mendable/firecrawl-js"],
        pythonPackages: ["firecrawl-py"],
        envVars: ["FIRECRAWL_API_KEY"],
      }),
      tech("jina_reader", "Jina AI Reader", "Reader API for extracting web content for LLMs.", "core", {
        text: ["r.jina.ai"],
      }),
      tech("linkup", "Linkup", "Web search API for LLM applications.", "extended", {
        envVars: ["LINKUP_API_KEY"],
      }),
      tech("apify", "Apify", "Web scraping and automation platform.", "extended", {
        npmPackages: ["apify", "apify-client"],
        pythonPackages: ["apify-client"],
      }),
    ],
  },
  {
    key: "vector_rag",
    name: "Vector & RAG",
    description: "Vector databases and retrieval infrastructure.",
    technologies: [
      tech("pinecone", "Pinecone", "Managed vector database.", "core", {
        npmPackages: ["@pinecone-database/pinecone"],
        pythonPackages: ["pinecone", "pinecone-client"],
        envVars: ["PINECONE_API_KEY"],
      }),
      tech("qdrant", "Qdrant", "Vector database and similarity search engine.", "core", {
        logo: { source: "simple-icons", slug: "qdrant" },
        npmPackages: ["@qdrant/js-client-rest"],
        pythonPackages: ["qdrant-client"],
        dockerImages: ["qdrant/qdrant"],
      }),
      tech("weaviate", "Weaviate", "Open source vector database.", "extended", {
        npmPackages: ["weaviate-client"],
        pythonPackages: ["weaviate-client"],
      }),
      tech("milvus", "Milvus", "Open source vector database.", "extended", {
        logo: { source: "simple-icons", slug: "milvus" },
        pythonPackages: ["pymilvus"],
      }),
      tech("chroma", "Chroma", "Open source embedding database.", "core", {
        pythonPackages: ["chromadb"],
        npmPackages: ["chromadb"],
      }),
      tech("pgvector", "pgvector", "Vector extension for PostgreSQL.", "core", {
        npmPackages: ["pgvector"],
        pythonPackages: ["pgvector"],
        text: ["vector(", "CREATE EXTENSION vector"],
      }),
      tech("lancedb", "LanceDB", "Developer-friendly vector database.", "core", {
        npmPackages: ["@lancedb/lancedb"],
        pythonPackages: ["lancedb"],
      }),
      tech("turbopuffer", "Turbopuffer", "Serverless vector search engine.", "core", {
        npmPackages: ["@turbopuffer/turbopuffer"],
        pythonPackages: ["turbopuffer"],
        envVars: ["TURBOPUFFER_API_KEY"],
      }),
      tech("upstash_vector", "Upstash Vector", "Serverless vector database.", "core", {
        logo: { source: "simple-icons", slug: "upstash" },
        npmPackages: ["@upstash/vector"],
        envVars: ["UPSTASH_VECTOR_REST_URL", "UPSTASH_VECTOR_REST_TOKEN"],
      }),
      tech("cloudflare_vectorize", "Cloudflare Vectorize", "Vector database on Cloudflare.", "extended", {
        logo: { source: "simple-icons", slug: "cloudflare" },
        text: ["VectorizeIndex", "vectorize"],
      }),
      tech("mongodb_atlas_vector_search", "MongoDB Atlas Vector Search", "Vector search inside MongoDB Atlas.", "extended", {
        logo: { source: "simple-icons", slug: "mongodb" },
        text: ["vectorSearch", "$vectorSearch"],
        logoKey: "mongodb",
      }),
      tech("elasticsearch_vector_search", "Elasticsearch Vector Search", "Vector search in Elasticsearch.", "extended", {
        logo: { source: "simple-icons", slug: "elasticsearch" },
        text: ["dense_vector", "knn"],
        logoKey: "elasticsearch",
      }),
      tech("opensearch_vector_search", "OpenSearch Vector Search", "Vector search in OpenSearch.", "extended", {
        logo: { source: "simple-icons", slug: "opensearch" },
        text: ["knn_vector"],
        logoKey: "opensearch",
      }),
    ],
  },
  {
    key: "ai_frameworks",
    name: "AI Frameworks",
    description: "LLM application frameworks, SDKs, and orchestration libraries.",
    technologies: [
      tech("vercel_ai_sdk", "Vercel AI SDK", "TypeScript SDK for AI apps.", "core", {
        logo: { source: "simple-icons", slug: "vercel" },
        npmPackages: ["ai", "@ai-sdk/openai", "@ai-sdk/anthropic", "@ai-sdk/google"],
        aliases: ["ai sdk"],
        logoKey: "vercel",
      }),
      tech("langchain", "LangChain", "Framework for LLM applications.", "core", {
        logo: { source: "simple-icons", slug: "langchain" },
        npmPackages: ["langchain", "@langchain/core", "@langchain/openai"],
        pythonPackages: ["langchain", "langchain-core", "langchain-openai"],
      }),
      tech("langgraph", "LangGraph", "Stateful agent orchestration framework.", "core", {
        logo: { source: "simple-icons", slug: "langgraph" },
        npmPackages: ["@langchain/langgraph"],
        pythonPackages: ["langgraph"],
      }),
      tech("llamaindex", "LlamaIndex", "Data framework for LLM applications.", "core", {
        npmPackages: ["llamaindex"],
        pythonPackages: ["llama-index"],
      }),
      tech("litellm", "LiteLLM", "Unified interface and proxy for LLM APIs.", "core", {
        pythonPackages: ["litellm"],
        npmPackages: ["litellm"],
      }),
      tech("instructor", "Instructor", "Structured outputs for LLM APIs.", "core", {
        pythonPackages: ["instructor"],
      }),
      tech("dspy", "DSPy", "Framework for programming and optimizing LM pipelines.", "extended", {
        pythonPackages: ["dspy", "dspy-ai"],
      }),
      tech("semantic_kernel", "Semantic Kernel", "Microsoft SDK for AI orchestration.", "extended", {
        npmPackages: ["semantic-kernel"],
        pythonPackages: ["semantic-kernel"],
      }),
      tech("haystack", "Haystack", "Framework for search and RAG applications.", "extended", {
        logo: { source: "simple-icons", slug: "haystack" },
        pythonPackages: ["haystack-ai"],
      }),
      tech("autogen", "AutoGen", "Multi-agent AI framework.", "extended", {
        pythonPackages: ["autogen", "pyautogen"],
      }),
      tech("crewai", "CrewAI", "Multi-agent orchestration framework.", "extended", {
        logo: { source: "simple-icons", slug: "crewai" },
        pythonPackages: ["crewai"],
      }),
      tech("guidance", "Guidance", "Language model control library.", "extended", {
        pythonPackages: ["guidance"],
      }),
      tech("outlines", "Outlines", "Structured text generation library.", "extended", {
        pythonPackages: ["outlines"],
      }),
    ],
  },
  {
    key: "ai_observability_evals",
    name: "AI Observability & Evals",
    description: "LLM tracing, evaluation, prompt management, and observability.",
    technologies: [
      tech("langfuse", "Langfuse", "Open source LLM observability and evaluation platform.", "core", {
        npmPackages: ["langfuse", "langfuse-node"],
        pythonPackages: ["langfuse"],
        envVars: ["LANGFUSE_PUBLIC_KEY", "LANGFUSE_SECRET_KEY"],
      }),
      tech("langsmith", "LangSmith", "Observability and evaluation platform from LangChain.", "core", {
        pythonPackages: ["langsmith"],
        npmPackages: ["langsmith"],
        envVars: ["LANGSMITH_API_KEY"],
      }),
      tech("braintrust", "Braintrust", "AI evaluation and observability platform.", "core", {
        logo: { source: "simple-icons", slug: "braintrust" },
        npmPackages: ["braintrust"],
        pythonPackages: ["braintrust"],
        envVars: ["BRAINTRUST_API_KEY"],
      }),
      tech("helicone", "Helicone", "LLM observability and gateway platform.", "core", {
        npmPackages: ["helicone"],
        envVars: ["HELICONE_API_KEY"],
      }),
      tech("arize_phoenix", "Arize Phoenix", "Open source AI observability and evaluation.", "extended", {
        pythonPackages: ["arize-phoenix"],
      }),
      tech("humanloop", "Humanloop", "Prompt management and evaluation platform.", "extended", {
        pythonPackages: ["humanloop"],
      }),
      tech("promptlayer", "PromptLayer", "Prompt tracking and management platform.", "extended", {
        pythonPackages: ["promptlayer"],
        npmPackages: ["promptlayer"],
      }),
      tech("weave", "Weights & Biases Weave", "LLM tracing and evaluation tooling.", "extended", {
        logo: { source: "simple-icons", slug: "weightsandbiases" },
        pythonPackages: ["weave"],
        logoKey: "wandb",
      }),
    ],
  },
  {
    key: "ai_patterns",
    name: "AI Patterns",
    description: "Architecture and implementation patterns for AI features.",
    technologies: [
      tech("rag", "RAG", "Retrieval-augmented generation architecture.", "core", {
        text: ["retrieval augmented generation", "RAG"],
      }),
      tech("tool_calling", "Tool Calling", "LLM tool or function calling pattern.", "core", {
        text: ["tool_calls", "function_call", "tools:"],
      }),
      tech("agents", "Agents", "Agentic AI systems with planning and tool use.", "core", {
        text: ["agent", "agents"],
      }),
      tech("structured_outputs", "Structured Outputs", "Schema-constrained model outputs.", "core", {
        text: ["response_format", "json_schema", "structured output"],
      }),
      tech("fine_tuning", "Fine-tuning", "Customizing model behavior with training data.", "extended", {
        text: ["fine_tuning", "fine-tuning"],
      }),
      tech("evals", "Evals", "Evaluation workflows for AI outputs.", "core", {
        text: ["evals", "evaluation"],
      }),
    ],
  },
  {
    key: "product_apis",
    name: "Product APIs",
    description: "APIs and services commonly used to build SaaS and products.",
    technologies: [
      tech("stripe", "Stripe", "Payments and billing platform.", "core", {
        logo: { source: "simple-icons", slug: "stripe" },
        npmPackages: ["stripe", "@stripe/stripe-js"],
        pythonPackages: ["stripe"],
        envVars: ["STRIPE_SECRET_KEY", "STRIPE_API_KEY"],
      }),
      tech("clerk", "Clerk", "Authentication and user management platform.", "core", {
        logo: { source: "simple-icons", slug: "clerk" },
        npmPackages: ["@clerk/nextjs", "@clerk/clerk-react"],
      }),
      tech("auth0", "Auth0", "Authentication and identity platform.", "extended", {
        logo: { source: "simple-icons", slug: "auth0" },
        npmPackages: ["@auth0/nextjs-auth0", "@auth0/auth0-react"],
      }),
      tech("authjs", "Auth.js", "Authentication library for web apps.", "core", {
        npmPackages: ["next-auth", "@auth/core"],
        aliases: ["nextauth", "next-auth"],
      }),
      tech("workos", "WorkOS", "Enterprise auth and user management APIs.", "extended", {
        npmPackages: ["@workos-inc/node"],
      }),
      tech("resend", "Resend", "Email API for developers.", "core", {
        logo: { source: "simple-icons", slug: "resend" },
        npmPackages: ["resend"],
        envVars: ["RESEND_API_KEY"],
      }),
      tech("sendgrid", "SendGrid", "Email delivery API.", "extended", {
        npmPackages: ["@sendgrid/mail"],
        pythonPackages: ["sendgrid"],
      }),
      tech("twilio", "Twilio", "Communications APIs for SMS, voice, and messaging.", "extended", {
        npmPackages: ["twilio"],
        pythonPackages: ["twilio"],
      }),
      tech("slack_api", "Slack API", "Slack platform API and app framework.", "core", {
        npmPackages: ["@slack/web-api", "@slack/bolt"],
        pythonPackages: ["slack-sdk", "slack-bolt"],
        logoKey: "slack",
      }),
      tech("discord_api", "Discord API", "Discord bot and application APIs.", "extended", {
        logo: { source: "simple-icons", slug: "discord" },
        npmPackages: ["discord.js"],
        pythonPackages: ["discord.py"],
        logoKey: "discord",
      }),
      tech("github_api", "GitHub API", "GitHub REST and GraphQL APIs.", "core", {
        logo: { source: "simple-icons", slug: "github" },
        npmPackages: ["octokit", "@octokit/rest"],
        pythonPackages: ["PyGithub"],
        logoKey: "github",
      }),
      tech("google_maps_api", "Google Maps API", "Maps, geocoding, and location APIs.", "extended", {
        logo: { source: "simple-icons", slug: "googlemaps" },
        npmPackages: ["@googlemaps/google-maps-services-js"],
      }),
      tech("mapbox", "Mapbox", "Maps and location platform.", "extended", {
        logo: { source: "simple-icons", slug: "mapbox" },
        npmPackages: ["mapbox-gl"],
      }),
      tech("notion_api", "Notion API", "Notion workspace integration API.", "extended", {
        logo: { source: "simple-icons", slug: "notion" },
        npmPackages: ["@notionhq/client"],
        logoKey: "notion",
      }),
      tech("linear_api", "Linear API", "Linear issue tracking API.", "extended", {
        logo: { source: "simple-icons", slug: "linear" },
        npmPackages: ["@linear/sdk"],
        logoKey: "linear",
      }),
      tech("plaid", "Plaid", "Financial data API platform.", "extended", {
        npmPackages: ["plaid"],
        pythonPackages: ["plaid-python"],
      }),
    ],
  },
  {
    key: "devops_infrastructure",
    name: "DevOps & Infrastructure",
    description: "Infrastructure, containers, CI/CD, and job orchestration.",
    technologies: [
      tech("docker", "Docker", "Containerization platform.", "core", {
        logo: { source: "simple-icons", slug: "docker" },
        files: ["Dockerfile", "docker-compose.yml", "compose.yml"],
      }),
      tech("kubernetes", "Kubernetes", "Container orchestration platform.", "core", {
        logo: { source: "simple-icons", slug: "kubernetes" },
        files: ["kustomization.yaml"],
        aliases: ["k8s"],
      }),
      tech("terraform", "Terraform", "Infrastructure as code tool.", "core", {
        logo: { source: "simple-icons", slug: "terraform" },
        files: ["main.tf", "providers.tf", "variables.tf"],
      }),
      tech("pulumi", "Pulumi", "Infrastructure as code with programming languages.", "extended", {
        logo: { source: "simple-icons", slug: "pulumi" },
        npmPackages: ["@pulumi/pulumi"],
        pythonPackages: ["pulumi"],
        files: ["Pulumi.yaml"],
      }),
      tech("helm", "Helm", "Package manager for Kubernetes.", "extended", {
        logo: { source: "simple-icons", slug: "helm" },
        files: ["Chart.yaml"],
      }),
      tech("argo_cd", "Argo CD", "GitOps continuous delivery for Kubernetes.", "extended", {
        logo: { source: "simple-icons", slug: "argo" },
        text: ["argoproj.io"],
        aliases: ["argo"],
      }),
      tech("github_actions", "GitHub Actions", "CI/CD workflows in GitHub.", "core", {
        logo: { source: "simple-icons", slug: "githubactions" },
        files: [".github/workflows"],
        workflowUses: ["actions/checkout", "github/actions"],
      }),
      tech("gitlab_ci", "GitLab CI", "GitLab continuous integration.", "extended", {
        logo: { source: "simple-icons", slug: "gitlab" },
        files: [".gitlab-ci.yml"],
        aliases: ["gitlab"],
      }),
      tech("circleci", "CircleCI", "Continuous integration platform.", "extended", {
        logo: { source: "simple-icons", slug: "circleci" },
        files: [".circleci/config.yml"],
      }),
      tech("buildkite", "Buildkite", "CI/CD platform.", "extended", {
        logo: { source: "simple-icons", slug: "buildkite" },
        files: ["buildkite.yml", ".buildkite/pipeline.yml"],
      }),
      tech("jenkins", "Jenkins", "Automation server for CI/CD.", "legacy", {
        logo: { source: "simple-icons", slug: "jenkins" },
        files: ["Jenkinsfile"],
      }),
      tech("docker_compose", "Docker Compose", "Multi-container Docker application configuration.", "core", {
        logo: { source: "simple-icons", slug: "docker" },
        files: ["docker-compose.yml", "compose.yml"],
        logoKey: "docker",
      }),
      tech("nix", "Nix", "Reproducible package management and builds.", "extended", {
        files: ["flake.nix", "default.nix", "shell.nix"],
      }),
      tech("devcontainers", "Dev Containers", "Containerized development environments.", "extended", {
        logo: { source: "simple-icons", slug: "devdotto" },
        files: [".devcontainer/devcontainer.json"],
      }),
      tech("testcontainers", "Testcontainers", "Disposable containers for integration testing.", "extended", {
        npmPackages: ["testcontainers"],
        pythonPackages: ["testcontainers"],
        javaPackages: ["org.testcontainers"],
      }),
      tech("gradle", "Gradle", "Build automation tool for JVM and Android projects.", "extended", {
        logo: { source: "simple-icons", slug: "gradle" },
        files: ["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"],
        text: ["plugins {", "implementation("],
      }),
      tech("inngest", "Inngest", "Durable background jobs and workflows.", "core", {
        npmPackages: ["inngest"],
      }),
      tech("trigger_dev", "Trigger.dev", "Background jobs for TypeScript.", "core", {
        npmPackages: ["@trigger.dev/sdk", "@trigger.dev/react"],
        aliases: ["trigger.dev"],
      }),
      tech("temporal", "Temporal", "Durable workflow orchestration platform.", "core", {
        logo: { source: "simple-icons", slug: "temporal" },
        npmPackages: ["@temporalio/client", "@temporalio/worker"],
        pythonPackages: ["temporalio"],
      }),
      tech("bullmq", "BullMQ", "Redis-backed Node.js job queue.", "extended", {
        npmPackages: ["bullmq"],
      }),
      tech("celery", "Celery", "Distributed task queue for Python.", "extended", {
        logo: { source: "simple-icons", slug: "celery" },
        pythonPackages: ["celery"],
      }),
      tech("sidekiq", "Sidekiq", "Background jobs for Ruby.", "extended", {
        logo: { source: "simple-icons", slug: "sidekiq" },
        rubyGems: ["sidekiq"],
      }),
      tech("n8n", "n8n", "Workflow automation platform.", "extended", {
        logo: { source: "simple-icons", slug: "n8n" },
      }),
      tech("zapier", "Zapier", "Workflow automation platform.", "extended", {
        logo: { source: "simple-icons", slug: "zapier" },
      }),
      tech("make", "Make", "Workflow automation platform.", "extended", {
        logo: { source: "simple-icons", slug: "make" },
      }),
      tech("pipedream", "Pipedream", "Workflow automation for developers.", "extended"),
    ],
  },
  {
    key: "observability",
    name: "Observability",
    description: "Monitoring, logging, tracing, and error tracking.",
    technologies: [
      tech("sentry", "Sentry", "Application error tracking and performance monitoring.", "core", {
        logo: { source: "simple-icons", slug: "sentry" },
        npmPackages: ["@sentry/nextjs", "@sentry/node", "@sentry/react"],
        pythonPackages: ["sentry-sdk"],
      }),
      tech("datadog", "Datadog", "Cloud monitoring and observability platform.", "core", {
        logo: { source: "simple-icons", slug: "datadog" },
        npmPackages: ["dd-trace"],
        pythonPackages: ["ddtrace"],
      }),
      tech("grafana", "Grafana", "Observability dashboards and visualization.", "core", {
        logo: { source: "simple-icons", slug: "grafana" },
      }),
      tech("prometheus", "Prometheus", "Metrics and monitoring system.", "core", {
        logo: { source: "simple-icons", slug: "prometheus" },
      }),
      tech("new_relic", "New Relic", "Application performance monitoring platform.", "extended", {
        logo: { source: "simple-icons", slug: "newrelic" },
        npmPackages: ["newrelic"],
      }),
      tech("honeycomb", "Honeycomb", "Observability platform for distributed systems.", "extended"),
      tech("opentelemetry", "OpenTelemetry", "Open standard for traces, metrics, and logs.", "core", {
        logo: { source: "simple-icons", slug: "opentelemetry" },
        npmPackages: ["@opentelemetry/api", "@opentelemetry/sdk-node"],
        pythonPackages: ["opentelemetry-api", "opentelemetry-sdk"],
        aliases: ["otel"],
      }),
      tech("better_stack", "Better Stack", "Logs, uptime, and incident management.", "extended", {
        logo: { source: "simple-icons", slug: "betterstack" },
        aliases: ["logtail"],
      }),
    ],
  },
  {
    key: "testing_quality",
    name: "Testing & Quality",
    description: "Testing frameworks, QA tools, and code quality tooling.",
    technologies: [
      tech("vitest", "Vitest", "Fast Vite-native test framework.", "core", {
        logo: { source: "simple-icons", slug: "vitest" },
        npmPackages: ["vitest"],
        files: ["vitest.config.ts", "vitest.config.js"],
      }),
      tech("jest", "Jest", "JavaScript testing framework.", "core", {
        logo: { source: "simple-icons", slug: "jest" },
        npmPackages: ["jest"],
        files: ["jest.config.js", "jest.config.ts"],
      }),
      tech("playwright", "Playwright", "End-to-end browser testing and automation.", "core", {
        npmPackages: ["@playwright/test", "playwright"],
        pythonPackages: ["playwright"],
        files: ["playwright.config.ts", "playwright.config.js"],
      }),
      tech("cypress", "Cypress", "End-to-end testing framework.", "extended", {
        logo: { source: "simple-icons", slug: "cypress" },
        npmPackages: ["cypress"],
        files: ["cypress.config.ts", "cypress.config.js"],
      }),
      tech("testing_library", "Testing Library", "Testing utilities for UI components.", "core", {
        logo: { source: "simple-icons", slug: "testinglibrary" },
        npmPackages: ["@testing-library/react", "@testing-library/dom", "@testing-library/jest-dom"],
      }),
      tech("storybook", "Storybook", "Workshop for UI components.", "core", {
        logo: { source: "simple-icons", slug: "storybook" },
        npmPackages: ["storybook", "@storybook/react", "@storybook/nextjs"],
        files: [".storybook/main.ts", ".storybook/main.js"],
      }),
      tech("chromatic", "Chromatic", "Visual testing and review for Storybook.", "extended", {
        logo: { source: "simple-icons", slug: "chromatic" },
        npmPackages: ["chromatic"],
      }),
      tech("eslint", "ESLint", "JavaScript and TypeScript linting.", "core", {
        logo: { source: "simple-icons", slug: "eslint" },
        npmPackages: ["eslint"],
        files: ["eslint.config.js", ".eslintrc.json"],
      }),
      tech("prettier", "Prettier", "Code formatter.", "core", {
        logo: { source: "simple-icons", slug: "prettier" },
        npmPackages: ["prettier"],
        files: [".prettierrc", "prettier.config.js"],
      }),
      tech("biome", "Biome", "Fast formatter and linter.", "core", {
        logo: { source: "simple-icons", slug: "biome" },
        npmPackages: ["@biomejs/biome"],
        files: ["biome.json"],
      }),
      tech("trivy", "Trivy", "Security scanner for containers and dependencies.", "extended", {
        logo: { source: "simple-icons", slug: "trivy" },
        workflowUses: ["aquasecurity/trivy-action"],
      }),
      tech("dependabot", "Dependabot", "Automated dependency updates.", "extended", {
        logo: { source: "simple-icons", slug: "dependabot" },
        files: [".github/dependabot.yml"],
      }),
    ],
  },
  {
    key: "design_collaboration",
    name: "Design & Collaboration",
    description: "Design tools and team collaboration platforms.",
    technologies: [
      tech("figma", "Figma", "Collaborative interface design tool.", "core", {
        logo: { source: "simple-icons", slug: "figma" },
      }),
      tech("framer", "Framer", "Interactive design and website tool.", "extended", {
        logo: { source: "simple-icons", slug: "framer" },
      }),
      tech("figjam", "FigJam", "Collaborative whiteboard from Figma.", "extended", {
        logoKey: "figma",
      }),
      tech("notion", "Notion", "Workspace and documentation tool.", "core", {
        logo: { source: "simple-icons", slug: "notion" },
      }),
      tech("linear", "Linear", "Issue tracking and product planning tool.", "core", {
        logo: { source: "simple-icons", slug: "linear" },
      }),
      tech("slack", "Slack", "Team communication platform.", "core"),
      tech("discord", "Discord", "Community and chat platform.", "extended", {
        logo: { source: "simple-icons", slug: "discord" },
      }),
      tech("github_projects", "GitHub Projects", "Project planning in GitHub.", "extended", {
        logo: { source: "simple-icons", slug: "github" },
        logoKey: "github",
      }),
    ],
  },
]);

export type TechnologyKey =
  (typeof techStackCategories)[number]["technologies"][number]["key"];

export type CanonicalTechnology = Technology & {
  key: TechnologyKey;
  categoryKey: TechnologyCategoryKey;
  categoryName: string;
};

export const technologies = techStackCategories;

export const allTechnologies: readonly CanonicalTechnology[] =
  techStackCategories.flatMap((category) =>
    category.technologies.map((technology) => ({
      ...technology,
      categoryKey: category.key,
      categoryName: category.name,
    })),
  );

export const technologyKeys = allTechnologies.map(
  (technology) => technology.key,
);

export function getTechnologyByKey(
  key: string,
): CanonicalTechnology | null {
  return (
    allTechnologies.find((technology) => technology.key === key) ?? null
  );
}

export function isTechnologyKey(key: string): key is TechnologyKey {
  return allTechnologies.some((technology) => technology.key === key);
}

function tech<const Key extends string>(
  key: Key,
  name: string,
  description: string,
  tier: TechnologyTier,
  options: {
    logo?: TechnologyLogo;
    logoKey?: string;
    aliases?: readonly string[];
  } & TechnologyDetection = {},
): Technology & { key: Key } {
  const { aliases, logo, logoKey, ...detection } = options;
  const hasDetection = Object.values(detection).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  return {
    key,
    name,
    description,
    tier,
    ...(logo ? { logo } : {}),
    ...(logoKey ? { logoKey } : {}),
    ...(aliases ? { aliases } : {}),
    ...(hasDetection ? { detection } : {}),
  };
}
