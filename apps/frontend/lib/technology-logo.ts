import { technologies } from "@data/technologies";

/**
 * 文字列を正規化する（大文字小文字、スペース、記号を統一）
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // 文字と数字以外を削除
    .trim();
};

/**
 * 技術名からロゴ画像のパスを取得する関数（改善版）
 * @param techName 技術名またはキー
 * @returns ロゴ画像のパス（見つからない場合はnull）
 */
export const getTechnologyLogo = (techName: string): string | null => {
  // 全カテゴリの技術を平坦化
  const allTechnologies = technologies.flatMap(category => category.technologies);
  
  const normalizedInput = normalizeString(techName);
  
  // 優先順位付きで検索
  
  // 1. 完全一致（key）
  let technology = allTechnologies.find(tech => 
    tech.key.toLowerCase() === techName.toLowerCase()
  );
  
  if (technology) {
    return `/tech_stack_logo/${technology.key}.png`;
  }
  
  // 2. 完全一致（name）
  technology = allTechnologies.find(tech => 
    tech.name.toLowerCase() === techName.toLowerCase()
  );
  
  if (technology) {
    return `/tech_stack_logo/${technology.key}.png`;
  }
  
  // 3. 正規化した文字列での完全一致
  technology = allTechnologies.find(tech => 
    normalizeString(tech.key) === normalizedInput ||
    normalizeString(tech.name) === normalizedInput
  );
  
  if (technology) {
    return `/tech_stack_logo/${technology.key}.png`;
  }
  
  // 4. 部分一致（より柔軟）
  technology = allTechnologies.find(tech => {
    const normalizedKey = normalizeString(tech.key);
    const normalizedName = normalizeString(tech.name);
    
    return (
      normalizedKey.includes(normalizedInput) ||
      normalizedInput.includes(normalizedKey) ||
      normalizedName.includes(normalizedInput) ||
      normalizedInput.includes(normalizedName)
    );
  });
  
  if (technology) {
    return `/tech_stack_logo/${technology.key}.png`;
  }
  
  // 5. 特殊ケース処理
  const specialCases: Record<string, string> = {
    // よくある略称・別名
    'js': 'javascript',
    'ts': 'typescript',
    'react.js': 'react',
    'next.js': 'nextjs',
    'vue.js': 'vuejs',
    'node.js': 'nodejs',
    'express.js': 'express',
    'nest.js': 'nestjs',
    'svelte.js': 'svelte',
    'angular.js': 'angular',
    'postgres': 'postgresql',
    'mongo': 'mongodb',
    'elastic': 'elasticsearch',
    'k8s': 'kubernetes',
    'tf': 'terraform',
    'gcp': 'gcp_compute_engine',
    'aws': 'aws_ec2',
    'azure': 'azure_app_service',
    'fb': 'facebook',
    'gh': 'github',
    'gl': 'gitlab',
    'bb': 'bitbucket',
  };
  
  const normalizedInputLower = techName.toLowerCase();
  if (specialCases[normalizedInputLower]) {
    const specialKey = specialCases[normalizedInputLower];
    technology = allTechnologies.find(tech => tech.key === specialKey);
    if (technology) {
      return `/tech_stack_logo/${technology.key}.png`;
    }
  }
  
  return null;
};

/**
 * 技術名から技術情報を取得する関数（改善版）
 * @param techName 技術名またはキー
 * @returns 技術情報（見つからない場合はnull）
 */
export const getTechnologyInfo = (techName: string) => {
  const allTechnologies = technologies.flatMap(category => category.technologies);
  const normalizedInput = normalizeString(techName);
  
  // 同じ検索ロジックを使用
  
  // 1. 完全一致（key）
  let technology = allTechnologies.find(tech => 
    tech.key.toLowerCase() === techName.toLowerCase()
  );
  
  if (technology) return technology;
  
  // 2. 完全一致（name）
  technology = allTechnologies.find(tech => 
    tech.name.toLowerCase() === techName.toLowerCase()
  );
  
  if (technology) return technology;
  
  // 3. 正規化した文字列での完全一致
  technology = allTechnologies.find(tech => 
    normalizeString(tech.key) === normalizedInput ||
    normalizeString(tech.name) === normalizedInput
  );
  
  if (technology) return technology;
  
  // 4. 部分一致
  technology = allTechnologies.find(tech => {
    const normalizedKey = normalizeString(tech.key);
    const normalizedName = normalizeString(tech.name);
    
    return (
      normalizedKey.includes(normalizedInput) ||
      normalizedInput.includes(normalizedKey) ||
      normalizedName.includes(normalizedInput) ||
      normalizedInput.includes(normalizedName)
    );
  });
  
  return technology || null;
};

/**
 * 複数の技術名からロゴ情報を取得する関数
 * @param techNames 技術名の配列
 * @returns ロゴ情報の配列
 */
export const getTechnologyLogos = (techNames: string[]) => {
  return techNames.map(techName => ({
    name: techName,
    logoPath: getTechnologyLogo(techName),
    info: getTechnologyInfo(techName)
  }));
};

// カテゴリー名の英語変換マッピング
export const categoryEnglishMap: Record<string, string> = {
  "プログラミング言語": "Language",
  "フロントエンド技術": "Frontend", 
  "バックエンド技術": "Backend",
  "モバイル開発": "Mobile",
  "データベース": "Database",
  "UIライブラリ": "UI",
  "機械学習": "ML",
  "データ分析・BI": "Analytics",
  "デザイン": "Design",
  "Amazon Web Services (AWS)": "AWS",
  "Microsoft Azure": "Azure",
  "Google Cloud Platform (GCP)": "GCP",
  "その他のクラウドサービス": "Cloud",
  "DevOpsとCI/CDツール": "DevOps",
  "テストフレームワーク": "Testing",
  "セキュリティと認証": "Security",
  "ブロックチェーンとスマートコントラクト": "Blockchain",
  "その他のツールとテクノロジー": "Other",
};

/**
 * 技術スタック名からカテゴリーを取得
 */
export const getTechnologyCategory = (stackName: string): string => {
  for (const category of technologies) {
    const found = category.technologies.find(tech => 
      tech.name.toLowerCase() === stackName.toLowerCase() || 
      tech.key.toLowerCase() === stackName.toLowerCase()
    );
    if (found) {
      return category.name;
    }
  }
  return "その他のツールとテクノロジー"; // デフォルトカテゴリー
};

/**
 * 技術スタック配列をカテゴリー別に集計
 */
export const aggregateTechStacksByCategory = (techStacks: any[]) => {
  const categoryCount: Record<string, number> = {};

  techStacks.forEach(stack => {
    const category = getTechnologyCategory(stack.stack_name);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  // カテゴリー数でソートして上位5つを取得
  const sortedCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 英語名に変換
  const result = sortedCategories.map(([categoryName, count]) => ({
    category: categoryEnglishMap[categoryName] || "Other",
    count
  }));

  // Languageカテゴリーを必ず最初に表示
  const languageIndex = result.findIndex(item => item.category === "Language");
  if (languageIndex > 0) {
    // Languageが存在し、最初でない場合は最初に移動
    const languageItem = result.splice(languageIndex, 1)[0];
    result.unshift(languageItem);
  } else if (languageIndex === -1 && categoryCount["プログラミング言語"]) {
    // Languageカテゴリーが結果に含まれていないが存在する場合は追加
    result.unshift({
      category: "Language",
      count: categoryCount["プログラミング言語"]
    });
    // 配列が6つになった場合は最後を削除
    if (result.length > 5) {
      result.pop();
    }
  }

  return result;
}; 