import Parser from "rss-parser";
import {
  MAX_CONTENT_LENGTH,
  MAX_ITEMS_PER_CATEGORY,
  MAX_ITEMS_PER_SOURCE,
  NEWS_CATEGORIES,
} from "@/lib/config";
import { isSameJstDate } from "@/lib/date";
import {
  CollectedArticle,
  FeedSource,
  NewsCategoryConfig,
  CategoryFilterRule,
} from "@/lib/types";

type ParsedItem = {
  guid?: string;
  id?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  "content:encoded"?: string;
};

const parser = new Parser<Record<string, never>, ParsedItem>();

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toCollectedArticle(
  item: ParsedItem,
  category: NewsCategoryConfig,
  source: FeedSource,
  index: number,
): CollectedArticle | null {
  const title = item.title?.trim();
  const link = item.link?.trim();

  if (!title || !link) {
    return null;
  }

  const rawBody =
    item.contentSnippet ??
    item["content:encoded"] ??
    item.content ??
    item.summary ??
    title;

  return {
    id: item.guid ?? item.id ?? `${source.id}-${index}-${link}`,
    categoryId: category.id,
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    title,
    link,
    publishedAt: item.isoDate ?? item.pubDate ?? null,
    language: source.language,
    content: stripHtml(rawBody).slice(0, MAX_CONTENT_LENGTH),
  };
}

function matchesCategoryFilter(
  article: CollectedArticle,
  filterRule: CategoryFilterRule | undefined,
) {
  if (!filterRule) {
    return true;
  }

  const haystack = `${article.title} ${article.content}`.toLowerCase();
  const hasIncludeMatch = filterRule.includeKeywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );

  if (!hasIncludeMatch) {
    return false;
  }

  if (!filterRule.excludeKeywords?.length) {
    return true;
  }

  return !filterRule.excludeKeywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}

async function fetchSourceArticles(
  category: NewsCategoryConfig,
  source: FeedSource,
  targetDate: string,
): Promise<CollectedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items ?? [])
      .map((item, index) => toCollectedArticle(item, category, source, index))
      .filter((article): article is CollectedArticle => article !== null)
      .filter((article) =>
        article.publishedAt ? isSameJstDate(article.publishedAt, targetDate) : true,
      )
      .filter((article) => matchesCategoryFilter(article, category.filterRule))
      .slice(0, MAX_ITEMS_PER_SOURCE);
  } catch (error) {
    console.error("RSS フィードの取得に失敗しました。", {
      category: category.label,
      source: source.name,
      error,
    });
    return [];
  }
}

function deduplicateArticles(articles: CollectedArticle[]) {
  const seen = new Set<string>();

  return articles.filter((article) => {
    const key = `${article.link}::${article.title}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

// 各カテゴリは独立して集約し、後から媒体を増減しても影響範囲を狭くしています。
export async function collectArticlesByCategory(targetDate: string) {
  return Promise.all(
    NEWS_CATEGORIES.map(async (category) => {
      const perSourceArticles = await Promise.all(
        category.sources.map((source) => fetchSourceArticles(category, source, targetDate)),
      );

      const articles = deduplicateArticles(perSourceArticles.flat())
        .sort((left, right) => {
          const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
          const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
          return rightTime - leftTime;
        })
        .slice(0, MAX_ITEMS_PER_CATEGORY);

      return {
        category,
        articles,
      };
    }),
  );
}
