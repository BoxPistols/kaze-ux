# AI Agent Integration Guide / AIエージェント統合ガイド (AGENTS.md)

## 1. Core Principle: Single Source of Truth / 中核原則

This project consolidates all development rules and guidelines into a single file for consistency and maintainability.

**Primary Reference: `AI_DEVELOPMENT_RULES.md`**

All AI agents must reference `AI_DEVELOPMENT_RULES.md` as the **Single Source of Truth** for:

- Project overview (Kaze UX Design System)
- Tech stack (MUI v7, Tailwind CSS v3, TypeScript, React, Storybook)
- Project structure
- Key commands
- Coding standards and guidelines
- Development workflow
- Troubleshooting

## 2. How to Use This File / このファイルの使用方法

This `AGENTS.md` file serves as a lightweight entry point for generic AI agents (e.g., OpenAI GPT models). Its primary purpose is to direct agents to the correct unified documentation.

## 3. Instructions for AI Agents / AIエージェント向け指示

When starting a development task, follow these steps:

1. **Read `AI_DEVELOPMENT_RULES.md` first.** This is mandatory.
2. Understand the project's core principles, commands, and structure from that file.
3. For Claude Code-specific settings, refer to `.claude/CLAUDE.md`.
4. For technology-specific details (MUI v7 components, Storybook, theme customization), refer to Skills in the `.claude/skills/` directory:
   - `mui-v7-component.md` - MUI v7 component creation guide
   - `storybook-story.md` - Storybook story creation guide
   - `theme-customization.md` - Theme customization guide
5. Ensure all generated code strictly complies with the rules in `AI_DEVELOPMENT_RULES.md`.

## 4. AI Integration System Overview / AI統合開発システム概要

This project adopts an integrated system where multiple AI agents collaborate on development.

### Key Integration Points / 主要統合ポイント

1. **Unified rule management**: All AI agents follow the same development principles
2. **Technology specialization**: Optimized support for MUI v7, Tailwind CSS, Storybook, etc.
3. **Automated quality assurance**: Zero ESLint errors, strict type safety
4. **Component quality improvement**: Automatic accessibility and responsive design checks

### AI Agent Roles / AIエージェントの役割

- **Claude Code**: Main development assistant, comprehensive component implementation
- **Cursor**: IDE integration agent, inline completion and refactoring support
- **GitHub Copilot**: Code completion agent, pattern learning and suggestions
- **Other AI**: General completion, code review, documentation generation

## 5. Development Constraints / 開発制約事項

### Mandatory Rules / 必須遵守事項

- **No emoji**: Do not use emoji in any code, comments, or commit messages
- **Bilingual**: Comments and docs in Japanese, code in English
- **MUI v7 new API**: Use `<Grid size={{ xs: 12 }}>` format for Grid component
- **TypeScript strict mode**: `any` type is prohibited, strict type definitions required
- **pnpm only**: npm commands are prohibited
- **Zero ESLint errors**: Maintain lint-error-free state across all code

### Prohibited Practices / 禁止事項

- `any` type usage (document reason in comments if absolutely necessary)
- Old MUI Grid API (`item xs={12}` format)
- npm commands
- console.log remnants
- Emoji usage

## 6. Startup Message / 起動メッセージ

```text
Kaze UX Design System AI agent activated.

IMPORTANT: All development rules are consolidated in AI_DEVELOPMENT_RULES.md.
This file is the Single Source of Truth. Read it before starting work.

Key instructions:
1. Strictly follow AI_DEVELOPMENT_RULES.md guidelines.
2. Maintain zero ESLint errors.
3. Use MUI v7 new Grid API.
4. Comply with TypeScript strict mode.
5. Do not use emoji.
6. Japanese comments, English code.

Proceeding with high-quality UI component development based on unified rules.
```

## 7. Troubleshooting / トラブルシューティング

### Common Issues / よくある問題

| Issue                           | Solution                                                 |
| :------------------------------ | :------------------------------------------------------- |
| **Rules unclear**               | Check `AI_DEVELOPMENT_RULES.md`                          |
| **MUI v7 API unknown**          | See `.claude/skills/mui-v7-component.md`                 |
| **Storybook writing unclear**   | See `.claude/skills/storybook-story.md`                  |
| **Theme customization unknown** | See `.claude/skills/theme-customization.md`              |
| **Type errors unresolvable**    | Check TypeScript strict mode and AI_DEVELOPMENT_RULES.md |

## 8. References / 参考リンク

- [AI_DEVELOPMENT_RULES.md](./AI_DEVELOPMENT_RULES.md) - Unified development rules
- [.claude/CLAUDE.md](./.claude/CLAUDE.md) - Claude Code settings
- [.claude/skills/](./.claude/skills/) - Technology-specific Skills guides
- [MUI v7 Documentation](https://mui.com/material-ui/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
