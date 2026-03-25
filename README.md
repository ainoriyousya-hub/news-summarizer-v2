# ニュース要約アプリ v2

毎朝ニュースを自動収集し、Claude で日本語要約して表示する Next.js アプリです。  
公開用 URL (`/`) と管理用 URL (`/admin`) を分けて運用できます。

## 技術スタック

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Vercel Blob
- `@anthropic-ai/sdk` (`claude-haiku-4-5-20251001`)
- `rss-parser`
- cron-job.org

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. 環境変数ファイルを作成します。

```bash
cp .env.example .env.local
```

3. `.env.local` に以下を設定します。

```env
ANTHROPIC_API_KEY=
BLOB_READ_WRITE_TOKEN=
CRON_SECRET=
```

4. 開発サーバーを起動します。

```bash
npm run dev
```

## 環境変数

- `ANTHROPIC_API_KEY`: Anthropic API キー
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob の読み書きトークン
- `CRON_SECRET`: cron-job.org から `/api/cron` を呼び出す Bearer トークン

環境変数が増えた場合は、必ず `.env.example` に追記してください。

## 運用

- 公開用ページ: `/`
- 管理用ページ: `/admin`
- 自動収集 API: `/api/cron`
- 手動収集 API: `/api/collect`
- ニュース取得 API: `/api/news?date=YYYY-MM-DD`

## cron-job.org 設定手順

1. cron-job.org で新しいジョブを作成します。
2. URL に `https://<your-domain>/api/cron` を設定します。
3. 実行時刻を毎日 `22:00 UTC` に設定します。
4. Request method は `GET` にします。
5. HTTP Header に `Authorization: Bearer {CRON_SECRET}` を設定します。
6. テスト実行して成功レスポンスを確認します。

Vercel Cron は使用しません。

## Vercel デプロイ

1. Vercel にこのプロジェクトをデプロイします。
2. Vercel ダッシュボードで次の環境変数を設定します。
   - `ANTHROPIC_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
   - `CRON_SECRET`
3. `/admin` から手動収集を実行して保存確認します。
4. その後 cron-job.org を本番 URL に向けます。

`vercel.json` は不要です。

## 保守のポイント

- RSS URL やカテゴリ設定は `lib/config.ts` に集約しています。
- 収集処理の本体は `lib/collector.ts` にまとめています。
- Vercel Blob への読み書きは `lib/storage.ts` に閉じ込めています。
- トークンや API キーの値をログ出力しない実装にしています。

## トラブル対応

### `/api/cron` が 401 になる

- `Authorization` ヘッダーが `Bearer {CRON_SECRET}` 形式か確認してください。
- Vercel の `CRON_SECRET` と cron-job.org の設定値が一致しているか確認してください。

### ニュースが表示されない

- `/admin` で手動収集を実行してください。
- RSS 配信元が一時的にエラーを返していないか確認してください。
- Vercel Blob に当日分の JSON が保存されているか確認してください。

### 要約に失敗する

- `ANTHROPIC_API_KEY` が正しく設定されているか確認してください。
- Anthropic API の制限や利用状態を確認してください。
- サーバーログに日本語のエラーが出ていないか確認してください。

### 過去日のデータが見つからない

- その日に収集が成功していない可能性があります。
- Blob に対象日付の保存データがあるか確認してください。
