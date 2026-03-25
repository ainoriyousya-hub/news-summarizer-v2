import { list, put } from "@vercel/blob";
import { DailyNewsData } from "@/lib/types";
import { getBlobReadWriteToken } from "@/lib/env";

function createBlobPath(date: string) {
  return `daily-news/${date}.json`;
}

// Vercel Blob は保存先の詳細をこのファイルに閉じ込め、呼び出し側を単純に保ちます。
export async function saveDailyNews(data: DailyNewsData) {
  const pathname = createBlobPath(data.date);

  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    token: getBlobReadWriteToken(),
  });
}

export async function readDailyNews(date: string): Promise<DailyNewsData | null> {
  const pathname = createBlobPath(date);
  const blobList = await list({
    prefix: pathname,
    token: getBlobReadWriteToken(),
  });

  const exactBlob = blobList.blobs.find((blob) => blob.pathname === pathname);

  if (!exactBlob) {
    return null;
  }

  const response = await fetch(exactBlob.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("保存済みニュースの取得に失敗しました。");
  }

  return (await response.json()) as DailyNewsData;
}
