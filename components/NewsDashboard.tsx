"use client";

import { useEffect, useMemo, useState } from "react";
import { DateSelector } from "@/components/DateSelector";
import { NewsCard } from "@/components/NewsCard";
import { TabPanel } from "@/components/TabPanel";
import {
  APP_DESCRIPTION,
  APP_NAME,
  DISPLAY_TABS,
  NEWS_CATEGORIES,
} from "@/lib/config";
import { formatDisplayDate, toJstDateString } from "@/lib/date";
import {
  CategoryNews,
  DailyNewsData,
  DisplayTabId,
  NewsCategoryId,
} from "@/lib/types";

type NewsDashboardProps = {
  isAdmin: boolean;
};

type NewsApiResponse = {
  data: DailyNewsData | null;
  message?: string;
  error?: string;
};

type CollectApiResponse = {
  message?: string;
  error?: string;
  date?: string;
};

const CATEGORY_TABS = NEWS_CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
}));

const TODAY = toJstDateString();

function LoadingMessage() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">
      データを読み込んでいます...
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center text-sm leading-7 text-slate-200">
      {message}
    </div>
  );
}

export function NewsDashboard({ isAdmin }: NewsDashboardProps) {
  const shouldShowCollectButton = isAdmin === true;
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<NewsCategoryId>("reuters-economy");
  const [selectedTabId, setSelectedTabId] = useState<DisplayTabId>("headlines");
  const [data, setData] = useState<DailyNewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // 公開画面と管理画面の両方で同じ取得処理を使い、手動収集後も再読込できます。
  useEffect(() => {
    let active = true;

    async function loadNews() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`/api/news?date=${selectedDate}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as NewsApiResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "ニュースデータの取得に失敗しました。");
        }

        if (!active) {
          return;
        }

        setData(payload.data);
        setInfoMessage(payload.message ?? "");
      } catch (error) {
        if (!active) {
          return;
        }

        setData(null);
        setInfoMessage("");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "ニュースデータの取得に失敗しました。",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      active = false;
    };
  }, [selectedDate, refreshKey]);

  const selectedCategory = useMemo<CategoryNews | null>(() => {
    return (
      data?.categories.find((category) => category.id === selectedCategoryId) ?? null
    );
  }, [data, selectedCategoryId]);

  async function handleManualCollect() {
    setIsCollecting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/collect", {
        method: "POST",
      });
      const payload = (await response.json()) as CollectApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "手動収集に失敗しました。");
      }

      const collectedDate = payload.date ?? TODAY;
      setSelectedDate(collectedDate);
      setStatusMessage(payload.message ?? "ニュースを収集しました。");
      setInfoMessage("");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "手動収集に失敗しました。",
      );
    } finally {
      setIsCollecting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-cyan-300/15 px-3 py-1 text-sm font-medium text-cyan-100">
              Daily News Dashboard
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base">
              {APP_DESCRIPTION}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <DateSelector
              value={selectedDate}
              max={TODAY}
              disabled={isLoading || isCollecting}
              onChange={setSelectedDate}
            />

            {shouldShowCollectButton ? (
              <button
                type="button"
                onClick={handleManualCollect}
                disabled={isCollecting}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                {isCollecting ? "収集中..." : "今日のニュースを収集"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200/80">
          <span>公開用と管理用で同じデータを表示します。</span>
          {data?.collectedAt ? (
            <span>最終収集: {formatDisplayDate(data.collectedAt)}</span>
          ) : null}
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
          {statusMessage}
        </div>
      ) : null}

      {infoMessage ? (
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-50">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="space-y-4">
          <TabPanel
            tabs={CATEGORY_TABS}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
          />

          <TabPanel
            tabs={DISPLAY_TABS}
            value={selectedTabId}
            onChange={setSelectedTabId}
          />
        </div>

        <div className="mt-6">
          {isLoading ? <LoadingMessage /> : null}

          {!isLoading && !data ? (
            <EmptyState message="指定日のデータはまだありません。管理画面から収集するか、cron 実行後に確認してください。" />
          ) : null}

          {!isLoading && data && !selectedCategory ? (
            <EmptyState message="カテゴリデータを表示できませんでした。" />
          ) : null}

          {!isLoading && selectedCategory ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-5">
                <h2 className="text-xl font-semibold text-white">
                  {selectedCategory.label}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {selectedCategory.description}
                </p>
              </div>

              {selectedTabId === "daily" ? (
                <div className="rounded-2xl border border-white/15 bg-white/12 p-5 text-sm leading-8 text-slate-100 shadow-2xl backdrop-blur">
                  <ul className="space-y-2">
                    {selectedCategory.dailySummary.map((item, index) => (
                      <li key={`${selectedCategory.id}-daily-${index}`} className="flex gap-2">
                        <span className="text-cyan-200">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {selectedTabId === "column" ? (
                <div className="rounded-2xl border border-white/15 bg-white/12 p-5 text-sm leading-8 text-slate-100 shadow-2xl backdrop-blur">
                  {selectedCategory.column}
                </div>
              ) : null}

              {selectedTabId !== "daily" && selectedTabId !== "column" ? (
                selectedCategory.articles.length > 0 ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {selectedCategory.articles.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        activeTab={selectedTabId}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="このカテゴリには表示できる記事がまだありません。" />
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
