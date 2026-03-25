import { DisplayTabId, NewsCategoryConfig } from "@/lib/types";

export const APP_NAME = "ニュース要約アプリ v2";
export const APP_DESCRIPTION =
  "毎朝ニュースを自動収集し、日本語でやさしく読める形にまとめるダッシュボードです。";
export const TIME_ZONE = "Asia/Tokyo";
export const AI_MODEL = "claude-haiku-4-5-20251001";
export const MAX_ITEMS_PER_SOURCE = 5;
export const MAX_ITEMS_PER_CATEGORY = 8;
export const MAX_CONTENT_LENGTH = 1800;

export const DISPLAY_TABS: Array<{ id: DisplayTabId; label: string }> = [
  { id: "headlines", label: "見出し" },
  { id: "easy", label: "やさしく" },
  { id: "summary", label: "要約" },
  { id: "quotes", label: "引用" },
  { id: "daily", label: "まとめ" },
  { id: "column", label: "コラム" },
];

// ニュースソースはここだけを見れば追加・削除できるように集約しています。
// カテゴリ2は「経済専用 RSS が確認できるものだけ」を採用し、
// 総合系 RSS はカテゴリ3に寄せて混在を防ぎます。
export const NEWS_CATEGORIES: NewsCategoryConfig[] = [
  {
    id: "reuters-economy",
    label: "ロイター経済",
    description: "海外経済ニュースを日本語に翻訳して要点を確認できます。",
    sources: [
      {
        id: "cnbc-business",
        name: "CNBC Business",
        url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
        language: "en",
      },
      {
        id: "wsj-markets",
        name: "WSJ Markets",
        url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
        language: "en",
      },
      {
        id: "nyt-business",
        name: "NYT Business",
        url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        language: "en",
      },
    ],
  },
  {
    id: "japan-economy",
    label: "日本各紙経済",
    description: "日本の経済関連ニュースを媒体横断で一覧できます。",
    sources: [
      {
        id: "asahi-business",
        name: "朝日新聞経済",
        url: "https://www.asahi.com/rss/asahi/business.rdf",
        language: "ja",
      },
      {
        id: "nhk-business",
        name: "NHK経済",
        url: "https://www.nhk.or.jp/rss/news/cat4.xml",
        language: "ja",
      },
      {
        id: "yahoo-business",
        name: "Yahoo!ニュース経済",
        url: "https://news.yahoo.co.jp/rss/topics/business.xml",
        language: "ja",
      },
    ],
  },
  {
    id: "japan-general",
    label: "日本各紙経済以外",
    description: "総合ニュースの流れを追いながら、その日の話題を俯瞰できます。",
    sources: [
      {
        id: "asahi-general",
        name: "朝日新聞総合",
        url: "https://www.asahi.com/rss/asahi/newsheadlines.rdf",
        language: "ja",
      },
      {
        id: "nhk-general",
        name: "NHK総合",
        url: "https://www.nhk.or.jp/rss/news/cat0.xml",
        language: "ja",
      },
      {
        id: "yahoo-top-picks",
        name: "Yahoo!ニュース主要",
        url: "https://news.yahoo.co.jp/rss/topics/top-picks.xml",
        language: "ja",
      },
      {
        id: "mainichi-flash-general",
        name: "毎日新聞",
        url: "https://mainichi.jp/rss/etc/mainichi-flash.rss",
        language: "ja",
      },
      {
        id: "47news-general",
        name: "共同通信",
        url: "https://www.47news.jp/47news.rss",
        language: "ja",
      },
      {
        id: "jiji-ranking-general",
        name: "時事通信",
        url: "https://www.jiji.com/rss/ranking.rdf",
        language: "ja",
      },
    ],
  },
];
