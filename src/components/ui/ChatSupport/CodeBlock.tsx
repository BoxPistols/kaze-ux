// ChatSupport シンタックスハイライト付きコードブロック

import { Box, IconButton, useTheme } from '@mui/material'
import { Copy, Check } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useState, useCallback, isValidElement, Children } from 'react'

import type { Language } from 'prism-react-renderer'

/**
 * pre 要素のラッパー。コピーボタン + シンタックスハイライトを提供する。
 * ReactMarkdown の components={{ pre: CodeBlockPre }} で使用。
 */
export const CodeBlockPre = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // <pre> の中の <code> 要素から情報を抽出
  const { codeText, language } = (() => {
    let text = ''
    let lang = ''
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.props.children) {
        text = String(child.props.children).replace(/\n$/, '')
        // ReactMarkdown は language-xxx の className を付与する
        const cls = child.props.className || ''
        const match = /language-(\w+)/.exec(cls)
        if (match) lang = match[1]
      }
    })
    return { codeText: text, language: lang }
  })()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('[Concierge] クリップボードコピー失敗:', e)
    }
  }, [codeText])

  const prismTheme = isDark ? themes.oneDark : themes.oneLight

  return (
    <Box sx={{ position: 'relative', my: 1 }}>
      <IconButton
        size='small'
        onClick={handleCopy}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 1,
          opacity: 0.6,
          color: isDark ? 'grey.400' : 'text.secondary',
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(128,128,128,0.1)',
          '&:hover': {
            opacity: 1,
            bgcolor: isDark
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(128,128,128,0.2)',
          },
        }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </IconButton>
      <Highlight
        theme={prismTheme}
        code={codeText}
        language={(language || 'text') as Language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={{
              ...style,
              margin: 0,
              padding: '12px 14px',
              paddingRight: 40,
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.5,
              overflowX: 'auto',
            }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Box>
  )
}

/**
 * インラインcode要素。ブロックcodeは CodeBlockPre が処理するためシンプルに返す。
 */
const CodeBlock = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <code className={className}>{children}</code>
}

export default CodeBlock
