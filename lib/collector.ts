import { collectArticlesByCategory } from "@/lib/rss";
import { toJstDateString } from "@/lib/date";
import { saveDailyNews } from "@/lib/storage";
import { summarizeCategory } from "@/lib/summarize";
import { CollectResult, DailyNewsData } from "@/lib/types";

// 収集・要約・保存の主処理を 1 か所に寄せ、cron と手動実行で共通利用します。
export async function collectAndStoreDailyNews(targetDate = toJstDateString()) {
  const collectedCategories = await collectArticlesByCategory(targetDate);

  const categories = [];
  for (const entry of collectedCategories) {
    try {
      categories.push(await summarizeCategory(entry.category, entry.articles));
    } catch (error) {
      console.error("AI 要約に失敗しました。", {
        category: entry.category.label,
        error,
      });

      categories.push({
        id: entry.category.id,
        label: entry.category.label,
        description: entry.category.description,
        articles: entry.articles.map((article) => ({
          id: article.id,
          sourceName: article.sourceName,
          sourceUrl: article.sourceUrl,
          link: article.link,
          publishedAt: article.publishedAt,
          titleJa: article.title,
          titleOriginal: article.title,
          easySummary: "要約に失敗しました。時間をおいて再実行してください。",
          summaryBullets: [
            "要約に失敗しました。",
            "再実行すると改善する場合があります。",
          ],
          quote: "引用を生成できませんでした。",
        })),
        dailySummary: ["カテゴリ全体のまとめを生成できませんでした。"],
        column: "コラムを生成できませんでした。時間をおいて再実行してください。",
      });
    }
  }

  const payload: DailyNewsData = {
    date: targetDate,
    collectedAt: new Date().toISOString(),
    categories,
  };

  await saveDailyNews(payload);

  return {
    date: targetDate,
    categoryCount: categories.length,
    articleCount: categories.reduce((total, category) => total + category.articles.length, 0),
  } satisfies CollectResult;
}
