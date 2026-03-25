export type SupportedLanguage = "ja" | "en";

export type NewsCategoryId =
  | "reuters-economy"
  | "japan-economy"
  | "japan-general";

export type DisplayTabId =
  | "headlines"
  | "easy"
  | "summary"
  | "quotes"
  | "daily"
  | "column";

export type FeedSource = {
  id: string;
  name: string;
  url: string;
  language: SupportedLanguage;
};

export type CategoryFilterRule = {
  includeKeywords?: string[];
  excludeKeywords?: string[];
};

export type NewsCategoryConfig = {
  id: NewsCategoryId;
  label: string;
  description: string;
  sources: FeedSource[];
  filterRule?: CategoryFilterRule;
};

export type CollectedArticle = {
  id: string;
  categoryId: NewsCategoryId;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  link: string;
  publishedAt: string | null;
  language: SupportedLanguage;
  content: string;
};

export type ProcessedArticle = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  link: string;
  publishedAt: string | null;
  titleJa: string;
  titleOriginal: string;
  easySummary: string;
  summaryBullets: string[];
  quote: string;
};

export type CategoryNews = {
  id: NewsCategoryId;
  label: string;
  description: string;
  articles: ProcessedArticle[];
  dailySummary: string[];
  column: string;
};

export type DailyNewsData = {
  date: string;
  collectedAt: string;
  categories: CategoryNews[];
};

export type CollectResult = {
  date: string;
  categoryCount: number;
  articleCount: number;
};
