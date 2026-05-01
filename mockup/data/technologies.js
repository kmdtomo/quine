// data/technologies.js - frontend/lib/db/technologies.type.ts から流用
window.TECHNOLOGIES = [
  // ──────────────────────────────
  // プログラミング言語
  // ──────────────────────────────
  {
    name: "Language",
    technologies: [
      {
        key: "javascript",
        name: "JavaScript",
        description: "ウェブブラウザで動作するスクリプト言語。",
      },
      {
        key: "typescript",
        name: "TypeScript",
        description: "型付けが可能なJavaScriptのスーパーセット。",
      },
      {
        key: "java",
        name: "Java",
        description: "オブジェクト指向の汎用プログラミング言語。",
      },
      {
        key: "python",
        name: "Python",
        description: "可読性が高く、多用途なプログラミング言語。",
      },
      {
        key: "go",
        name: "Go (Golang)",
        description: "シンプルで効率的な並行処理が可能な言語。",
      },
      {
        key: "ruby",
        name: "Ruby",
        description: "シンプルさと生産性に焦点を当てたプログラミング言語。",
      },
      {
        key: "swift",
        name: "Swift",
        description: "Appleが開発したモダンなプログラミング言語。",
      },
      {
        key: "kotlin",
        name: "Kotlin",
        description: "モダンで簡潔なAndroid開発言語。",
      },
      {
        key: "rust",
        name: "Rust",
        description:
          "メモリ安全性と並行性を重視したシステムプログラミング言語。",
      },
      {
        key: "c_sharp",
        name: "C#",
        description: "Microsoftが開発したオブジェクト指向言語。",
      },
      {
        key: "php",
        name: "PHP",
        description: "ウェブ開発向けのオープンソーススクリプト言語。",
      },
      {
        key: "c_plus_plus",
        name: "C++",
        description:
          "C言語の拡張版。オブジェクト指向プログラミングをサポート。",
      },
      {
        key: "c",
        name: "C",
        description: "低レベルのシステムプログラミング言語。",
      },
      {
        key: "dart",
        name: "Dart",
        description: "主にクライアントサイドアプリ開発で使われる言語。",
      },
      {
        key: "clojure",
        name: "Clojure",
        description: "関数型プログラミングをサポートする言語。",
      },
      {
        key: "elixir",
        name: "Elixir",
        description: "並行性と分散システムに強い関数型言語。",
      },
      {
        key: "perl",
        name: "Perl",
        description: "テキスト処理に強い汎用プログラミング言語。",
      },
      {
        key: "r",
        name: "R",
        description: "統計解析・データ分析に特化した言語。",
      },
      {
        key: "scala",
        name: "Scala",
        description: "オブジェクト指向と関数型プログラミングを融合した言語。",
      },
      {
        key: "objective_c",
        name: "Objective-C",
        description: "Appleの従来のプログラミング言語。",
      },
      {
        key: "mruby",
        name: "mruby",
        description: "組み込み向けの軽量Ruby実装。",
      },
      {
        key: "sql",
        name: "SQL",
        description: "データベース操作のための標準的なクエリ言語。",
      },
      {
        key: "shell_bash",
        name: "Shell/Bash",
        description: "システム操作・自動化のためのコマンドラインスクリプト言語。",
      },
    ],
  },

  // ──────────────────────────────
  // フロントエンド技術
  // ──────────────────────────────
  {
    name: "Frontend",
    technologies: [
      {
        key: "react",
        name: "React",
        description: "UI構築のためのJavaScriptライブラリ。",
      },
      {
        key: "vuejs",
        name: "Vue.js",
        description: "軽量で柔軟なフロントエンドフレームワーク。",
      },
      {
        key: "angular",
        name: "Angular",
        description: "フル機能のフロントエンドフレームワーク。",
      },
      {
        key: "nextjs",
        name: "Next.js",
        description: "Reactベースのサーバーサイドレンダリングフレームワーク。",
      },
      {
        key: "svelte",
        name: "Svelte",
        description: "コンパイル時に最適化されるフロントエンドフレームワーク。",
      },
      {
        key: "sveltekit",
        name: "SvelteKit",
        description: "Svelte向けのフルスタックフレームワーク。",
      },
      {
        key: "jquery",
        name: "jQuery",
        description: "DOM操作を容易にするJavaScriptライブラリ。",
      },
      {
        key: "backbonejs",
        name: "Backbone.js",
        description: "シンプルなMVC構造を提供するライブラリ。",
      },

      {
        key: "coffeescript",
        name: "CoffeeScript",
        description: "簡潔な記法でJavaScriptに変換される言語。",
      },
      {
        key: "closure_library",
        name: "Closure Library",
        description: "Google提供のJavaScriptライブラリ群。",
      },
      {
        key: "html",
        name: "HTML",
        description: "ウェブページの構造を定義するマークアップ言語。",
      },
      {
        key: "css",
        name: "CSS",
        description: "ウェブページのスタイリングを定義するスタイルシート言語。",
      },
      {
        key: "nuxt",
        name: "Nuxt.js",
        description: "Vue.js向けのフレームワーク。",
      },
      {
        key: "gatsby",
        name: "Gatsby",
        description: "Reactベースの静的サイトジェネレーター。",
      },
      {
        key: "remix",
        name: "Remix",
        description: "React向けのフルスタックウェブフレームワーク。",
      },
      {
        key: "redux",
        name: "Redux",
        description: "JavaScript状態管理ライブラリ。",
      },
      {
        key: "mobx",
        name: "MobX",
        description: "React向け状態管理ライブラリ。",
      },
      {
        key: "zustand",
        name: "Zustand",
        description: "軽量な状態管理ライブラリ。",
      },
      {
        key: "jotai",
        name: "Jotai",
        description: "React用状態管理ライブラリ。",
      },
      {
        key: "streamlit",
        name: "Streamlit",
        description: "Pythonでインタラクティブなウェブアプリを構築するフレームワーク。",
      },
    ],
  },

  // ──────────────────────────────
  // バックエンド開発
  // ──────────────────────────────
  {
    name: "Backend",
    technologies: [
      {
        key: "nodejs",
        name: "Node.js",
        description: "JavaScriptをバックエンドで実行するためのランタイム。",
      },
      {
        key: "express",
        name: "Express.js",
        description: "Node.js向けの軽量ウェブフレームワーク。",
      },
      {
        key: "django",
        name: "Django",
        description: "Pythonで構築された高機能ウェブフレームワーク。",
      },
      {
        key: "ruby_on_rails",
        name: "Ruby on Rails",
        description: "Rubyによるフルスタックウェブフレームワーク。",
      },
      {
        key: "springboot",
        name: "Spring Boot",
        description: "Java向けのアプリケーションフレームワーク。",
      },
      {
        key: "laravel",
        name: "Laravel",
        description: "PHPのためのモダンなフレームワーク。",
      },
      {
        key: "fastapi",
        name: "FastAPI",
        description: "Pythonのための高速APIフレームワーク。",
      },
      {
        key: "actix_web",
        name: "Actix Web",
        description: "Rust製の高性能ウェブフレームワーク。",
      },
      {
        key: "gin",
        name: "Gin",
        description: "Go向けのシンプルなウェブフレームワーク。",
      },
      {
        key: "koa",
        name: "Koa",
        description: "Node.jsのための次世代ウェブフレームワーク。",
      },
      {
        key: "nestjs",
        name: "NestJS",
        description: "TypeScriptで書かれた堅牢なNode.jsフレームワーク。",
      },
      {
        key: "phoenix",
        name: "Phoenix",
        description: "Elixir製のスケーラブルなウェブフレームワーク。",
      },
      {
        key: "hanami",
        name: "Hanami",
        description: "Rubyの軽量でモダンなウェブフレームワーク。",
      },
      {
        key: "fuelphp",
        name: "FuelPHP",
        description: "PHP用の柔軟なウェブアプリケーションフレームワーク。",
      },
      { key: "goa", name: "Goa", description: "Go言語向けのフレームワーク。" },
      {
        key: "go_chi",
        name: "Chi",
        description: "Go言語の軽量なHTTPルーター。",
      },
      {
        key: "gqlgen",
        name: "gqlgen",
        description: "Go言語用のGraphQLサーバーライブラリ。",
      },
      {
        key: "asp_net",
        name: "ASP.NET",
        description: "Microsoft製のウェブフレームワーク。",
      },
      {
        key: "assert_j_db",
        name: "AssertJ-DB",
        description: "データベーステスト用のJavaライブラリ。",
      },
      {
        key: "flask",
        name: "Flask",
        description: "Pythonの軽量ウェブフレームワーク。",
      },
      {
        key: "cakephp",
        name: "CakePHP",
        description: "PHP向けウェブフレームワーク。",
      },
      {
        key: "symfony",
        name: "Symfony",
        description: "PHPのフルスタックフレームワーク。",
      },
      {
        key: "echo",
        name: "Echo",
        description: "Go向けウェブフレームワーク。",
      },
    ],
  },

  // ──────────────────────────────
  // モバイル
  // ──────────────────────────────
  {
    name: "Mobile",
    technologies: [
      {
        key: "swiftui",
        name: "SwiftUI",
        description: "宣言的なUI構築のためのフレームワーク。",
      },
      {
        key: "uikit",
        name: "UIKit",
        description: "従来のiOS向けUIコンポーネントフレームワーク。",
      },
      {
        key: "react_native",
        name: "React Native",
        description: "JavaScriptでクロスプラットフォームアプリを構築。",
      },
      {
        key: "flutter",
        name: "Flutter",
        description: "Google製のクロスプラットフォームモバイルフレームワーク。",
      },
      {
        key: "jetpack_compose",
        name: "Jetpack Compose",
        description: "Android向け最新の宣言的UIツールキット。",
      },
      {
        key: "ionic",
        name: "Ionic",
        description: "HTML/CSS/JSでモバイルアプリを開発するフレームワーク。",
      },
      {
        key: "xamarin",
        name: "Xamarin",
        description: "C#でクロスプラットフォームモバイルアプリを構築。",
      },
      {
        key: "carthage",
        name: "Carthage",
        description: "iOS向けの依存関係管理ツール。",
      },
      {
        key: "appium",
        name: "Appium",
        description: "モバイルアプリ自動テストツール。",
      },
      {
        key: "expo",
        name: "Expo",
        description: "React Native向けの開発ツールチェーン。",
      },
      {
        key: "cocoapods",
        name: "CocoaPods",
        description: "iOS向けの依存関係管理ツール。",
      },
      {
        key: "alamofire",
        name: "Alamofire",
        description: "Swift向けHTTPネットワーキングライブラリ。",
      },
      {
        key: "rxswift",
        name: "RxSwift",
        description: "Swift向けリアクティブプログラミングライブラリ。",
      },
      {
        key: "rxjava",
        name: "RxJava",
        description: "Java向けリアクティブプログラミングライブラリ。",
      },
      {
        key: "rxkotlin",
        name: "RxKotlin",
        description: "Kotlin向けリアクティブライブラリ。",
      },
      {
        key: "kotlin_multiplatform",
        name: "Kotlin Multiplatform",
        description: "Kotlinによるマルチプラットフォーム開発。",
      },
    ],
  },

  // ──────────────────────────────
  // データベース
  // ──────────────────────────────
  {
    name: "Database",
    technologies: [
      {
        key: "mysql",
        name: "MySQL",
        description: "オープンソースのリレーショナルデータベース。",
      },
      {
        key: "postgresql",
        name: "PostgreSQL",
        description: "高機能なオープンソースRDBMS。",
      },
      {
        key: "mongodb",
        name: "MongoDB",
        description: "ドキュメント指向のNoSQLデータベース。",
      },
      { key: "redis", name: "Redis", description: "インメモリデータストア。" },
      {
        key: "sqlite",
        name: "SQLite",
        description: "軽量なデータベースエンジン。",
      },
      {
        key: "oracle_database",
        name: "Oracle Database",
        description: "エンタープライズ向けRDBMS。",
      },
      {
        key: "mariadb",
        name: "MariaDB",
        description: "MySQLフォークのオープンソースRDBMS。",
      },
      {
        key: "neo4j",
        name: "Neo4j",
        description: "グラフデータベース管理システム。",
      },
      {
        key: "clickhouse",
        name: "ClickHouse",
        description: "高速なカラム指向データベース。",
      },
      {
        key: "aerospike",
        name: "Aerospike",
        description: "高パフォーマンスなNoSQLデータベース。",
      },
      {
        key: "alloy_db_for_postgre_sql",
        name: "AlloyDB for PostgreSQL",
        description: "Google Cloud提供のPostgreSQL互換DB。",
      },
      {
        key: "percona_xtradb_cluster",
        name: "Percona XtraDB Cluster",
        description: "高可用性のMySQLクラスタリングソリューション。",
      },
      {
        key: "couchdb",
        name: "CouchDB",
        description: "ドキュメント指向のNoSQLデータベース。",
      },
      {
        key: "cassandra",
        name: "Apache Cassandra",
        description: "高可用性・分散NoSQLデータベース。",
      },
      {
        key: "realm",
        name: "Realm",
        description: "モバイル向けデータベース。",
      },
    ],
  },

  // ──────────────────────────────
  // UIライブラリ
  // ──────────────────────────────
  {
    name: "UI Library",
    technologies: [
      {
        key: "bootstrap",
        name: "Bootstrap",
        description: "レスポンシブなデザインを実現するCSSフレームワーク。",
      },
      {
        key: "tailwind_css",
        name: "Tailwind CSS",
        description: "ユーティリティファーストのCSSフレームワーク。",
      },
      {
        key: "bulma",
        name: "Bulma",
        description: "モダンなCSSフレームワーク。",
      },
      {
        key: "material_ui",
        name: "Material-UI",
        description: "React用のマテリアルデザインコンポーネントライブラリ。",
      },
      {
        key: "mui",
        name: "MUI",
        description: "Material-UIの再ブランディング版。",
      },
      {
        key: "chakra_ui",
        name: "Chakra UI",
        description: "シンプルなReactコンポーネントライブラリ。",
      },
      {
        key: "ant_design",
        name: "Ant Design",
        description: "エンタープライズ向けのReact UIライブラリ。",
      },
      {
        key: "mantine",
        name: "Mantine",
        description: "Reactコンポーネントライブラリ。",
      },
      {
        key: "styled_components",
        name: "styled-components",
        description: "CSS-in-JSライブラリ。",
      },
      {
        key: "emotion",
        name: "Emotion",
        description: "CSS-in-JSライブラリ。",
      },
      {
        key: "sass",
        name: "Sass",
        description: "CSS拡張言語。",
      },
      {
        key: "scss",
        name: "SCSS",
        description: "Sass拡張構文。",
      },
      {
        key: "css_modules",
        name: "CSS Modules",
        description: "CSSのスコープをコンポーネント単位に限定する仕組み。",
      },
    ],
  },

   // ──────────────────────────────
  // 機械学習
  // ──────────────────────────────
  {
    name: "ML",
    technologies: [
      {
        key: "tensorflow",
        name: "TensorFlow",
        description: "機械学習フレームワーク。",
      },
      {
        key: "pytorch",
        name: "PyTorch",
        description: "深層学習向けライブラリ。",
      },
      {
        key: "scikit_learn",
        name: "scikit-learn",
        description: "Pythonの機械学習ライブラリ。",
      },
      {
        key: "keras",
        name: "Keras",
        description: "高水準ニューラルネットワークAPI。",
      },
      {
        key: "pytorch_lightning",
        name: "PyTorch Lightning",
        description: "PyTorchの軽量ラッパー。",
      },
      {
        key: "onnx",
        name: "ONNX",
        description: "機械学習モデル交換フォーマット。",
      },
      {
        key: "opencv",
        name: "OpenCV",
        description: "コンピュータビジョンライブラリ。",
      },
      {
        key: "lightgbm",
        name: "LightGBM",
        description: "高速な勾配ブースティングフレームワーク。",
      },
      {
        key: "optuna",
        name: "Optuna",
        description: "ハイパーパラメータ最適化ライブラリ。",
      },
      {
        key: "prophet",
        name: "Prophet",
        description: "時系列予測ライブラリ（Facebook製）。",
      },
      {
        key: "polyaxon",
        name: "Polyaxon",
        description: "機械学習ライフサイクル管理ツール。",
      },
      {
        key: "metaflow",
        name: "Metaflow",
        description: "データサイエンス向けワークフロー管理ツール。",
      },
      {
        key: "matplotlib",
        name: "Matplotlib",
        description: "Python向けデータ可視化ライブラリ。",
      },
      {
        key: "seaborn",
        name: "Seaborn",
        description: "統計データ可視化ライブラリ。",
      },
      {
        key: "polars",
        name: "Polars",
        description: "高速なデータフレームライブラリ。",
      },
      {
        key: "xgboost",
        name: "XGBoost",
        description: "勾配ブースティング機械学習ライブラリ。",
      },
      {
        key: "scipy",
        name: "SciPy",
        description: "科学計算・統計解析ライブラリ。",
      },
      {
        key: "statsmodels",
        name: "Statsmodels",
        description: "統計モデリング・計量経済学ライブラリ。",
      },
      {
        key: "plotly",
        name: "Plotly",
        description: "インタラクティブなデータ可視化ライブラリ。",
      },
      {
        key: "bokeh",
        name: "Bokeh",
        description: "インタラクティブ可視化ライブラリ。",
      },
      {
        key: "altair",
        name: "Altair",
        description: "統計的データ可視化ライブラリ。",
      },
      {
        key: "mlflow",
        name: "MLflow",
        description: "機械学習ライフサイクル管理プラットフォーム。",
      },
      {
        key: "wandb",
        name: "Weights & Biases",
        description: "機械学習実験トラッキング・管理ツール。",
      },
      {
        key: "huggingface_transformers",
        name: "Hugging Face Transformers",
        description: "事前訓練済み自然言語処理モデルライブラリ。",
      },
      {
        key: "spacy",
        name: "spaCy",
        description: "産業レベルの自然言語処理ライブラリ。",
      },
    ],
  },


  // ──────────────────────────────
  // データ分析・BI
  // ──────────────────────────────
  {
    name: "Analytics",
    technologies: [
      {
        key: "pandas",
        name: "Pandas",
        description: "データ操作・分析ライブラリ。",
      },
      {
        key: "numpy",
        name: "NumPy",
        description: "科学計算ライブラリ。",
      },
      {
        key: "jupyter_notebook",
        name: "Jupyter Notebook",
        description: "対話型データ解析環境。",
      },
      {
        key: "tableau",
        name: "Tableau",
        description: "データ可視化ツール。",
      },
      {
        key: "superset",
        name: "Apache Superset",
        description: "データ探索・可視化ツール。",
      },
      {
        key: "metabase",
        name: "Metabase",
        description: "オープンソースBIツール。",
      },
      {
        key: "redash",
        name: "Redash",
        description: "データ可視化・クエリツール。",
      },
      {
        key: "holistics",
        name: "Holistics",
        description: "データレポート・BIツール。",
      },
      {
        key: "d3js",
        name: "D3.js",
        description: "データ可視化ライブラリ。",
      },
      {
        key: "databricks",
        name: "Databricks",
        description: "ビッグデータ分析プラットフォーム。",
      },
      {
        key: "dbt",
        name: "dbt",
        description: "データ変換ツール。",
      },
      {
        key: "airbyte",
        name: "Airbyte",
        description: "オープンソースのデータ統合ツール。",
      },
      {
        key: "embulk",
        name: "Embulk",
        description: "データバルクロードツール。",
      },
      {
        key: "fivetran",
        name: "Fivetran",
        description: "データ統合ツール。",
      },
      {
        key: "trocco",
        name: "Trocco",
        description: "データ統合・可視化ツール。",
      },
    ],
  },


  // ──────────────────────────────
  // デザイン
  // ──────────────────────────────
  {
    name: "Design",
    technologies: [
      {
        key: "figma",
        name: "Figma",
        description: "UI/UXデザインとプロトタイピングツール。",
      },
      {
        key: "adobe_photoshop",
        name: "Adobe Photoshop",
        description: "画像編集ソフトウェア。",
      },
      {
        key: "adobe_illustrator",
        name: "Adobe Illustrator",
        description: "ベクターグラフィック作成ツール。",
      },
      {
        key: "adobe_xd",
        name: "Adobe XD",
        description: "UI/UXデザインツール。",
      },
      {
        key: "sketch",
        name: "Sketch",
        description: "UIデザインツール。",
      },
      {
        key: "zeplin",
        name: "Zeplin",
        description: "デザインと開発の連携ツール。",
      },
      {
        key: "invision",
        name: "InVision",
        description: "プロトタイピング・デザインコラボレーションツール。",
      },
      {
        key: "framer",
        name: "Framer",
        description: "プロトタイピング・デザインツール。",
      },
      {
        key: "principle",
        name: "Principle",
        description: "アニメーション・インタラクションデザインツール。",
      },
    ],
  },

  // ──────────────────────────────
  // インフラ
  // ──────────────────────────────
  
  // Amazon Web Services (AWS)
  {
    name: "AWS",
    technologies: [
      {
        key: "aws_s3",
        name: "Amazon S3",
        description: "スケーラブルなオブジェクトストレージサービス。",
      },
      {
        key: "aws_ec2",
        name: "Amazon EC2",
        description: "仮想サーバーのプロビジョニングサービス。",
      },
      {
        key: "aws_lambda",
        name: "AWS Lambda",
        description: "サーバーレスコンピューティングサービス。",
      },
      {
        key: "aws_dynamodb",
        name: "Amazon DynamoDB",
        description: "フルマネージドNoSQLデータベースサービス。",
      },
      {
        key: "aws_rds",
        name: "Amazon RDS",
        description: "リレーショナルデータベース管理サービス。",
      },
      {
        key: "aws_cloudfront",
        name: "Amazon CloudFront",
        description: "グローバルCDNサービス。",
      },
      {
        key: "aws_amplify",
        name: "AWS Amplify",
        description: "フロントエンド向けクラウドサービス。",
      },
      {
        key: "aws_api_gateway",
        name: "AWS API Gateway",
        description: "API管理サービス。",
      },
      {
        key: "aws_appconfig",
        name: "AWS AppConfig",
        description: "アプリ設定管理サービス。",
      },
      {
        key: "aws_appsync",
        name: "AWS AppSync",
        description: "GraphQL APIサービス。",
      },
      {
        key: "aws_athena",
        name: "AWS Athena",
        description: "S3上データのインタラクティブクエリ。",
      },
      {
        key: "aws_aurora",
        name: "Amazon Aurora",
        description: "高性能リレーショナルデータベースエンジン。",
      },
      {
        key: "aws_batch",
        name: "AWS Batch",
        description: "バッチ処理ジョブ管理サービス。",
      },
      {
        key: "aws_cdk",
        name: "AWS CDK",
        description: "クラウドリソースをコード化するツール。",
      },
      {
        key: "aws_certificate_manager",
        name: "AWS Certificate Manager",
        description: "SSL/TLS証明書管理サービス。",
      },
      {
        key: "aws_chatbot",
        name: "AWS Chatbot",
        description: "チャットツール連携による運用支援。",
      },
      {
        key: "aws_cloud9",
        name: "AWS Cloud9",
        description: "クラウドベースのIDE。",
      },
      {
        key: "aws_cloudformation",
        name: "AWS CloudFormation",
        description: "インフラをコードで管理するツール。",
      },
      {
        key: "aws_cloudsearch",
        name: "AWS CloudSearch",
        description: "フルマネージド検索サービス。",
      },
      {
        key: "aws_cloudtrail",
        name: "AWS CloudTrail",
        description: "APIコールの監査ログサービス。",
      },
      {
        key: "aws_cloudwatch",
        name: "AWS CloudWatch",
        description: "リソースとアプリの監視サービス。",
      },
      {
        key: "aws_codebuild",
        name: "AWS CodeBuild",
        description: "ソースコードのビルドサービス。",
      },
      {
        key: "aws_codedeploy",
        name: "AWS CodeDeploy",
        description: "自動デプロイメントサービス。",
      },
      {
        key: "aws_codepipeline",
        name: "AWS CodePipeline",
        description: "CI/CDパイプラインサービス。",
      },
      {
        key: "aws_cognito",
        name: "AWS Cognito",
        description: "ユーザー認証管理サービス。",
      },
      {
        key: "aws_config",
        name: "AWS Config",
        description: "リソース設定の監査・管理サービス。",
      },
      {
        key: "aws_control_tower",
        name: "AWS Control Tower",
        description: "マルチアカウント管理サービス。",
      },
      {
        key: "aws_documentdb_with_mongodb_compatibility",
        name: "Amazon DocumentDB",
        description: "MongoDB互換のDBサービス。",
      },
      {
        key: "aws_elasticache",
        name: "Amazon ElastiCache",
        description: "インメモリキャッシュサービス。",
      },
      {
        key: "aws_elastic_beanstalk",
        name: "AWS Elastic Beanstalk",
        description: "簡単デプロイのPaaSサービス。",
      },
      {
        key: "aws_elastic_container_registry",
        name: "Amazon ECR",
        description: "コンテナイメージ管理サービス。",
      },
      {
        key: "aws_elastic_container_service",
        name: "Amazon ECS",
        description: "コンテナオーケストレーションサービス。",
      },
      {
        key: "aws_elastic_file_system",
        name: "Amazon EFS",
        description: "スケーラブルなファイルストレージ。",
      },
      {
        key: "aws_elastic_kubernetes_service",
        name: "Amazon EKS",
        description: "Kubernetesのマネージドサービス。",
      },
      {
        key: "aws_elastic_load_balancing",
        name: "AWS ELB",
        description: "負荷分散サービス。",
      },
      {
        key: "aws_emr",
        name: "Amazon EMR",
        description: "ビッグデータ処理プラットフォーム。",
      },
      {
        key: "aws_eventbridge",
        name: "AWS EventBridge",
        description: "イベントバスサービス。",
      },
      {
        key: "aws_fargate",
        name: "AWS Fargate",
        description: "サーバーレスコンテナ実行環境。",
      },
      {
        key: "aws_glue",
        name: "AWS Glue",
        description: "データ統合サービス。",
      },
      {
        key: "aws_guardduty",
        name: "Amazon GuardDuty",
        description: "脅威検出サービス。",
      },
      {
        key: "aws_identity_and_access_management",
        name: "AWS IAM",
        description: "アクセス管理サービス。",
      },
      {
        key: "aws_inspector",
        name: "AWS Inspector",
        description: "セキュリティ評価サービス。",
      },
      {
        key: "aws_key_management_service",
        name: "AWS KMS",
        description: "暗号鍵管理サービス。",
      },
      {
        key: "aws_kinesis",
        name: "AWS Kinesis",
        description: "リアルタイムデータストリーミングサービス。",
      },
      {
        key: "aws_opensearch_service",
        name: "Amazon OpenSearch",
        description: "検索と分析サービス。",
      },
      {
        key: "aws_opsworks",
        name: "AWS OpsWorks",
        description: "構成管理サービス。",
      },
      {
        key: "aws_organizations",
        name: "AWS Organizations",
        description: "マルチアカウント管理サービス。",
      },
      {
        key: "aws_quick_sight",
        name: "Amazon QuickSight",
        description: "BIとデータ可視化サービス。",
      },
      {
        key: "aws_red_hat_openshift_service_on_aws",
        name: "Red Hat OpenShift on AWS",
        description: "AWS上のOpenShiftサービス。",
      },
      {
        key: "aws_redshift",
        name: "Amazon Redshift",
        description: "クラウドデータウェアハウスサービス。",
      },
      {
        key: "aws_route_53",
        name: "Amazon Route 53",
        description: "DNSウェブサービス。",
      },
      {
        key: "aws_sagemaker",
        name: "Amazon SageMaker",
        description: "機械学習モデル構築支援サービス。",
      },
      {
        key: "aws_secrets_manager",
        name: "AWS Secrets Manager",
        description: "機密情報管理サービス。",
      },
      {
        key: "aws_security_hub",
        name: "AWS Security Hub",
        description: "セキュリティ統合管理サービス。",
      },
      {
        key: "aws_simple_email_service",
        name: "Amazon SES",
        description: "メール送信サービス。",
      },
      {
        key: "aws_simple_notification_service",
        name: "Amazon SNS",
        description: "通知サービス。",
      },
      {
        key: "aws_simple_queue_service",
        name: "Amazon SQS",
        description: "メッセージキューサービス。",
      },
      {
        key: "aws_single_signon",
        name: "AWS SSO",
        description: "シングルサインオン管理サービス。",
      },
      {
        key: "aws_step_functions",
        name: "AWS Step Functions",
        description: "分散アプリオーケストレーションサービス。",
      },
      {
        key: "aws_systems_manager",
        name: "AWS Systems Manager",
        description: "インフラ管理サービス。",
      },
      {
        key: "aws_translate",
        name: "Amazon Translate",
        description: "機械翻訳サービス。",
      },
      {
        key: "aws_waf",
        name: "AWS WAF",
        description: "ウェブアプリケーションファイアウォール。",
      },
      {
        key: "aws_workmail",
        name: "Amazon WorkMail",
        description: "エンタープライズ向けメールサービス。",
      },
    ],
  },

  // ──────────────────────────────
  // Microsoft Azure
  // ──────────────────────────────
  {
    name: "Azure",
    technologies: [
      {
        key: "azure_active_directory",
        name: "Azure Active Directory",
        description: "クラウドベースのアイデンティティ管理サービス。",
      },
      {
        key: "azure_ai_search",
        name: "Azure AI Search",
        description: "AIを活用した検索サービス。",
      },
      {
        key: "azure_application_gateway",
        name: "Azure Application Gateway",
        description: "アプリケーション向けロードバランサー。",
      },
      {
        key: "azure_application_insights",
        name: "Azure Application Insights",
        description: "アプリパフォーマンス監視ツール。",
      },
      {
        key: "azure_app_service",
        name: "Azure App Service",
        description: "ウェブアプリホスティングサービス。",
      },
      {
        key: "azure_blob_storage",
        name: "Azure Blob Storage",
        description: "非構造化データ向けオブジェクトストレージ。",
      },
      {
        key: "azure_container_instances",
        name: "Azure Container Instances",
        description: "コンテナの簡易デプロイサービス。",
      },
      {
        key: "azure_container_registry",
        name: "Azure Container Registry",
        description: "コンテナイメージ管理サービス。",
      },
      {
        key: "azure_cosmos_db",
        name: "Azure Cosmos DB",
        description: "グローバル分散型NoSQLデータベース。",
      },
      {
        key: "azure_database_for_postgresql",
        name: "Azure Database for PostgreSQL",
        description: "マネージドPostgreSQLサービス。",
      },
      {
        key: "azure_database_migration_service",
        name: "Azure Database Migration Service",
        description: "データベース移行ツール。",
      },
      {
        key: "azure_data_factory",
        name: "Azure Data Factory",
        description: "データ統合サービス。",
      },
      {
        key: "azure_devops",
        name: "Azure DevOps",
        description: "開発プロセス管理ツール。",
      },
      {
        key: "azure_firewall",
        name: "Azure Firewall",
        description: "クラウドファイアウォールサービス。",
      },
      {
        key: "azure_front_door",
        name: "Azure Front Door",
        description: "グローバルアプリアクセラレータ。",
      },
      {
        key: "azure_functions",
        name: "Azure Functions",
        description: "サーバーレスコード実行サービス。",
      },
      {
        key: "azure_key_vault",
        name: "Azure Key Vault",
        description: "秘密情報管理サービス。",
      },
      {
        key: "azure_logic_apps",
        name: "Azure Logic Apps",
        description: "ワークフロー自動化サービス。",
      },
      {
        key: "azure_monitor",
        name: "Azure Monitor",
        description: "クラウドリソース監視サービス。",
      },
      {
        key: "azure_openai_service",
        name: "Azure OpenAI Service",
        description: "OpenAI API利用サービス。",
      },
      {
        key: "azure_sql_database",
        name: "Azure SQL Database",
        description: "フルマネージドRDBMSサービス。",
      },
      {
        key: "azure_static_web_apps",
        name: "Azure Static Web Apps",
        description: "静的サイトホスティングサービス。",
      },
      {
        key: "azure_traffic_manager",
        name: "Azure Traffic Manager",
        description: "DNSベースのトラフィック分散サービス。",
      },
    ],
  },

  // ──────────────────────────────
  // Google Cloud Platform (GCP)
  // ──────────────────────────────
  {
    name: "GCP",
    technologies: [
      {
        key: "gcp_firebase",
        name: "Firebase",
        description: "モバイル・ウェブアプリのバックエンドプラットフォーム。",
      },
      {
        key: "gcp_firestore",
        name: "Firestore",
        description: "スケーラブルなNoSQLドキュメントDB。",
      },
      {
        key: "gcp_bigquery",
        name: "BigQuery",
        description: "大規模データ分析向けのデータウェアハウス。",
      },
      {
        key: "gcp_compute_engine",
        name: "Compute Engine",
        description: "スケーラブルな仮想マシンサービス。",
      },
      {
        key: "gcp_app_engine",
        name: "App Engine",
        description: "サーバーレスアプリケーションプラットフォーム。",
      },
      {
        key: "gcp_cloud_storage",
        name: "Cloud Storage",
        description: "統合オブジェクトストレージサービス。",
      },
      {
        key: "gcp_ai_platform",
        name: "AI Platform",
        description: "機械学習モデルのトレーニング・デプロイ支援。",
      },
      {
        key: "gcp_anthos",
        name: "Anthos",
        description: "マルチクラウド管理プラットフォーム。",
      },
      {
        key: "gcp_anthos_service_mesh",
        name: "Anthos Service Mesh",
        description: "サービスメッシュ管理ツール。",
      },
      {
        key: "gcp_artifact_registry",
        name: "Artifact Registry",
        description: "パッケージ管理サービス。",
      },
      {
        key: "gcp_certificate_manager",
        name: "Certificate Manager",
        description: "SSL/TLS証明書管理サービス。",
      },
      {
        key: "gcp_cloud_armor",
        name: "Cloud Armor",
        description: "DDoS対策とセキュリティサービス。",
      },
      {
        key: "gcp_cloud_build",
        name: "Cloud Build",
        description: "CI/CD向けのビルドサービス。",
      },
      {
        key: "gcp_cloud_cdn",
        name: "Cloud CDN",
        description: "コンテンツ配信ネットワークサービス。",
      },
      {
        key: "gcp_cloud_composer",
        name: "Cloud Composer",
        description: "ワークフローオーケストレーションサービス。",
      },
      {
        key: "gcp_cloud_dataflow",
        name: "Cloud Dataflow",
        description: "データ処理サービス。",
      },
      {
        key: "gcp_cloud_data_fusion",
        name: "Cloud Data Fusion",
        description: "データ統合サービス。",
      },
      {
        key: "gcp_cloud_datastore_cloud_bigtable",
        name: "Cloud Datastore/Bigtable",
        description: "スケーラブルなNoSQLデータベース。",
      },
      {
        key: "gcp_cloud_dns",
        name: "Cloud DNS",
        description: "クラウドベースのDNSサービス。",
      },
      {
        key: "gcp_cloud_functions",
        name: "Cloud Functions",
        description: "サーバーレスコード実行サービス。",
      },
      {
        key: "gcp_cloud_identity",
        name: "Cloud Identity",
        description: "ユーザー・デバイス管理サービス。",
      },
      {
        key: "gcp_cloud_ids",
        name: "Cloud IDS",
        description: "侵入検知システム。",
      },
      {
        key: "gcp_cloud_key_management_service",
        name: "Cloud KMS",
        description: "暗号鍵管理サービス。",
      },
      {
        key: "gcp_cloud_logging",
        name: "Cloud Logging",
        description: "ログ管理サービス。",
      },
      {
        key: "gcp_cloud_monitoring",
        name: "Cloud Monitoring",
        description: "パフォーマンス監視サービス。",
      },
      {
        key: "gcp_cloud_natural_language",
        name: "Cloud Natural Language",
        description: "自然言語処理サービス。",
      },
      {
        key: "gcp_cloud_pub_sub",
        name: "Cloud Pub/Sub",
        description: "メッセージングサービス。",
      },
      {
        key: "gcp_cloud_run",
        name: "Cloud Run",
        description: "コンテナのサーバーレス実行環境。",
      },
      {
        key: "gcp_cloud_scheduler",
        name: "Cloud Scheduler",
        description: "ジョブスケジューリングサービス。",
      },
      {
        key: "gcp_cloud_spanner",
        name: "Cloud Spanner",
        description: "グローバル分散型RDBMSサービス。",
      },
      {
        key: "gcp_cloud_tasks",
        name: "Cloud Tasks",
        description: "タスクキューサービス。",
      },
      {
        key: "gcp_cloud_trace",
        name: "Cloud Trace",
        description: "分散トレーシングサービス。",
      },
      {
        key: "gcp_dataproc",
        name: "Dataproc",
        description: "クラスタベースのデータ処理サービス。",
      },
      {
        key: "gcp_data_studio",
        name: "Data Studio",
        description: "データ可視化ツール。",
      },
      {
        key: "gcp_kubernetes_engine",
        name: "Kubernetes Engine",
        description: "Kubernetesクラスタ管理サービス。",
      },
      {
        key: "gcp_looker",
        name: "Looker",
        description: "データ探索・BIツール。",
      },
      {
        key: "gcp_maps_platform",
        name: "Maps Platform",
        description: "地図・位置情報サービス。",
      },
      {
        key: "gcp_memorystore",
        name: "Memorystore",
        description: "マネージドインメモリストア。",
      },
      {
        key: "gcp_memorystore_for_redis",
        name: "Memorystore for Redis",
        description: "Redis互換のマネージドサービス。",
      },
      {
        key: "gcp_stackdriver",
        name: "Stackdriver",
        description: "旧称のモニタリング・ログ管理サービス。",
      },
      {
        key: "gcp_vertex_ai",
        name: "Vertex AI",
        description: "機械学習統合プラットフォーム。",
      },
      {
        key: "gcp_vision_ai",
        name: "Vision AI",
        description: "画像認識・解析サービス。",
      },
      {
        key: "gcp_workflow",
        name: "Workflows",
        description: "サーバーレスワークフローオーケストレーション。",
      },
      {
        key: "google_apps_script",
        name: "Google Apps Script",
        description: "Google Workspace向け自動化スクリプト。",
      },
      {
        key: "google_colab",
        name: "Google Colab",
        description: "クラウド上のPython実行環境。",
      },


      {
        key: "google_tag_manager",
        name: "Google Tag Manager",
        description: "タグ管理システム。",
      },

      {
        key: "google_cloud_observability",
        name: "Google Cloud Observability",
        description: "クラウドリソースの可観測性ツール。",
      },
    ],
  },

  // ──────────────────────────────
  // その他のクラウドサービス
  // ──────────────────────────────
  {
    name: "Cloud",
    technologies: [
      {
        key: "vercel",
        name: "Vercel",
        description:
          "フロントエンド向けデプロイ・ホスティングプラットフォーム。",
      },
      {
        key: "heroku",
        name: "Heroku",
        description: "簡易デプロイが可能なPaaS。",
      },
      {
        key: "netlify",
        name: "Netlify",
        description: "静的サイトとサーバーレス機能のホスティングサービス。",
      },
      {
        key: "railway",
        name: "Railway",
        description: "開発者向けの簡単なインフラプラットフォーム。",
      },
      {
        key: "render",
        name: "Render",
        description: "クラウドアプリケーションプラットフォーム。",
      },
      {
        key: "hetzner",
        name: "Hetzner",
        description: "ヨーロッパベースのクラウドVPSプロバイダー。",
      },
      {
        key: "cloudflare",
        name: "Cloudflare",
        description: "ウェブパフォーマンス・セキュリティ向上のCDNサービス。",
      },
      {
        key: "akamai",
        name: "Akamai",
        description: "エンタープライズ向けCDN・クラウドセキュリティサービス。",
      },
      {
        key: "fastly",
        name: "Fastly",
        description: "リアルタイムCDNおよびエッジコンピューティングサービス。",
      },
      {
        key: "openstack",
        name: "OpenStack",
        description:
          "オープンソースのクラウドコンピューティングプラットフォーム。",
      },
      {
        key: "snowflake",
        name: "Snowflake",
        description: "クラウドデータウェアハウス。",
      },
      {
        key: "planet_scale",
        name: "PlanetScale",
        description: "クラウドネイティブMySQLデータベース。",
      },
      {
        key: "supabase",
        name: "Supabase",
        description: "オープンソースのFirebase代替。",
      },
      {
        key: "fly_io",
        name: "Fly.io",
        description: "開発者向けのグローバルアプリデプロイメントプラットフォーム。",
      },
      {
        key: "neon",
        name: "Neon",
        description: "サーバーレスPostgreSQL（データベースブランチング機能付き）。",
      },
      {
        key: "turso",
        name: "Turso",
        description: "エッジホスト分散SQLiteデータベース。",
      },
      {
        key: "faunadb",
        name: "FaunaDB",
        description: "グローバル分散サーバーレスNoSQLデータベース。",
      },
    ],
  },

  // ──────────────────────────────
  // DevOpsとCI/CDツール
  // ──────────────────────────────
  {
    name: "DevOps",
    technologies: [
      {
        key: "docker",
        name: "Docker",
        description: "コンテナ化プラットフォーム。",
      },
      {
        key: "kubernetes",
        name: "Kubernetes",
        description: "コンテナオーケストレーションツール。",
      },
      { key: "jenkins", name: "Jenkins", description: "自動化サーバー。" },
      {
        key: "github_actions",
        name: "GitHub Actions",
        description: "GitHub統合のCI/CDツール。",
      },
      {
        key: "circleci",
        name: "CircleCI",
        description: "クラウドベースCI/CDプラットフォーム。",
      },
      {
        key: "bitbucket",
        name: "Bitbucket",
        description: "Gitリポジトリ管理サービス。",
      },
      {
        key: "gitlab",
        name: "GitLab",
        description: "Gitリポジトリ管理とCI/CDツール。",
      },
      {
        key: "gitlab_runner",
        name: "GitLab Runner",
        description: "GitLab用CI/CDランナー。",
      },
      {
        key: "appveyor",
        name: "AppVeyor",
        description: "Windows向けCIサービス。",
      },
      {
        key: "bitrise",
        name: "Bitrise",
        description: "モバイル向けCI/CDサービス。",
      },
      {
        key: "buildkite",
        name: "Buildkite",
        description: "パイプライン自動化プラットフォーム。",
      },
      {
        key: "argo",
        name: "Argo",
        description: "Kubernetes上で動作するCI/CDツール。",
      },
      {
        key: "terraform",
        name: "Terraform",
        description: "インフラをコード化するツール。",
      },
      {
        key: "terraform_cloud",
        name: "Terraform Cloud",
        description: "Terraformのクラウドサービス。",
      },
      {
        key: "terragrunt",
        name: "Terragrunt",
        description: "Terraformの設定を簡略化するラッパー。",
      },
      {
        key: "spinnaker",
        name: "Spinnaker",
        description: "マルチクラウド対応の継続的デリバリープラットフォーム。",
      },
      {
        key: "packer",
        name: "Packer",
        description: "マシンイメージ作成ツール。",
      },
      {
        key: "testcontainers",
        name: "Testcontainers",
        description: "コンテナを利用したテスト環境構築ツール。",
      },
      {
        key: "testfixtures",
        name: "TestFixtures",
        description: "テストデータ管理ツール。",
      },
      { key: "testrail", name: "TestRail", description: "テスト管理ツール。" },
    ],
  },

  // ──────────────────────────────
  // テストフレームワーク
  // ──────────────────────────────
  {
    name: "Testing",
    technologies: [
      {
        key: "jest",
        name: "Jest",
        description: "JavaScript向けテストフレームワーク。",
      },
      {
        key: "mocha",
        name: "Mocha",
        description: "Node.js向けテストフレームワーク。",
      },
      {
        key: "junit",
        name: "JUnit",
        description: "Java向けユニットテストフレームワーク。",
      },
      {
        key: "selenium",
        name: "Selenium",
        description: "ブラウザ自動化テストツール。",
      },
      {
        key: "cypress",
        name: "Cypress",
        description: "エンドツーエンドテストツール。",
      },
      {
        key: "phpunit",
        name: "PHPUnit",
        description: "PHP向けテストフレームワーク。",
      },
      {
        key: "pytest",
        name: "pytest",
        description: "Python向けテストフレームワーク。",
      },
      {
        key: "rspec",
        name: "RSpec",
        description: "Ruby向けテストフレームワーク。",
      },
    ],
  },


  // ──────────────────────────────
  // セキュリティと認証
  // ──────────────────────────────
  {
    name: "Security",
    technologies: [
      {
        key: "1password",
        name: "1Password",
        description: "パスワード管理ツール。",
      },
      {
        key: "auth0",
        name: "Auth0",
        description: "認証・認可プラットフォーム。",
      },
      {
        key: "okta",
        name: "Okta",
        description: "アイデンティティ管理サービス。",
      },
      {
        key: "burp_suite",
        name: "Burp Suite",
        description: "ウェブアプリケーションのセキュリティテストツール。",
      },
      { key: "snyk", name: "Snyk", description: "脆弱性検出ツール。" },
      {
        key: "trivy",
        name: "Trivy",
        description: "コンテナイメージの脆弱性スキャナー。",
      },
      {
        key: "wazuh",
        name: "Wazuh",
        description: "セキュリティ監視・脅威検出プラットフォーム。",
      },
      {
        key: "socket_security",
        name: "Socket Security",
        description: "通信セキュリティツール。",
      },
      { key: "clerk", name: "Clerk", description: "認証管理ツール。" },
    ],
  },

 
  // ──────────────────────────────
  // ブロックチェーンとスマートコントラクト
  // ──────────────────────────────
  {
    name: "Blockchain",
    technologies: [
      {
        key: "ethereum",
        name: "Ethereum",
        description: "分散型アプリ構築用ブロックチェーンプラットフォーム。",
      },
      {
        key: "polygon",
        name: "Polygon",
        description: "Ethereum互換のスケーラビリティプラットフォーム。",
      },
      {
        key: "alchemy",
        name: "Alchemy",
        description: "ブロックチェーン開発プラットフォーム。",
      },
    ],
  },

  // ──────────────────────────────
  // その他のツールとテクノロジー
  // ──────────────────────────────
  {
    name: "Other",
    technologies: [
      {
        key: "webpack",
        name: "Webpack",
        description: "JavaScriptモジュールバンドラ。",
      },
      {
        key: "babel",
        name: "Babel",
        description: "次世代JavaScriptを変換するコンパイラ。",
      },
      { key: "eslint", name: "ESLint", description: "静的コード解析ツール。" },
      {
        key: "prettier",
        name: "Prettier",
        description: "コードフォーマッタ。",
      },
      {
        key: "storybook",
        name: "Storybook",
        description: "UIコンポーネント開発環境。",
      },
      {
        key: "coffeescript",
        name: "CoffeeScript",
        description: "JavaScriptに変換される簡潔な言語。",
      },
      {
        key: "closure_library",
        name: "Closure Library",
        description: "Google提供のJavaScriptライブラリ群。",
      },
      { key: "mixmax", name: "Mixmax", description: "メール効率化ツール。" },
      {
        key: "drawio",
        name: "diagrams.net",
        description: "ダイアグラム作成ツール（旧draw.io）。",
      },
      {
        key: "visual_basic_net",
        name: "Visual Basic .NET",
        description: "Microsoft製のイベント駆動型言語。",
      },
      {
        key: "vs_code",
        name: "VS Code",
        description: "軽量なソースコードエディタ。",
      },
      {
        key: "xctest",
        name: "XCTest",
        description: "iOS/macOS向けテストフレームワーク。",
      },
      {
        key: "xcuitest",
        name: "XCUITest",
        description: "iOS用UIテストフレームワーク。",
      },
      { key: "vagrant", name: "Vagrant", description: "仮想環境構築ツール。" },
      {
        key: "unity",
        name: "Unity",
        description: "ゲーム開発プラットフォーム。",
      },
      {
        key: "gitbucket",
        name: "GitBucket",
        description: "GitHubに似たリポジトリ管理システム。",
      },
      {
        key: "github_copilot",
        name: "GitHub Copilot",
        description: "AIコード補完ツール。",
      },
      {
        key: "github_pages",
        name: "GitHub Pages",
        description: "静的サイトホスティングサービス。",
      },
      {
        key: "apache_cordova",
        name: "Apache Cordova",
        description: "クロスプラットフォームモバイル開発フレームワーク。",
      },

      {
        key: "algolia",
        name: "Algolia",
        description: "高速な検索APIプラットフォーム。",
      },
      {
        key: "airtable",
        name: "Airtable",
        description: "スプレッドシートとDBのハイブリッドツール。",
      },
      {
        key: "akka_http",
        name: "Akka HTTP",
        description: "Scala向け非同期HTTPツールキット。",
      },
      {
        key: "akka_streams",
        name: "Akka Streams",
        description: "リアクティブストリーム処理ライブラリ。",
      },
      {
        key: "adjust",
        name: "Adjust",
        description: "モバイルアプリのアトリビューション分析ツール。",
      },
      {
        key: "apollo_android",
        name: "Apollo Android",
        description: "Android向けGraphQLクライアント。",
      },
      {
        key: "apollo_client",
        name: "Apollo Client",
        description: "GraphQLクライアントライブラリ。",
      },
      {
        key: "apollo_server",
        name: "Apollo Server",
        description: "GraphQLサーバーライブラリ。",
      },
      {
        key: "armeria",
        name: "Armeria",
        description: "Java向け非同期RPCフレームワーク。",
      },
      {
        key: "asp_net",
        name: "ASP.NET",
        description: "Microsoft製ウェブフレームワーク。",
      },
      {
        key: "assert_j_db",
        name: "AssertJ-DB",
        description: "データベーステスト用ライブラリ。",
      },
      {
        key: "atlassian_statuspage",
        name: "Atlassian Statuspage",
        description: "サービス稼働状況公開ツール。",
      },
      {
        key: "autify",
        name: "Autify",
        description: "自動化ウェブテストツール。",
      },
      { key: "bazel", name: "Bazel", description: "Google製ビルドツール。" },
      {
        key: "bearsunday",
        name: "Bearsunday",
        description: "（詳細は要確認）",
      },
      {
        key: "brakeman",
        name: "Brakeman",
        description: "Ruby on Rails用静的解析セキュリティツール。",
      },

      {
        key: "buefy",
        name: "Buefy",
        description: "Vue.js用軽量UIコンポーネントライブラリ。",
      },
      {
        key: "bufbuild",
        name: "Buf",
        description: "Protocol Buffers向けツールチェーン。",
      },
      {
        key: "buf_schema_registry",
        name: "Buf Schema Registry",
        description: "Protobufスキーマ管理ツール。",
      },
      {
        key: "bugsnag",
        name: "Bugsnag",
        description: "エラーモニタリングツール。",
      },

      {
        key: "celery",
        name: "Celery",
        description: "Pythonの分散タスクキュー。",
      },
      {
        key: "chatwork",
        name: "Chatwork",
        description: "ビジネス向けチャットツール。",
      },
      { key: "chef", name: "Chef", description: "インフラ自動化ツール。" },
      {
        key: "chromatic",
        name: "Chromatic",
        description: "Storybook向けビジュアルテストツール。",
      },
      { key: "clerk", name: "Clerk", description: "認証管理ツール。" },
      {
        key: "clickhouse",
        name: "ClickHouse",
        description: "高速なOLAP向けデータベース。",
      },
      {
        key: "connect",
        name: "Connect",
        description: "認証・API連携プラットフォーム（詳細要検討）。",
      },
      {
        key: "consul",
        name: "Consul",
        description: "サービスディスカバリ・構成管理ツール。",
      },
      {
        key: "containerd",
        name: "containerd",
        description: "コンテナランタイム。",
      },
      {
        key: "contentful",
        name: "Contentful",
        description: "ヘッドレスCMSプラットフォーム。",
      },
      {
        key: "corepack",
        name: "Corepack",
        description: "Node.jsパッケージマネージャーラッパー。",
      },
      {
        key: "cosmic_js",
        name: "Cosmic JS",
        description: "ヘッドレスCMSプラットフォーム。",
      },
      {
        key: "crashlytics",
        name: "Crashlytics",
        description: "モバイルクラッシュレポートツール。",
      },
      {
        key: "crossplane",
        name: "Crossplane",
        description: "クラウドリソース管理ツール。",
      },
      { key: "cucumber", name: "Cucumber", description: "BDDテストツール。" },
      {
        key: "data_portal",
        name: "Data Portal",
        description: "データ可視化プラットフォーム（詳細要検討）。",
      },
      {
        key: "db_setup",
        name: "DB Setup",
        description: "データベース構築ツール。",
      },
      {
        key: "dependabot",
        name: "Dependabot",
        description: "依存関係自動更新ツール。",
      },
      {
        key: "deployer",
        name: "Deployer",
        description: "デプロイ自動化ツール。",
      },
      {
        key: "detekt",
        name: "Detekt",
        description: "Kotlin向け静的解析ツール。",
      },
      { key: "diesel", name: "Diesel", description: "Rust向けORMライブラリ。" },
      { key: "digdag", name: "Digdag", description: "ワークフローエンジン。" },

      {
        key: "dockle",
        name: "Dockle",
        description: "Dockerイメージセキュリティ評価ツール。",
      },
      {
        key: "docusign",
        name: "DocuSign",
        description: "電子署名プラットフォーム。",
      },
      {
        key: "domo",
        name: "Domo",
        description: "ビジネスインテリジェンスプラットフォーム。",
      },
      {
        key: "dovecot",
        name: "Dovecot",
        description: "メールサーバーソフトウェア。",
      },
      {
        key: "electron",
        name: "Electron",
        description:
          "クロスプラットフォームデスクトップアプリ開発フレームワーク。",
      },
      {
        key: "elm",
        name: "Elm",
        description: "関数型フロントエンドプログラミング言語。",
      },
      {
        key: "embulk",
        name: "Embulk",
        description: "データバルクロードツール。",
      },
      {
        key: "ent",
        name: "Ent",
        description: "Go向けエンティティフレームワーク。",
      },
      { key: "envoy", name: "Envoy", description: "高性能プロキシサーバー。" },
      {
        key: "esa",
        name: "esa",
        description: "チーム向けナレッジ共有ツール。",
      },
      {
        key: "exposed",
        name: "Exposed",
        description: "Kotlin向けSQLライブラリ。",
      },
      {
        key: "falco",
        name: "Falco",
        description: "コンテナセキュリティモニタリングツール。",
      },
      {
        key: "fastlane",
        name: "Fastlane",
        description: "モバイルアプリ自動デプロイツール。",
      },
      {
        key: "figjam",
        name: "FigJam",
        description: "オンラインホワイトボードツール。",
      },
      {
        key: "filebeast",
        name: "FileBeast",
        description: "大容量ファイル転送サービス。",
      },
      { key: "fivetran", name: "Fivetran", description: "データ統合ツール。" },
      { key: "fluentbit", name: "Fluent Bit", description: "ログ収集ツール。" },
      {
        key: "fluentd",
        name: "Fluentd",
        description: "ログ収集・転送ツール。",
      },
      {
        key: "flutterweb",
        name: "Flutter Web",
        description: "Flutterを用いたウェブアプリ開発。",
      },
      {
        key: "fondesk",
        name: "Fondesk",
        description: "クラウド型デスクトップサービス（詳細要検討）。",
      },
      {
        key: "font_awesome",
        name: "Font Awesome",
        description: "アイコンフォントとCSSツールキット。",
      },
      {
        key: "formrun",
        name: "Formrun",
        description: "フォーム作成・管理ツール。",
      },
      {
        key: "fosite",
        name: "Fosite",
        description: "Go向けOAuth2フレームワーク。",
      },

      {
        key: "gauge",
        name: "Gauge",
        description: "オープンソースのテスト自動化ツール。",
      },
      {
        key: "geekbot",
        name: "Geekbot",
        description: "自動スタンドアップミーティングツール。",
      },
      {
        key: "gitbucket",
        name: "GitBucket",
        description: "GitHubに似たリポジトリ管理システム。",
      },
      {
        key: "google_apps_script",
        name: "Google Apps Script",
        description: "Google自動化スクリプト。",
      },
      {
        key: "gorilla",
        name: "Gorilla",
        description: "Go向けウェブツールキット。",
      },
      { key: "gorm", name: "GORM", description: "Go用ORMライブラリ。" },
      { key: "gradle", name: "Gradle", description: "ビルド自動化ツール。" },
      {
        key: "graphql",
        name: "GraphQL",
        description: "クエリ言語およびランタイム。",
      },
      { key: "grpc", name: "gRPC", description: "高性能RPCフレームワーク。" },
      {
        key: "haproxy",
        name: "HAProxy",
        description: "高性能ロードバランサー。",
      },
      { key: "hasura", name: "Hasura", description: "GraphQLエンジン。" },
      {
        key: "helm",
        name: "Helm",
        description: "Kubernetes用パッケージマネージャー。",
      },
      {
        key: "holistics",
        name: "Holistics",
        description: "データレポート・BIツール。",
      },

      {
        key: "hugo",
        name: "Hugo",
        description: "高速な静的サイトジェネレーター。",
      },
      {
        key: "i18next",
        name: "i18next",
        description: "国際化対応ライブラリ。",
      },
      {
        key: "imgix",
        name: "Imgix",
        description: "画像処理・最適化サービス。",
      },

      {
        key: "istio",
        name: "Istio",
        description: "サービスメッシュプラットフォーム。",
      },
      {
        key: "jaeger",
        name: "Jaeger",
        description: "分散トレーシングシステム。",
      },
      { key: "jamf", name: "Jamf", description: "Appleデバイス管理ツール。" },
      {
        key: "jest",
        name: "Jest",
        description: "JavaScript向けテストフレームワーク。",
      },
      {
        key: "jetpack",
        name: "Jetpack",
        description: "WordPress向けプラグイン集。",
      },
      {
        key: "jslint",
        name: "JSLint",
        description: "JavaScript静的解析ツール。",
      },
      {
        key: "jupyter_notebook",
        name: "Jupyter Notebook",
        description: "対話型データ解析環境。",
      },
      { key: "k6", name: "k6", description: "パフォーマンステストツール。" },
      {
        key: "keras",
        name: "Keras",
        description: "ニューラルネットワークAPI。",
      },
      {
        key: "kibana",
        name: "Kibana",
        description: "Elasticsearch用可視化ツール。",
      },
      {
        key: "kibela",
        name: "Kibela",
        description: "チーム向けナレッジ共有ツール。",
      },

      {
        key: "kinsta",
        name: "Kinsta",
        description: "マネージドWordPressホスティング。",
      },

      {
        key: "koin",
        name: "Koin",
        description: "Kotlin用依存性注入ライブラリ。",
      },
      {
        key: "kong",
        name: "Kong",
        description: "APIゲートウェイ・マイクロサービス管理。",
      },
      {
        key: "kotest",
        name: "Kotest",
        description: "Kotlin用テストフレームワーク。",
      },
      {
        key: "ktor",
        name: "Ktor",
        description: "Kotlin向け非同期ウェブフレームワーク。",
      },
      {
        key: "kubeflow",
        name: "Kubeflow",
        description: "Kubernetes上の機械学習ワークフロー管理。",
      },
      {
        key: "kustomize",
        name: "Kustomize",
        description: "Kubernetesリソースカスタマイズツール。",
      },
      { key: "liquid", name: "Liquid", description: "テンプレート言語。" },
      {
        key: "litespeed",
        name: "LiteSpeed",
        description: "高速ウェブサーバー。",
      },
      { key: "locust", name: "Locust", description: "負荷テストツール。" },
      {
        key: "logrocket",
        name: "LogRocket",
        description: "フロントエンドエラーログ解析ツール。",
      },
      {
        key: "lucidchart",
        name: "Lucidchart",
        description: "オンラインダイアグラム作成ツール。",
      },
      {
        key: "lxd",
        name: "LXD",
        description: "コンテナ仮想化プラットフォーム。",
      },
      {
        key: "mabl",
        name: "Mabl",
        description: "自動化テストプラットフォーム。",
      },
      {
        key: "mackerel",
        name: "Mackerel",
        description: "サーバー監視ツール。",
      },
      {
        key: "magicpod",
        name: "MagicPod",
        description: "モバイル自動テストツール。",
      },

      {
        key: "makefile",
        name: "Makefile",
        description: "ビルド自動化用スクリプト。",
      },

      {
        key: "mattermost",
        name: "Mattermost",
        description: "セルフホスト型チャットツール。",
      },
      {
        key: "maxwell",
        name: "Maxwell",
        description: "MySQL変更データキャプチャツール。",
      },
      {
        key: "memcached",
        name: "Memcached",
        description: "分散メモリキャッシュシステム。",
      },
      {
        key: "meraki",
        name: "Meraki",
        description: "ネットワーク管理プラットフォーム。",
      },
      {
        key: "metabase",
        name: "Metabase",
        description: "オープンソースBIツール。",
      },



      {
        key: "mitamae",
        name: "Mitamae",
        description: "サーバー構成管理ツール。",
      },
      {
        key: "mixpanel",
        name: "Mixpanel",
        description: "ユーザー行動分析ツール。",
      },
      {
        key: "mock_service_worker",
        name: "Mock Service Worker",
        description: "APIモックツール。",
      },
      {
        key: "mongoose",
        name: "Mongoose",
        description: "MongoDB用ORMライブラリ。",
      },
      {
        key: "my_batis",
        name: "MyBatis",
        description: "Java向けデータベースマッピングフレームワーク。",
      },
      {
        key: "nats",
        name: "NATS",
        description: "クラウドネイティブメッセージングシステム。",
      },
      { key: "neo4j", name: "Neo4j", description: "グラフDB管理システム。" },
      {
        key: "net_framework",
        name: ".NET Framework",
        description: "Microsoftのアプリケーションフレームワーク。",
      },
      {
        key: "okta_customer_identity_cloud",
        name: "Okta Customer Identity Cloud",
        description: "顧客向けID管理サービス。",
      },
      {
        key: "openssh",
        name: "OpenSSH",
        description: "セキュアなリモートログインツール。",
      },
      {
        key: "opentelemetry",
        name: "OpenTelemetry",
        description: "分散トレーシング・メトリクス標準。",
      },
      {
        key: "opsgenie",
        name: "Opsgenie",
        description: "アラート管理ツール。",
      },
      {
        key: "optuna",
        name: "Optuna",
        description: "ハイパーパラメータ最適化ライブラリ。",
      },
      {
        key: "pagerduty",
        name: "PagerDuty",
        description: "インシデント管理ツール。",
      },
      {
        key: "pardot",
        name: "Pardot",
        description: "B2Bマーケティング自動化ツール。",
      },
      {
        key: "passenger",
        name: "Phusion Passenger",
        description: "Ruby向けウェブサーバー。",
      },
      {
        key: "percy",
        name: "Percy",
        description: "ビジュアルリグレッションテストツール。",
      },
      {
        key: "pingdom",
        name: "Pingdom",
        description: "ウェブサイト監視ツール。",
      },
      {
        key: "pinia",
        name: "Pinia",
        description: "Vue.js用状態管理ライブラリ。",
      },
      {
        key: "play",
        name: "Play Framework",
        description: "Scala/Java向けウェブフレームワーク。",
      },
      {
        key: "playwright",
        name: "Playwright",
        description: "ブラウザ自動化テストツール。",
      },
      {
        key: "pnpm",
        name: "pnpm",
        description: "高速なNode.jsパッケージマネージャー。",
      },
      {
        key: "polyaxon",
        name: "Polyaxon",
        description: "機械学習ライフサイクル管理ツール。",
      },
      {
        key: "proftpd",
        name: "ProFTPD",
        description: "FTPサーバーソフトウェア。",
      },
      {
        key: "prophet",
        name: "Prophet",
        description: "時系列予測ライブラリ（Facebook製）。",
      },
      {
        key: "prosemirror",
        name: "ProseMirror",
        description: "リッチテキストエディタライブラリ。",
      },
      {
        key: "protocol_buffers",
        name: "Protocol Buffers",
        description: "Google製データシリアライゼーションフォーマット。",
      },
      {
        key: "puma",
        name: "Puma",
        description: "Ruby向け高速ウェブサーバー。",
      },
      { key: "puppet", name: "Puppet", description: "インフラ自動化ツール。" },
      {
        key: "puppeteer",
        name: "Puppeteer",
        description: "ヘッドレスChrome操作ツール。",
      },
      { key: "qase", name: "Qase", description: "テスト管理ツール。" },
      {
        key: "quick",
        name: "Quick",
        description: "iOS向けテストフレームワーク。",
      },
      {
        key: "react_hook_form",
        name: "React Hook Form",
        description: "React用フォーム管理ライブラリ。",
      },
      {
        key: "react_query",
        name: "React Query",
        description: "サーバーステート管理ライブラリ。",
      },
      {
        key: "react_testing_library",
        name: "React Testing Library",
        description: "Reactコンポーネントテストツール。",
      },
      {
        key: "redash",
        name: "Redash",
        description: "データ可視化・クエリツール。",
      },

      {
        key: "relay",
        name: "Relay",
        description: "GraphQLクライアントライブラリ。",
      },
      {
        key: "renovate",
        name: "Renovate",
        description: "依存関係自動更新ツール。",
      },
      { key: "repro", name: "Repro", description: "ユーザー行動分析ツール。" },
      {
        key: "reviewdog",
        name: "Reviewdog",
        description: "コードレビュー自動化ツール。",
      },
      { key: "riotjs", name: "Riot.js", description: "軽量なUIライブラリ。" },
      {
        key: "rollbar",
        name: "Rollbar",
        description: "エラートラッキングツール。",
      },

      { key: "sbt", name: "SBT", description: "Scala向けビルドツール。" },
      {
        key: "scout_apm",
        name: "Scout APM",
        description: "アプリパフォーマンス監視ツール。",
      },
      {
        key: "scrapy",
        name: "Scrapy",
        description: "Python向けウェブスクレイピングフレームワーク。",
      },
      {
        key: "segment",
        name: "Segment",
        description: "顧客データ統合プラットフォーム。",
      },
      {
        key: "selenide",
        name: "Selenide",
        description: "ブラウザテストライブラリ。",
      },
      {
        key: "sendgrid",
        name: "SendGrid",
        description: "メール配信サービス。",
      },
      {
        key: "sentry",
        name: "Sentry",
        description: "エラーモニタリングツール。",
      },
      {
        key: "serverless",
        name: "Serverless Framework",
        description: "サーバーレスアプリ管理ツール。",
      },
      {
        key: "sidekiq",
        name: "Sidekiq",
        description: "Ruby向けバックグラウンドジョブ処理ツール。",
      },
      {
        key: "slate_js",
        name: "Slate.js",
        description: "カスタマイズ可能なリッチテキストエディタライブラリ。",
      },
      {
        key: "slim",
        name: "Slim",
        description: "Ruby向けテンプレートエンジン。",
      },
      {
        key: "sonarqube",
        name: "SonarQube",
        description: "コード品質管理ツール。",
      },
      {
        key: "spring_batch",
        name: "Spring Batch",
        description: "Java向けバッチ処理フレームワーク。",
      },
      {
        key: "sqlalchemy",
        name: "SQLAlchemy",
        description: "Python向けORMライブラリ。",
      },
      { key: "sqlboiler", name: "SQLBoiler", description: "Go向けORMツール。" },
      {
        key: "sqlc",
        name: "sqlc",
        description: "SQLから型安全なコード生成ツール。",
      },
      {
        key: "sqlserver",
        name: "SQL Server",
        description: "Microsoftのリレーショナルデータベース。",
      },
      {
        key: "statuspageio",
        name: "Statuspage",
        description: "サービス稼働状況公開ツール。",
      },
      {
        key: "stf",
        name: "STF",
        description: "スマートフォン遠隔操作ツール。",
      },
      {
        key: "streamlit",
        name: "Streamlit",
        description: "Python向けデータアプリ作成ライブラリ。",
      },
      {
        key: "streamyard",
        name: "StreamYard",
        description: "ライブストリーミングプラットフォーム。",
      },
      {
        key: "stripe",
        name: "Stripe",
        description: "オンライン決済プラットフォーム。",
      },
      {
        key: "studio",
        name: "Studio",
        description: "コラボレーションツール（詳細要検討）。",
      },
      {
        key: "superset",
        name: "Apache Superset",
        description: "データ探索・可視化ツール。",
      },
      {
        key: "swagger",
        name: "Swagger",
        description: "API設計・ドキュメントツール。",
      },
      { key: "swc", name: "SWC", description: "高速なJS/TSコンパイラ。" },
      {
        key: "swr",
        name: "SWR",
        description: "データフェッチングライブラリ。",
      },
      { key: "tableau", name: "Tableau", description: "データ可視化ツール。" },
      {
        key: "tanstack_query",
        name: "TanStack Query",
        description: "サーバーステート管理ライブラリ。",
      },
      {
        key: "tayori",
        name: "Tayori",
        description: "オンライン予約システム。",
      },
      {
        key: "terraform",
        name: "Terraform",
        description: "インフラをコードで管理するツール。",
      }, // 既出のものと重複する場合は注意
      {
        key: "testcontainers",
        name: "Testcontainers",
        description: "コンテナ利用テストツール。",
      },
      {
        key: "testfixtures",
        name: "TestFixtures",
        description: "テストデータ管理ツール。",
      },
      { key: "testrail", name: "TestRail", description: "テスト管理ツール。" },
      {
        key: "thanos",
        name: "Thanos",
        description: "Prometheus拡張ストレージシステム。",
      },
      {
        key: "tokio",
        name: "Tokio",
        description: "Rust向け非同期ランタイム。",
      },
      { key: "tonic", name: "Tonic", description: "Rust向けgRPCライブラリ。" },
      {
        key: "trackjs",
        name: "TrackJS",
        description: "フロントエンドエラーモニタリングツール。",
      },
      {
        key: "transifex",
        name: "Transifex",
        description: "ローカリゼーションプラットフォーム。",
      },
      {
        key: "trocco",
        name: "Trocco",
        description: "データ統合・可視化ツール。",
      },
      {
        key: "trustdock",
        name: "Trustdock",
        description: "オンライン本人確認サービス。",
      },
      {
        key: "twilio",
        name: "Twilio",
        description: "クラウド通信プラットフォーム。",
      },
      {
        key: "typeorm",
        name: "TypeORM",
        description: "TypeScript向けORMライブラリ。",
      },
      {
        key: "zod",
        name: "Zod",
        description: "TypeScript用スキーマ宣言ライブラリ。",
      },

      {
        key: "webassembly",
        name: "WebAssembly",
        description: "ブラウザで動作するバイナリ形式。",
      },

      {
        key: "webrtc",
        name: "WebRTC",
        description: "リアルタイム通信のためのオープンフレームワーク。",
      },
      {
        key: "websocket",
        name: "WebSocket",
        description: "双方向通信プロトコル。",
      },

      {
        key: "wire_mock",
        name: "WireMock",
        description: "モックサーバーツール。",
      },
      {
        key: "wordpress",
        name: "WordPress",
        description: "人気のあるCMSプラットフォーム。",
      },

      {
        key: "xctest",
        name: "XCTest",
        description: "iOS/macOSテストフレームワーク。",
      },
      {
        key: "xcuitest",
        name: "XCUITest",
        description: "iOS用UIテストフレームワーク。",
      },

      { key: "yii", name: "Yii", description: "PHP向け高性能フレームワーク。" },
      {
        key: "yjs",
        name: "Yjs",
        description: "リアルタイム共同編集ライブラリ。",
      },

      {
        key: "zabbix",
        name: "Zabbix",
        description: "エンタープライズ向け監視ツール。",
      },


      {
        key: "zenhub",
        name: "ZenHub",
        description: "GitHub連携プロジェクト管理ツール。",
      },
      {
        key: "zeplin",
        name: "Zeplin",
        description: "デザインと開発の連携ツール。",
      },
    ],
  },

];
