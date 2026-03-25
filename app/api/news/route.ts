import { NextRequest, NextResponse } from "next/server";
import { toJstDateString } from "@/lib/date";
import { readDailyNews } from "@/lib/storage";

export const dynamic = "force-dynamic";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? toJstDateString();

  if (!isValidDateString(date)) {
    return NextResponse.json(
      { error: "日付は YYYY-MM-DD 形式で指定してください。" },
      { status: 400 },
    );
  }

  try {
    const data = await readDailyNews(date);

    return NextResponse.json({
      data,
      message: data ? undefined : "指定日のデータはまだありません。",
    });
  } catch (error) {
    console.error("ニュースデータ取得でエラーが発生しました。", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ニュース取得に失敗しました。" },
      { status: 500 },
    );
  }
}
