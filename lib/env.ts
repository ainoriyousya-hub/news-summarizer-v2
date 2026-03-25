function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} が設定されていません。`);
  }

  return value;
}

export function getAnthropicApiKey() {
  return requireEnv("ANTHROPIC_API_KEY");
}

export function getBlobReadWriteToken() {
  return requireEnv("BLOB_READ_WRITE_TOKEN");
}

export function getCronSecret() {
  return requireEnv("CRON_SECRET");
}
