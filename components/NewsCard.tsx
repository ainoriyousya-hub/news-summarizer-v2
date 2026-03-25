import { formatDisplayDate } from "@/lib/date";
import { DisplayTabId, ProcessedArticle } from "@/lib/types";

type NewsCardProps = {
  article: ProcessedArticle;
  activeTab: Extract<DisplayTabId, "headlines" | "easy" | "summary" | "quotes">;
};

export function NewsCard({ article, activeTab }: NewsCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/12 p-5 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200/80">
          <span className="rounded-full bg-white/10 px-2.5 py-1">{article.sourceName}</span>
          <span>{formatDisplayDate(article.publishedAt)}</span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">{article.titleJa}</h3>
          {article.titleOriginal !== article.titleJa ? (
            <p className="mt-2 text-sm text-slate-200/70">{article.titleOriginal}</p>
          ) : null}
        </div>

        {activeTab === "headlines" ? (
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center rounded-full border border-cyan-300/50 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/10"
          >
            元記事を開く
          </a>
        ) : null}

        {activeTab === "easy" ? (
          <p className="text-sm leading-7 text-slate-100">{article.easySummary}</p>
        ) : null}

        {activeTab === "summary" ? (
          <ul className="space-y-2 text-sm leading-7 text-slate-100">
            {article.summaryBullets.map((bullet, index) => (
              <li key={`${article.id}-bullet-${index}`} className="flex gap-2">
                <span className="mt-1 text-cyan-200">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {activeTab === "quotes" ? (
          <blockquote className="rounded-2xl border-l-4 border-cyan-300 bg-slate-950/30 px-4 py-3 text-sm leading-7 text-slate-100">
            {article.quote}
          </blockquote>
        ) : null}
      </div>
    </article>
  );
}
