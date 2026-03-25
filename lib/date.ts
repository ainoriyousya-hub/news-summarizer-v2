import { TIME_ZONE } from "@/lib/config";

// 画面表示・保存キーの両方で同じ日付形式を使うため、JST 変換を共通化しています。
export function toJstDateString(input: string | Date = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isSameJstDate(
  dateValue: string | null | undefined,
  targetDate: string,
) {
  if (!dateValue) {
    return false;
  }

  return toJstDateString(dateValue) === targetDate;
}

export function formatDisplayDate(dateValue: string | null) {
  if (!dateValue) {
    return "日時不明";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
