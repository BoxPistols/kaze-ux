/**
 * ステータス色マッピングユーティリティ
 * 各ドメインのステータスに対応するMUIカラーを返す
 */

/** MUI Chipコンポーネントで使用可能な色型 */
export type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'

/**
 * ドローンの飛行状態に対応する色を取得
 * @param status ドローンの状態（飛行中、待機中、オフライン等）
 * @returns MUI Chipコンポーネント用の色
 */
export const getDroneStatusColor = (status: string): ChipColor => {
  switch (status) {
    case '飛行中':
      return 'success'
    case '待機中':
      return 'info'
    case 'オフライン':
      return 'default'
    default:
      return 'default'
  }
}

/**
 * プロジェクトの進捗状態に対応する色を取得
 * @param status プロジェクトの状態（進行中、計画中、完了等）
 * @returns MUI Chipコンポーネント用の色
 */
export const getProjectStatusColor = (status: string): ChipColor => {
  switch (status) {
    case '進行中':
      return 'primary'
    case '計画中':
      return 'warning'
    case '完了':
      return 'success'
    default:
      return 'default'
  }
}
