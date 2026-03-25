import { get, put } from "@vercel/blob";
import { getBlobReadWriteToken } from "@/lib/env";
import { DailyNewsData } from "@/lib/types";

function createBlobPath(date: string) {
  return `daily-news/${date}.json`;
}

// Vercel Blob の詳細はこのファイルに閉じ込め、private ストア前提で統一します。
export async function saveDailyNews(data: DailyNewsData) {
  const pathname = createBlobPath(data.date);

  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    token: getBlobReadWriteToken(),
  });
}

export async function readDailyNews(date: string): Promise<DailyNewsData | null> {
  const pathname = createBlobPath(date);
  const result = await get(pathname, {
    access: "private",
    token: getBlobReadWriteToken(),
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as DailyNewsData;
}
