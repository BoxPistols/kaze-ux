/**
 * 操作対象の寸法を測る（WCAG 2.2 SC 2.5.8 / Level AA）
 *
 * 基準は 24x24 CSS px。44x44 は SC 2.5.5 (AAA) なのでここでは見ない。
 *
 * **除外は「クラス名の許可リスト」でなく性質で決める。**
 * 名前で外すと、同じ性質の別の部品が入ってきたときに素通りする。
 * 最初に雑に測ったときは 170 箇所、次に 52 箇所と出たが、
 * どちらも下の除外が足りず、実際の不具合は 25 箇所だった。
 *
 * 除外する性質:
 * - 非表示 (display/visibility/opacity 0)
 * - 操作できない (pointer-events:none / disabled / aria-disabled)
 * - 支援技術からもキーボードからも到達しない (aria-hidden かつ tabindex<0)
 *   → MUI X の値保持用 input (1x1) がこれに当たる
 * - アニメーション実行中（寸法が確定していない）
 *   → 全 story に注入される ChatSupport の FAB がこれに当たる
 * - 0x0（非表示の祖先の中にある）
 * - 文中のインラインリンク（SC 2.5.8 の明示的な例外）
 *
 * この関数は page.evaluate に渡してブラウザ内で走る。外の変数を参照しない
 */
export const TAP_TARGET_AUDIT = (min) => {
  const SELECTOR = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="checkbox"]',
    '[role="switch"]',
    '[role="menuitem"]',
  ].join(',')

  const out = []
  let total = 0

  for (const el of document.querySelectorAll(SELECTOR)) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (Number(cs.opacity) === 0 || cs.pointerEvents === 'none') continue
    if (el.hasAttribute('disabled')) continue
    if (el.getAttribute('aria-disabled') === 'true') continue
    // 支援技術から隠され、かつキーボードでも到達しないものは操作対象ではない
    if (el.getAttribute('aria-hidden') === 'true' && el.tabIndex < 0) continue
    if (
      el.getAnimations &&
      el.getAnimations().some((a) => a.playState === 'running')
    )
      continue

    const r = el.getBoundingClientRect()
    // 0x0 は非表示の祖先の中にある
    if (r.width === 0 || r.height === 0) continue

    // 文中のインラインリンクは SC 2.5.8 の例外
    if (el.tagName === 'A' && cs.display.startsWith('inline')) continue

    total++
    if (r.width >= min && r.height >= min) continue

    out.push({
      w: Math.round(r.width),
      h: Math.round(r.height),
      label: `${el.tagName}${
        el.className && typeof el.className === 'string'
          ? '.' + el.className.split(' ').slice(0, 2).join('.')
          : ''
      }`,
      text: (el.textContent || el.getAttribute('aria-label') || '')
        .trim()
        .slice(0, 20),
    })
  }

  return { fails: out, total }
}
