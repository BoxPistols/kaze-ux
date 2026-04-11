// 設定パネル
// - 接続状態表示
// - カスタム API キー入力（OpenAI / Gemini プロバイダータブ）
// - モデル選択ドロップダウン
// - 接続テストボタン
// - キーボードショートカット設定テーブル

import {
  Alert, Box, Button, Chip, CircularProgress, Divider,
  InputAdornment, Link, MenuItem, Stack, TextField, Typography, useTheme,
} from '@mui/material'
import {
  AlertCircle, CheckCircle2, Eye, EyeOff, Keyboard, Lock, Sparkles,
} from 'lucide-react'

import {
  DEFAULT_API_KEY,
  DEFAULT_MODEL,
  GEMINI_MODELS,
  OPENAI_MODELS,
  SHORTCUT_METADATA,
  formatShortcutLabel,
} from '../chatSupportConstants'

import type {
  ChatSupportConfig,
  ShortcutActionId,
} from '../chatSupportTypes'

interface ChatSettingsProps {
  config: ChatSupportConfig
  setConfig: React.Dispatch<React.SetStateAction<ChatSupportConfig>>
  apiKeyDraft: string
  setApiKeyDraft: (v: string) => void
  isUsingDefaultKey: boolean
  showApiKey: boolean
  setShowApiKey: (v: boolean) => void
  testResult: { success: boolean; message: string } | null
  setTestResult: (v: { success: boolean; message: string } | null) => void
  isTesting: boolean
  onTestConnection: () => void
  onResetShortcuts: () => void
  onShortcutInputKeyDown: (id: ShortcutActionId) => (e: React.KeyboardEvent<HTMLElement>) => void
  onResetApiKey: () => void
}

export const ChatSettings = ({
  config,
  setConfig,
  apiKeyDraft,
  setApiKeyDraft,
  isUsingDefaultKey,
  showApiKey,
  setShowApiKey,
  testResult,
  setTestResult,
  isTesting,
  onTestConnection,
  onResetShortcuts,
  onShortcutInputKeyDown,
  onResetApiKey,
}: ChatSettingsProps) => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
      <Stack spacing={3}>
        {/* 現在の接続状態 */}
        <Box
          sx={{
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.03)',
            borderRadius: 1,
            p: 2,
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            現在の設定
          </Typography>
          {isUsingDefaultKey ? (
            DEFAULT_API_KEY ? (
              <>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.6 }}>
                  {config.model} を使用中（プロジェクト提供）
                </Typography>
                <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.5 }}>
                  <CheckCircle2 size={14} color={theme.palette.success.main} />
                  <Typography variant='caption' color='success.main'>AI対話モード</Typography>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.6 }}>
                  APIキー未設定
                </Typography>
                <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.5 }}>
                  <AlertCircle size={14} color={theme.palette.warning.main} />
                  <Typography variant='caption' color='warning.main'>
                    FAQモードのみ（AI対話にはAPIキーが必要）
                  </Typography>
                </Stack>
              </>
            )
          ) : (
            <>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.6 }}>
                {config.model} を使用中（カスタムAPIキー）
              </Typography>
              <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 0.5 }}>
                <CheckCircle2 size={14} color={theme.palette.success.main} />
                <Typography variant='caption' color='success.main'>AI対話モード</Typography>
              </Stack>
            </>
          )}
        </Box>

        <Divider />

        {/* カスタム API 設定 */}
        <Box>
          <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            カスタムAPI設定（任意）
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5, lineHeight: 1.6 }}>
            自分のAPIキーを使うと、より高性能なモデルを選択できます。
          </Typography>

          {/* プロバイダー選択タブ */}
          <Stack direction='row' spacing={1} sx={{ mb: 1.5 }}>
            {(['openai', 'gemini'] as const).map((provider) => {
              const isGemini = (config.model ?? '').includes('gemini')
              const active =
                (provider === 'gemini' && isGemini) ||
                (provider === 'openai' && !isGemini)
              return (
                <Chip
                  key={provider}
                  label={provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
                  size='small'
                  variant={active ? 'filled' : 'outlined'}
                  color={active ? 'primary' : 'default'}
                  onClick={() => {
                    const models = provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS
                    const defaultModel = (
                      models.find((m) => !m.requiresUserKey) ?? models[0]
                    ).value
                    setConfig({ ...config, model: defaultModel })
                    setTestResult(null)
                  }}
                  sx={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem' }}
                />
              )
            })}
          </Stack>

          {/* API キー入力 */}
          <TextField
            fullWidth
            size='small'
            autoComplete='off'
            value={apiKeyDraft}
            onChange={(e) => {
              const v = e.target.value
              setApiKeyDraft(v)
              if (v) {
                setConfig({ ...config, apiKey: v })
              } else {
                setConfig({ ...config, apiKey: DEFAULT_API_KEY, model: DEFAULT_MODEL })
              }
              setTestResult(null)
            }}
            placeholder={(config.model ?? '').includes('gemini') ? 'AIza...' : 'sk-proj-...'}
            type={showApiKey ? 'text' : 'password'}
            inputProps={{
              style: {
                fontFamily: 'monospace',
                fontSize: 12,
                letterSpacing: showApiKey ? 'normal' : '0.1em',
              },
            }}
            InputProps={{
              endAdornment: apiKeyDraft ? (
                <InputAdornment position='end'>
                  <Stack direction='row' spacing={0.5}>
                    <Button
                      size='small'
                      variant='text'
                      onClick={() => setShowApiKey(!showApiKey)}
                      sx={{ minWidth: 0, p: 0.5 }}>
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      size='small'
                      variant='text'
                      color='warning'
                      onClick={onResetApiKey}
                      sx={{ minWidth: 0, p: 0.5, fontSize: 11 }}>
                      リセット
                    </Button>
                  </Stack>
                </InputAdornment>
              ) : undefined,
            }}
          />
        </Box>

        {/* モデル選択 */}
        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.8, fontWeight: 600 }}>
            AIモデル
          </Typography>
          <TextField
            select
            fullWidth
            size='small'
            value={config.model}
            onChange={(e) => {
              setConfig({ ...config, model: e.target.value })
              setTestResult(null)
            }}>
            {((config.model ?? '').includes('gemini') ? GEMINI_MODELS : OPENAI_MODELS).map((opt) => {
              const isLocked = isUsingDefaultKey && !!opt.requiresUserKey
              return (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  disabled={isLocked}
                  title={isLocked ? '自分のAPIキーを設定すると使用できます' : undefined}
                  sx={{ py: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      {isLocked && <Lock size={12} />}
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                      <Chip
                        label={
                          opt.tier === 'premium' ? 'Premium'
                            : opt.tier === 'economy' ? 'Economy'
                            : 'Standard'
                        }
                        size='small'
                        color={opt.tier === 'premium' ? 'primary' : opt.tier === 'economy' ? 'default' : 'info'}
                        variant='outlined'
                        sx={{ height: 18, fontSize: '0.6rem', '& .MuiChip-label': { px: 0.75 } }}
                      />
                    </Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.4, mb: 0.5 }}>
                      {opt.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {opt.usecases.map((uc) => (
                        <Typography
                          key={uc}
                          variant='caption'
                          sx={{ fontSize: '0.65rem', color: 'text.disabled', lineHeight: 1.2, '&::before': { content: '"- "' } }}>
                          {uc}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </MenuItem>
              )
            })}
          </TextField>
        </Box>

        {/* 接続テスト（カスタムキー入力時のみ） */}
        {!!apiKeyDraft && (
          <>
            <Button
              fullWidth
              variant='outlined'
              size='medium'
              onClick={onTestConnection}
              disabled={isTesting || !config.apiKey}
              sx={{ py: 1 }}
              startIcon={
                isTesting ? <CircularProgress size={16} color='inherit' /> : <Sparkles size={16} />
              }>
              {isTesting ? 'テスト中...' : 'API接続テスト'}
            </Button>
            {testResult && (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}>
                <Typography variant='caption'>{testResult.message}</Typography>
              </Alert>
            )}
          </>
        )}

        <Divider />
        <Typography variant='caption' color='text.secondary'>
          キーはブラウザにのみ保存されます。モデルを切り替えたらテストを推奨します。
        </Typography>

        {/* API キー取得方法 */}
        <Box
          sx={{
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: 1, p: 1.5,
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            APIキーの取得方法
          </Typography>
          <Typography variant='caption' color='text.secondary' component='div' sx={{ lineHeight: 1.7 }}>
            <Box component='ul' sx={{ pl: 2, m: 0, '& li': { mb: 0.5 } }}>
              <li>
                <strong>OpenAI</strong>:{' '}
                <Link href='https://platform.openai.com/api-keys' target='_blank' rel='noopener noreferrer' sx={{ fontSize: 'inherit' }}>
                  platform.openai.com
                </Link>{' '}
                でアカウント作成後、API Keysページでキーを発行（従量課金制）
              </li>
              <li>
                <strong>Google Gemini</strong>:{' '}
                <Link href='https://aistudio.google.com/apikey' target='_blank' rel='noopener noreferrer' sx={{ fontSize: 'inherit' }}>
                  aistudio.google.com
                </Link>{' '}
                でGoogleアカウントでログイン後、APIキーを発行（無料枠あり）
              </li>
            </Box>
          </Typography>
        </Box>

        <Divider />

        {/* ショートカット設定 */}
        <Box>
          <Stack direction='row' justifyContent='space-between' spacing={1} alignItems='center' sx={{ mb: 1 }}>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Keyboard size={14} />
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                キーボードショートカット
              </Typography>
            </Stack>
            <Button size='small' variant='text' onClick={onResetShortcuts}>
              既定値に戻す
            </Button>
          </Stack>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.2 }}>
            入力欄にフォーカスして希望のキーを押すと更新されます。
          </Typography>
          <Box
            component='table'
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              '& td': { py: 0.6, fontSize: 11, verticalAlign: 'middle' },
              '& td:first-of-type': { width: 160, pr: 1 },
            }}>
            <tbody>
              {SHORTCUT_METADATA.map((s) => (
                <tr key={s.id}>
                  <td>
                    <TextField
                      size='small'
                      value={formatShortcutLabel(config.shortcuts[s.id])}
                      onKeyDown={onShortcutInputKeyDown(s.id)}
                      InputProps={{
                        readOnly: true,
                        inputProps: {
                          'aria-label': `${s.desc} のショートカット`,
                          style: { fontFamily: 'monospace', fontSize: 10, textAlign: 'center', paddingTop: 4, paddingBottom: 4 },
                        },
                      }}
                    />
                  </td>
                  <td>
                    <Typography variant='caption' color='text.secondary'>{s.desc}</Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
