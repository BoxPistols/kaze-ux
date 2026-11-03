/**
 * マーカーの選択状態が「前回から変わったか」を判定する。
 *
 * LiveMap は差分検出で、変わったドライバーのマーカーだけ塗り直す。
 * 以前はここを
 *
 *   const prevSelected = prev ? prev.driverId === selectedDriverId : false
 *
 * と書いていた。`prev` は同じ driverId で引いた前回の位置なので
 * `prev.driverId === dp.driverId` が常に成り立ち、この式は isSelected に
 * 縮退する。つまり selectionChanged は常に false で、**選択時の強調は
 * 一度も適用されない**（ステータスが変わったときに巻き込みで反映される
 * ことはある）。比べる相手は前回の位置ではなく、前回の selectedDriverId。
 */
export const selectionChanged = (
  driverId: string,
  selectedId: string | null,
  prevSelectedId: string | null
): boolean => (driverId === selectedId) !== (driverId === prevSelectedId)
