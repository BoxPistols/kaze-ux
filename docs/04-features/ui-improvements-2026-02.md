# UI改善実装ログ（2026年2月）

このドキュメントは、2026年2月に実装されたUI改善とバグ修正をまとめたものです。

## 目次

- [スケジュールページ](#スケジュールページ)
- [モニタリングページ](#モニタリングページ)
- [プロジェクトページ](#プロジェクトページ)
- [共通コンポーネント](#共通コンポーネント)

---

## スケジュールページ

**対象ファイル**: `src/pages/SchedulePage.tsx`

### 実装された改善

#### 1. カレンダービューのレイアウト最適化

**問題**: カレンダービューに不要な余白があり、画面スペースを有効活用できていなかった。

**解決策**:

- Flexレイアウトを採用して余白を削除
- 動的な高さ計算: `calc(100vh - 240px)`で画面を最大限活用
- MonthView、WeekView、DayViewすべてで統一されたスクロール動作

```tsx
// 修正前
<Grid container spacing={3} alignItems='flex-start'>
  {/* カレンダーにflex設定なし */}
</Grid>

// 修正後
<Grid container spacing={3} alignItems='stretch' sx={{ height: 'calc(100vh - 240px)' }}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {/* カレンダー本体 */}
    </Box>
  </Card>
</Grid>
```

#### 2. テーブルビューの機能強化

**問題**: テーブルにフィルター、ページネーション、実際に動作するソート機能がなかった。

**実装された機能**:

##### a. フィルター機能

- **種別フィルター**: 点検/整備/飛行で絞り込み
- **ステータスフィルター**: 予定/確認中/完了で絞り込み
- **リアルタイム件数表示**: フィルター結果の件数を表示

```tsx
<FormControl size='small' sx={{ minWidth: 120 }}>
  <InputLabel>種別</InputLabel>
  <Select
    value={filterType}
    label='種別'
    onChange={(e) => {
      setFilterType(e.target.value)
      setPage(0) // ページをリセット
    }}>
    <MenuItem value='all'>すべて</MenuItem>
    <MenuItem value='点検'>点検</MenuItem>
    <MenuItem value='整備'>整備</MenuItem>
    <MenuItem value='飛行'>飛行</MenuItem>
  </Select>
</FormControl>
```

##### b. ソート機能

- タイトルと日付でソート可能
- 昇順/降順の切り替え
- 実際に動作するソートロジックを実装

```tsx
const getFilteredAndSortedSchedules = () => {
  let filtered = [...mockSchedules]

  // フィルター適用
  if (filterType !== 'all') {
    filtered = filtered.filter((s) => s.type === filterType)
  }

  // ソート適用
  filtered.sort((a, b) => {
    let aValue: string | number = ''
    let bValue: string | number = ''

    switch (sortField) {
      case 'title':
        aValue = a.title
        bValue = b.title
        break
      case 'date':
        aValue = `${a.date} ${a.time}`
        bValue = `${b.date} ${b.time}`
        break
    }

    return sortDirection === 'asc'
      ? aValue > bValue
        ? 1
        : -1
      : aValue < bValue
        ? 1
        : -1
  })

  return filtered
}
```

##### c. ページネーション

- MUI TablePaginationコンポーネントを使用
- 表示件数の選択: 10/25/50/100件
- 日本語ラベル表示

```tsx
<TablePagination
  component='div'
  count={filteredSchedules.length}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[10, 25, 50, 100]}
  labelRowsPerPage='表示件数:'
  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}件`}
/>
```

#### 3. カードビューの改善

- スクロール対応: `maxHeight: 'calc(100vh - 280px)'`
- フィルター適用: テーブルビューと同じフィルター結果を表示

### パフォーマンス最適化

- `useMemo`と`useCallback`を使用してレンダリングを最適化
- フィルター変更時は自動的にページ1にリセット

---

## モニタリングページ

**対象ファイル**: `src/pages/MonitoringPage.tsx`

### 実装された改善

#### 1. アラートパネルの統合

**問題**: アラートパネルが「統合予定」のままで、実装されていなかった。

**解決策**:

- `UTMEnhancedAlertPanel`を統合
- 現在のサイトのドローンのアラートのみを表示するフィルタリング機能を実装

```tsx
// MonitoringContent内
const { activeDrones, setSelectedDroneId } = useMonitoringSite()
const activeDroneIds = activeDrones.map((d) => d.droneId)

<UTMEnhancedAlertPanel
  height='100%'
  droneIds={activeDroneIds}  // 現在のサイトのドローンIDを渡す
  onDroneSelect={(droneId) => setSelectedDroneId(droneId)}
/>
```

#### 2. サイトフィルタリング機能

**問題**: 監視対象でない機体からアラートが表示されていた。

**解決策**:

- `UTMEnhancedAlertPanel`に`droneIds`プロパティを追加
- 指定されたドローンIDのアラートのみを表示

```tsx
// UTMEnhancedAlertPanel.tsx
export interface UTMEnhancedAlertPanelProps {
  droneIds?: string[] // フィルター対象のドローンID配列
  // ...
}

// フィルタリングロジック
const filteredAlerts = useMemo(() => {
  return sortedAlerts.filter((alert) => {
    // ドローンIDフィルター
    if (droneIds && droneIds.length > 0) {
      if (!droneIds.includes(alert.droneId)) {
        return false
      }
    }
    // その他のフィルター...
  })
}, [alerts, droneIds, selectedSeverity, selectedType, searchQuery])
```

### ユーザー体験の向上

- アラートクリック時にドローンを自動選択
- マルチサイト環境でサイト切り替え時に適切なアラートのみ表示
- リアルタイムフィルタリング

---

## プロジェクトページ

**対象ファイル**: `src/pages/ProjectPage.tsx`

### 実装された改善

#### 1. アコーディオン機能の追加

**問題**: 「今日の予定」と「よく使うプロジェクト」セクションが常に展開されており、テーブルビューを優先したい。

**解決策**:

- MUI Accordionコンポーネントで各セクションを折りたたみ可能に
- LocalStorageで開閉状態を永続化
- デフォルトは閉じた状態でテーブルを優先

```tsx
// localStorage キー定義
const STORAGE_KEY_TODAY_SCHEDULE = 'projectPage-todaySchedule-expanded'
const STORAGE_KEY_FREQUENT_PROJECTS = 'projectPage-frequentProjects-expanded'

// 状態管理
const [isTodayScheduleExpanded, setIsTodayScheduleExpanded] = useState(false)
const [isFrequentProjectsExpanded, setIsFrequentProjectsExpanded] =
  useState(false)

// localStorage から復元
useEffect(() => {
  try {
    const todayScheduleState = localStorage.getItem(STORAGE_KEY_TODAY_SCHEDULE)
    if (todayScheduleState !== null) {
      setIsTodayScheduleExpanded(JSON.parse(todayScheduleState))
    }
  } catch (error) {
    console.warn('Failed to load accordion state from localStorage:', error)
  }
}, [])

// 変更時に保存
const handleTodayScheduleChange = (_: unknown, isExpanded: boolean) => {
  setIsTodayScheduleExpanded(isExpanded)
  try {
    localStorage.setItem(STORAGE_KEY_TODAY_SCHEDULE, JSON.stringify(isExpanded))
  } catch (error) {
    console.warn('Failed to save accordion state to localStorage:', error)
  }
}
```

#### 2. エラーハンドリング

- localStorageの読み書き失敗時も動作継続
- try-catchでエラーをキャッチしコンソールに警告表示

### UXの考慮点

- デフォルト閉じた状態でテーブルを優先表示
- ユーザーの開閉設定を永続化してリロード後も維持
- アコーディオンのスタイルを統一

---

## 共通コンポーネント

### UTMEnhancedAlertPanel

**対象ファイル**: `src/components/utm/UTMEnhancedAlertPanel.tsx`

#### 1. フィルターUIの改善

**問題**: フィルター行のレイアウトが崩れていた。

**解決策**:

- Selectコンポーネントに`flex: 1`を追加して均等幅に
- 最小幅を100pxに統一
- パディングとスペーシングを増加
- アイコンサイズを統一

```tsx
// 修正前
<Select
  size='small'
  sx={{
    minWidth: 80,
    height: 28,
    fontSize: '0.7rem',
  }}
/>

// 修正後
<Select
  size='small'
  sx={{
    flex: 1,
    minWidth: 100,
    fontSize: '0.75rem',
    '& .MuiSelect-select': {
      py: 0.75,
      px: 1.5,
    },
  }}
/>
```

#### 2. ドローンフィルタリング機能

新しいプロパティ `droneIds` を追加:

```tsx
export interface UTMEnhancedAlertPanelProps {
  droneIds?: string[] // フィルター対象のドローンID配列
  // ...
}
```

**使用例**:

```tsx
// 全アラート表示
<UTMEnhancedAlertPanel />

// 特定のドローンのアラートのみ表示
<UTMEnhancedAlertPanel
  droneIds={['drone-001', 'drone-002']}
/>
```

---

## データ更新

### モックデータの日付更新

全モックデータの日付を現在（2026-02）に更新:

- `src/pages/SchedulePage.tsx`: スケジュールデータ
- `src/mocks/utmWorkflowMocks.ts`: NOTAM番号（/24 → /26）
- `src/mocks/utmMultiDroneScenarios.ts`: NOTAM参照
- `src/pages/ProjectDetailPage.tsx`: プロジェクト作成日

---

## テスト方針

### 手動テスト項目

#### スケジュールページ

- [ ] カレンダービューで余白がないことを確認
- [ ] 月/週/日ビューすべてでスクロールが正常に動作
- [ ] フィルターで種別・ステータスの絞り込みが動作
- [ ] ソートでタイトル・日付の並び替えが動作
- [ ] ページネーションで10/25/50/100件表示が動作
- [ ] フィルター変更時にページがリセットされる

#### モニタリングページ

- [ ] アラートパネルが表示される
- [ ] サイト切り替え時に表示アラートが変わる
- [ ] アラートクリック時にドローンが選択される
- [ ] 監視対象外のドローンのアラートが表示されない

#### プロジェクトページ

- [ ] アコーディオンの開閉が動作
- [ ] ページリロード後も開閉状態が維持される
- [ ] デフォルトで閉じた状態

### 自動テスト

今後追加予定:

- フィルター・ソート・ページネーションロジックのユニットテスト
- localStorage永続化のテスト
- アラートフィルタリングのテスト

---

## パフォーマンス

### 最適化手法

1. **メモ化**:
   - `useMemo`でフィルタリング・ソート結果をメモ化
   - 依存配列を適切に設定して不要な再計算を防止

2. **仮想化** (今後検討):
   - テーブルやカードビューで大量データを扱う場合は`react-window`の導入を検討

3. **遅延読み込み**:
   - ページネーションにより初期表示データ量を制限

---

## アクセシビリティ

### 対応済み

- TableSortLabelでソート方向を視覚的に表示
- フィルターとページネーションに適切なラベル
- MUIコンポーネントのデフォルトアクセシビリティ機能を活用

### 今後の改善

- キーボードナビゲーションのテスト
- スクリーンリーダー対応の検証
- ARIAラベルの追加

---

## 既知の制限事項

1. **モックデータ**:
   - 現在は静的なモックデータを使用
   - 実際のAPIとの統合時にフィルター・ソートロジックの調整が必要

2. **ページネーション**:
   - クライアントサイドページネーション
   - 大量データの場合はサーバーサイドページネーションへの移行を検討

3. **リアルタイム更新**:
   - アラートのリアルタイム更新は現在未実装
   - WebSocketまたはポーリングの実装が必要

---

## 今後の拡張予定

### スケジュールページ

- [ ] 日付範囲フィルター
- [ ] エクスポート機能（CSV、PDF）
- [ ] ドラッグ&ドロップでスケジュール編集

### モニタリングページ

- [ ] アラート音声通知
- [ ] アラート履歴のエクスポート
- [ ] カスタムアラートルールの設定

### プロジェクトページ

- [ ] プロジェクト検索機能
- [ ] バルク操作（複数選択・一括削除）
- [ ] カスタムビュー保存

---

**最終更新**: 2026年2月1日
