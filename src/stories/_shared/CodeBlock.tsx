import { Box, IconButton, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Check, Copy } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useCallback, useState } from 'react'

type Language =
  | 'tsx'
  | 'typescript'
  | 'javascript'
  | 'jsx'
  | 'css'
  | 'html'
  | 'bash'
  | 'json'
  | 'markdown'

interface CodeBlockProps {
  children: string
  language?: Language
  caption?: string
}

const CodeBlock = ({ children, language = 'tsx', caption }: CodeBlockProps) => {
  const theme = useTheme()
  const [copied, setCopied] = useState(false)
  const isDark = theme.palette.mode === 'dark'
  const code = children.replace(/\n$/, '')

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <Box sx={{ mb: caption ? 3 : 2 }}>
      <Paper
        variant='outlined'
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'auto',
          bgcolor: isDark ? 'grey.900' : 'grey.50',
        }}>
        <IconButton
          size='small'
          onClick={handleCopy}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            opacity: 0.5,
            color: 'text.secondary',
            zIndex: 1,
            '&:hover': { opacity: 1 },
          }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </IconButton>
        <Highlight
          theme={isDark ? themes.nightOwl : themes.nightOwlLight}
          code={code}
          language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre
              style={{
                margin: 0,
                padding: '16px',
                fontSize: 12,
                lineHeight: 1.7,
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                overflow: 'auto',
                background: 'transparent',
              }}>
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line, key: i })
                return (
                  <div key={i} {...lineProps}>
                    {line.map((token, j) => {
                      const tokenProps = getTokenProps({ token, key: j })
                      return <span key={j} {...tokenProps} />
                    })}
                  </div>
                )
              })}
            </pre>
          )}
        </Highlight>
      </Paper>
      {caption && (
        <Box
          component='span'
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: 11,
            color: 'text.secondary',
          }}>
          {caption}
        </Box>
      )}
    </Box>
  )
}

export { CodeBlock }
export type { CodeBlockProps, Language }
