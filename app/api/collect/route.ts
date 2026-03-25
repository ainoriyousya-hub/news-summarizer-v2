import { NextResponse } from "next/server";
import { collectAndStoreDailyNews } from "@/lib/collector";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await collectAndStoreDailyNews();

    return NextResponse.json({
      message: `ニュース収集が完了しました。${result.articleCount} 件の記事を保存しました。`,
      ...result,
    });
  } catch (error) {
    console.error("手動収集エンドポイントでエラーが発生しました。", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "手動収集に失敗しました。" },
      { status: 500 },
    );
  }
}
