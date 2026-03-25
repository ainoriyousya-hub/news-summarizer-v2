import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "@/lib/config";
import { getAnthropicApiKey } from "@/lib/env";
import { CollectedArticle, NewsCategoryConfig, ProcessedArticle } from "@/lib/types";

type AiArticlePayload = {
  id: string;
  translatedTitle: string;
  easySummary: string;
  summaryBullets: string[];
  quote: string;
};

type AiCategoryPayload = {
  articles: AiArticlePayload[];
  dailySummary: string[];
  column: string;
};

let anthropicClient: Anthropic | null = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: getAnthropicApiKey(),
    });
  }

  return anthropicClient;
}

function extractJsonObject(text: string) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI 応答から JSON を取り出せませんでした。");
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function buildPrompt(category: NewsCategoryConfig, articles: CollectedArticle[]) {
  const serializedArticles = articles.map((article) => ({
    id: article.id,
    sourceName: article.sourceName,
    title: article.title,
    link: article.link,
    publishedAt: article.publishedAt,
    language: article.language,
    content: article.content,
  }));

  return [
    "次のニュース記事を日本語で整理してください。",
    "出力は JSON のみで返してください。",
    "ルール:",
    '1. articles は入力と同じ id を使うこと。',
    '2. translatedTitle は日本語タイトル。日本語記事なら自然な見出しに整えるだけでよい。',
    '3. easySummary は小学4年生向けの一言説明。',
    '4. summaryBullets は3件の箇条書き。',
    '5. quote は根拠として短い引用を1つ。長すぎず 1 文程度。',
    '6. dailySummary はカテゴリ全体の3点まとめ。',
    '7. column は過去の流れも踏まえた短い時勢コラム。',
    "JSON 形式:",
    '{"articles":[{"id":"","translatedTitle":"","easySummary":"","summaryBullets":["","",""],"quote":""}],"dailySummary":["","",""],"column":""}',
    "",
    `カテゴリ名: ${category.label}`,
    `カテゴリ説明: ${category.description}`,
    JSON.stringify(serializedArticles, null, 2),
  ].join("\n");
}

function normalizeArticle(
  source: CollectedArticle,
  payload: AiArticlePayload | undefined,
): ProcessedArticle {
  return {
    id: source.id,
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl,
    link: source.link,
    publishedAt: source.publishedAt,
    titleJa: payload?.translatedTitle?.trim() || source.title,
    titleOriginal: source.title,
    easySummary: payload?.easySummary?.trim() || "要約を生成できませんでした。",
    summaryBullets:
      payload?.summaryBullets?.filter(Boolean).slice(0, 3) ?? [
        "要約を生成できませんでした。",
      ],
    quote: payload?.quote?.trim() || "引用を生成できませんでした。",
  };
}

// カテゴリ単位で AI に処理させることで、記事追加時も呼び出し設計を増やさず保てます。
export async function summarizeCategory(
  category: NewsCategoryConfig,
  articles: CollectedArticle[],
) {
  if (articles.length === 0) {
    return {
      id: category.id,
      label: category.label,
      description: category.description,
      articles: [],
      dailySummary: ["当日の記事はまだありません。"],
      column: "当日の記事が集まると、ここにその日の流れを踏まえたコラムが表示されます。",
    };
  }

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 3200,
    temperature: 0.2,
    system:
      "あなたは日本語ニュース編集者です。事実関係を保ちながら、わかりやすく短く整理してください。",
    messages: [
      {
        role: "user",
        content: buildPrompt(category, articles),
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const parsed = JSON.parse(extractJsonObject(text)) as AiCategoryPayload;
  const articlesById = new Map(parsed.articles?.map((article) => [article.id, article]));

  return {
    id: category.id,
    label: category.label,
    description: category.description,
    articles: articles.map((article) => normalizeArticle(article, articlesById.get(article.id))),
    dailySummary:
      parsed.dailySummary?.filter(Boolean).slice(0, 3) ?? ["まとめを生成できませんでした。"],
    column:
      parsed.column?.trim() ||
      "コラムを生成できませんでした。時間をおいて再度収集してください。",
  };
}
