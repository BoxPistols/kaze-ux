# Security Policy / セキュリティ方針

## Reporting a vulnerability / 脆弱性の報告

**Please do not open a public issue for security problems.**
Use [GitHub Security Advisories](https://github.com/BoxPistols/kaze-ux/security/advisories/new)
so the report stays private until a fix is available.

セキュリティに関わる問題は **公開 Issue を立てないでください**。
上記の GitHub Security Advisories から非公開で報告してください。

Please include: what you found, how to reproduce it, and the affected version.
We aim to acknowledge within a few days.

## Scope / 範囲

This repository ships three things that can affect a consumer's machine:

| Component               | What it does                                | Risk surface                                             |
| ----------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `kaze-mcp` (MCP server) | Reads local data files, answers over stdio  | Local file reads only. **No network access, no writes**  |
| Claude Code plugin      | Installs skills, a review agent, and a hook | The hook runs `hooks/check-prohibited.mjs` on file edits |
| Storybook / demo apps   | Documentation and examples                  | Static hosting                                           |

The MCP server does not make network requests and does not write files.
It reads the design-system data files described in [`DESIGN.md`](DESIGN.md).

## What we check automatically / 自動で検査していること

Security-relevant checks run in CI on every pull request:

| Check                  | Command                 | What it catches                                           |
| ---------------------- | ----------------------- | --------------------------------------------------------- |
| Secret scanning        | Gitleaks + `check:live` | Credentials in the repository and in **deployed bundles** |
| Dependency scanning    | Trivy (SCA)             | Known vulnerabilities in dependencies                     |
| Anonymity of artifacts | `pnpm check:anon`       | Personal contact details leaking into shared builds       |

`check:live` exists because a real API key was once served in a production
Storybook bundle while source-only scans stayed green. Scanning the source is
not the same as scanning what is actually shipped.

## Supported versions / サポート対象

The latest `main` and the most recent `kaze-mcp` release on npm.
This project has no long-term support branches.
