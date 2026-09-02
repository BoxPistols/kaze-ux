/**
 * 予定フォームの検証と表示のうち、画面から切り離せる部分。
 *
 * どちらも壊れても画面は出る。片方は無反応、もう片方は数字が静かに
 * ずれるという壊れ方をするので、テストが無いと気づけない。
 */

/**
 * `HH:mm`（00:00〜23:59）か。
 *
 * dayjs の既定の解析は緩く、`2026-03-08T25:99` を isValid: true として
 * 3/9 01:39 に読み替える。`2026-03-08T`（時刻が空）も true になり、
 * 日付の 0 時として通ってしまう。**検証を解析器の寛容さに預けない。**
 *
 * 入力欄は type='time' なのでブラウザは形式を守らせるが、値を空にする
 * ことはできる。空のまま `${date}T${time}` を new Date に渡していたのが
 * RangeError: Invalid time value の原因だった（onClick の中の throw なので
 * ダイアログは開いたまま、予定も作られず、画面には何も出ない）。
 */
export const isTimeOfDay = (value: string): boolean =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value)

/**
 * 予定の長さを表示用の文字列にする。
 *
 * 以前は時間側に下限を掛けていた。
 *
 *   mins > 0 ? `${Math.max(hours, 1)}h ${mins}m` : `${Math.max(hours, 1)}h`
 *
 * 下限そのものは「1 時間未満の予定が 0h と出るのを避ける」ためのもので、
 * mins === 0 の側だけを見れば意図は通っている。問題は同じ下限を
 * mins > 0 の側にも掛けていたことで、**0 時間 30 分が 1h 30m になる**。
 * 1 時間未満は分だけで出す。
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  // 0 分の予定を 0m と出さない。表示上は最小 1 分として扱う
  if (hours === 0) return `${Math.max(mins, 1)}m`
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
