// メッセージリスト + クイックサジェスト + タイピングインジケーター

import {
  Avatar, Box, Chip, CircularProgress, Typography, useTheme,
} from '@mui/material'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import CodeBlock, { CodeBlockPre } from '../CodeBlock'
import { QUICK_SUGGESTIONS } from '../faqDatabase'

import type { CurrentStoryContext, Message } from '../chatSupportTypes'
import type { StoryGuideEntry } from '../storyGuideMap'

interface ChatMessageListProps {
  messages: Message[]
  isTyping: boolean
  scrollRef: React.RefObject<HTMLDivElement | null>
  storyGuide: StoryGuideEntry | null
  currentStory: CurrentStoryContext | null | undefined
  hasUserMessages: boolean
  onSuggestionClick: (query: string) => void
}

export const ChatMessageList = ({
  messages,
  isTyping,
  scrollRef,
  storyGuide,
  hasUserMessages,
  onSuggestionClick,
}: ChatMessageListProps) => {
  const theme = useTheme()

  return (
    <Box
      ref={scrollRef}
      sx={{
        flexGrow: 1,
        px: 1.5,
        py: 1.5,
        overflowY: 'auto',
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(248,249,250,0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}>
      {messages.map((msg) => {
        const isUser = msg.sender === 'user'
        return (
          <Box
            key={msg.id}
            sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 0.75,
                maxWidth: '96%',
              }}>
              <Avatar
                sx={{
                  width: 28, height: 28, mt: 0.5, flexShrink: 0,
                  bgcolor: isUser ? 'secondary.main' : 'primary.light',
                  fontSize: 12,
                }}>
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </Avatar>
              <Box
                sx={{
                  px: 2, pt: '5px', pb: '4px',
                  minWidth: 0, overflow: 'hidden',
                  borderRadius: '12px',
                  borderTopLeftRadius: isUser ? '12px' : '2px',
                  borderTopRightRadius: isUser ? '2px' : '12px',
                  bgcolor: isUser
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(14,173,184,0.45)'
                      : 'primary.main'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'background.paper',
                  color: isUser ? 'primary.contrastText' : 'text.primary',
                  boxShadow: 'none',
                }}>
                {isUser ? (
                  <Typography
                    variant='body2'
                    sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 14 }}>
                    {msg.text}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word',
                      '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        mt: 2, mb: 1, lineHeight: 1.5, fontWeight: 600,
                      },
                      '& h1': { fontSize: 18 },
                      '& h2': { fontSize: 16 },
                      '& h3': { fontSize: 14 },
                      '& ul, & ol': { pl: 2.5, my: 1 },
                      '& li': { mb: 0.5 },
                      '& code': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.07)'
                            : 'rgba(0,0,0,0.06)',
                        px: 0.5, py: 0.25, border: 'none',
                        borderRadius: 0.5, fontSize: 12,
                        fontFamily: '"Fira Code", "Consolas", monospace',
                        lineHeight: 1.75,
                      },
                      '& pre': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(0,0,0,0.2)'
                            : 'rgba(0,0,0,0.04)',
                        p: 1.5, border: 'none', borderRadius: 1,
                        overflowX: 'auto', my: 1,
                        '& code': { bgcolor: 'transparent', border: 'none', px: 0, py: 0 },
                      },
                      '& blockquote': {
                        borderLeft: '3px solid', borderColor: 'divider',
                        pl: 1.5, ml: 0, my: 1, opacity: 0.85,
                      },
                      '& a': { color: 'primary.main', textDecoration: 'underline' },
                      '& table': {
                        borderCollapse: 'collapse', my: 1, width: '100%',
                        '& th, & td': {
                          border: '1px solid', borderColor: 'divider',
                          px: 1, py: 0.5, fontSize: 12,
                        },
                        '& th': {
                          fontWeight: 600,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.04)'
                              : 'rgba(0,0,0,0.03)',
                        },
                      },
                    }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock,
                        pre: CodeBlockPre,
                        a: ({ href, children: linkChildren }) => (
                          <a href={href} target='_blank' rel='noopener noreferrer'>
                            {linkChildren}
                          </a>
                        ),
                      }}>
                      {msg.text}
                    </ReactMarkdown>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )
      })}

      {/* クイックサジェスト（初回 + 非タイピング時） */}
      {!hasUserMessages && !isTyping && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5, ml: 4.5 }}>
          {storyGuide && (
            <>
              <Chip
                label='現在のページの解説'
                size='small'
                variant='outlined'
                onClick={() => onSuggestionClick('この画面の解説をお願いします')}
                sx={{
                  cursor: 'pointer', fontSize: 12,
                  borderColor: 'success.main', color: 'success.main',
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(76,175,80,0.08)'
                        : 'rgba(76,175,80,0.06)',
                    borderColor: 'success.main',
                  },
                }}
              />
              <Chip
                label='実装のポイント'
                size='small'
                variant='outlined'
                onClick={() => onSuggestionClick('この画面の実装のポイントを教えて')}
                sx={{
                  cursor: 'pointer', fontSize: 12,
                  borderColor: 'info.main', color: 'info.main',
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(29,175,194,0.08)'
                        : 'rgba(29,175,194,0.06)',
                    borderColor: 'info.main',
                  },
                }}
              />
            </>
          )}
          {QUICK_SUGGESTIONS.map((s) => (
            <Chip
              key={s.label}
              label={s.label}
              size='small'
              variant='outlined'
              onClick={() => onSuggestionClick(s.query)}
              sx={{
                cursor: 'pointer', fontSize: 12,
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(14,173,184,0.3)',
                color:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.6)'
                    : 'primary.main',
                '&:hover': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(14,173,184,0.06)',
                  borderColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.25)'
                      : 'primary.main',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* タイピングインジケーター */}
      {isTyping && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
          <CircularProgress size={14} />
          <Typography variant='caption' color='text.secondary'>
            AI回答中...
          </Typography>
        </Box>
      )}
    </Box>
  )
}
