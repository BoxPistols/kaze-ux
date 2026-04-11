// CORS 設定
// - Storybook (gh-pages / Vercel preview / production) からのアクセスを許可
// - localhost は開発用に常時許可
// - 厳格な allowlist で wild card は使わない

const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  // ローカル開発
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  // Vercel デプロイ（production / preview / branch）
  /^https:\/\/kaze-ux(-[a-z0-9-]+)?\.vercel\.app$/,
  // GitHub Pages
  /^https:\/\/boxpistols\.github\.io$/,
]

export const isAllowedOrigin = (origin: string | undefined | null): boolean => {
  if (!origin) return false
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
}

interface ResponseLike {
  setHeader: (name: string, value: string) => void
}

export const setCorsHeaders = (
  res: ResponseLike,
  origin: string | undefined | null
): void => {
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-API-Key')
  res.setHeader(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  )
  res.setHeader('Access-Control-Max-Age', '86400')
}
