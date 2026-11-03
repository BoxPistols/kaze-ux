/**
 * Storybook のキーボードショートカットを、閲覧者の OS の表記で出す。
 *
 * ## なぜ要るか
 *
 * 以前は Mac 記号（⌥ ⌘ ⇧）を直書きし、「Windows では Ctrl / Alt」と注記して
 * いた。**利用者の大半が Windows なので、これは順序が逆**。馴染みのない記号を
 * 毎回読み替えさせることになる。
 *
 * ## 単一ソース
 *
 * キーの定義はここだけに置き、表示は OS から導出する。命名は Storybook の
 * `defaultShortcuts` のコマンド名に揃えてあり、`pnpm check:shortcuts` が
 * **キーごとに** 突き合わせる。名前が合っていないと検査が落ちる。
 */

/** `ctrlOrMeta` は OS で Ctrl / Command に分かれる。他は Storybook のキー名 */
export type ShortcutTokens = readonly string[]

/**
 * Storybook 10 の既定値。`pnpm check:shortcuts` が実物と照合する。
 * ここを手で変えても、実物と違えば CI が止める。
 */
export const STORYBOOK_SHORTCUTS: Record<string, ShortcutTokens> = {
  search: ['ctrlOrMeta', 'K'],
  fullScreen: ['alt', 'F'],
  toggleNav: ['alt', 'S'],
  togglePanel: ['alt', 'A'],
  panelPosition: ['alt', 'D'],
  toolbar: ['alt', 'T'],
  prevComponent: ['alt', 'ArrowUp'],
  nextComponent: ['alt', 'ArrowDown'],
  prevStory: ['alt', 'ArrowLeft'],
  nextStory: ['alt', 'ArrowRight'],
  shortcutsPage: ['ctrlOrMeta', 'shift', ','],
  collapseAll: ['ctrlOrMeta', 'shift', 'ArrowUp'],
}

type NavigatorWithUaData = Navigator & {
  userAgentData?: { platform?: string }
}

/**
 * Mac 系かどうか。**判定できないときは Windows 表記に倒す。**
 * 利用者の大半が Windows なので、外したときの損が小さい側を既定にする。
 */
export const isMacLike = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as NavigatorWithUaData
  const platform =
    nav.userAgentData?.platform || navigator.platform || navigator.userAgent
  return /mac|iphone|ipad|ipod/i.test(platform)
}

const MAC_SYMBOL: Record<string, string> = {
  ctrlOrMeta: '⌘',
  alt: '⌥',
  shift: '⇧',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
}

const WIN_LABEL: Record<string, string> = {
  ctrlOrMeta: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
}

/**
 * トークン列を表示用の文字列にする。
 *
 * Mac は記号を空白で連ねる（`⌥ S`）。Windows / Linux は語を `+` で繋ぐ
 * （`Alt + S`）。それぞれの OS で見慣れた形。
 */
export const formatShortcut = (
  tokens: ShortcutTokens,
  mac: boolean
): string => {
  const map = mac ? MAC_SYMBOL : WIN_LABEL
  const parts = tokens.map((t) => map[t] ?? t.toUpperCase())
  return mac ? parts.join(' ') : parts.join(' + ')
}

/** コマンド名から表示文字列。未知の名前は開発時に気づけるよう例外にする */
export const shortcutLabel = (command: string, mac: boolean): string => {
  const tokens = STORYBOOK_SHORTCUTS[command]
  if (!tokens) {
    throw new Error(
      `未知のショートカット: ${command}。STORYBOOK_SHORTCUTS に追加してください`
    )
  }
  return formatShortcut(tokens, mac)
}
