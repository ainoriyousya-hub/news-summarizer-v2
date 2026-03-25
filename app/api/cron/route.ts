import { NextRequest, NextResponse } from "next/server";
import { collectAndStoreDailyNews } from "@/lib/collector";
import { getCronSecret } from "@/lib/env";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return false;
  }

  const token = header.slice("Bearer ".length);
  return token === getCronSecret();
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "認証に失敗しました。" }, { status: 401 });
    }

    const result = await collectAndStoreDailyNews();

    return NextResponse.json({
      message: "自動収集が完了しました。",
      ...result,
    });
  } catch (error) {
    console.error("自動収集エンドポイントでエラーが発生しました。", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "自動収集に失敗しました。" },
      { status: 500 },
    );
  }
}
