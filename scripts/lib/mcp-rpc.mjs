/**
 * stdio の MCP サーバと JSON-RPC で会話する最小のクライアント。
 *
 * 見る側が 2 つある。
 * - `scripts/check-mcp.mjs`: `.mcp.json` に登録したサーバが動くか
 * - `scripts/check-mcp-package.mjs`: npm へ出す tarball が動くか
 *
 * どちらも「起動して、実際に 1 件引けるか」を見る。同じ手順なので共有する。
 */

/**
 * メッセージを順に送り、返ってきた JSON を全部集めて返す。
 *
 * **無言のまま終わるのが一番ありがちな失敗**なので必ず時間で打ち切る。
 * 待ち続けると CI がタイムアウトするまで理由が分からない。
 *
 * @param {import('node:child_process').ChildProcess} proc
 * @param {[number, object][]} messages `[送信までの ms, JSON-RPC メッセージ]`
 * @param {number} timeoutMs 収集を打ち切るまでの時間
 * @returns {Promise<object[]>} 受け取った JSON-RPC メッセージ
 */
export const rpc = (proc, messages, timeoutMs) =>
  new Promise((done) => {
    let buf = ''
    const seen = []
    proc.stdout.on('data', (d) => {
      buf += d
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const l of lines) {
        if (!l.trim()) continue
        try {
          seen.push(JSON.parse(l))
        } catch {
          /* 部分行は無視 */
        }
      }
    })
    for (const [delay, msg] of messages) {
      setTimeout(() => {
        try {
          proc.stdin.write(`${JSON.stringify(msg)}\n`)
        } catch {
          /* 相手が死んでいる */
        }
      }, delay)
    }
    setTimeout(() => done(seen), timeoutMs)
  })

/** initialize のリクエスト。クライアント名だけ差し替えられる */
export const initializeMessage = (id, clientName = 'kaze-check') => ({
  jsonrpc: '2.0',
  id,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: clientName, version: '1' },
  },
})

/** tools/call のリクエスト */
export const toolCallMessage = (id, name, args) => ({
  jsonrpc: '2.0',
  id,
  method: 'tools/call',
  params: { name, arguments: args },
})

/** tools/call の返答からテキストを取り出す。取れなければ空文字 */
export const textOf = (replies, id) =>
  replies.find((m) => m.id === id)?.result?.content?.[0]?.text ?? ''
