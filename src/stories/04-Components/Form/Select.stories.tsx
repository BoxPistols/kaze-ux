import {
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import type { SelectChangeEvent } from '@mui/material'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { MultipleSelect } from '@/components/Form/MultipleSelect'
import {
  MultiSelectAutocomplete,
  type OptionType,
} from '@/components/Form/MultiSelectAutocomplete'
import { SimpleSelect } from '@/components/Form/SimpleSelect'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * セレクトボックス関連コンポーネントのまとめ。
 * MUI標準からプロジェクト固有のラッパーまで、用途に合わせて選択してください。
 */
const meta: Meta = {
  title: 'Components/Form/Select',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
}
export default meta

// --- 共通データ ---
const droneModels = [
  { value: 'phantom4', label: 'Phantom 4 RTK' },
  { value: 'mavic3', label: 'Mavic 3 Enterprise' },
  { value: 'matrice300', label: 'Matrice 300 RTK' },
  { value: 'matrice350', label: 'Matrice 350 RTK' },
  { value: 'inspire3', label: 'Inspire 3' },
]

const prefectures = ['東京都', '神奈川県', '千葉県', '埼玉県', '大阪府']

const memberOptions: OptionType[] = [
  { value: 'user1', label: '山田太郎' },
  { value: 'user2', label: '佐藤花子' },
  { value: 'user3', label: '鈴木一郎' },
  { value: 'user4', label: '田中美咲' },
  { value: 'user5', label: '高橋健二' },
  { value: 'user6', label: '伊藤さくら' },
]

// --- Render Components (フックを使うためコンポーネントとして定義) ---

const MUIBaseRender = () => {
  const [value, setValue] = useState('')
  return (
    <Stack spacing={3}>
      <FormControl fullWidth size='small'>
        <InputLabel>ドローン機種</InputLabel>
        <Select
          value={value}
          onChange={(e: SelectChangeEvent) => setValue(e.target.value)}
          label='ドローン機種'>
          {droneModels.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>使用するドローンの機種</FormHelperText>
      </FormControl>
    </Stack>
  )
}

const SimpleRender = (args: Record<string, unknown>) => {
  const [value, setValue] = useState('')
  return (
    <SimpleSelect
      {...args}
      items={prefectures}
      value={value}
      onChange={setValue}
    />
  )
}

const MultipleRender = (args: Record<string, unknown>) => {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <MultipleSelect
      {...args}
      items={prefectures}
      selectedItems={selected}
      onSelectedItemsChange={setSelected}
    />
  )
}

const MUIAutocompleteRender = () => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <Autocomplete
      value={value}
      onChange={(_e, v) => setValue(v)}
      options={prefectures}
      renderInput={(params) => (
        <TextField
          {...params}
          label='運航拠点'
          placeholder='拠点名を検索'
          size='small'
        />
      )}
    />
  )
}

// --- Stories ---

/** MUI標準のSelectコンポーネントを使用した実装例 */
export const MUIBase: StoryObj = {
  name: 'MUI Standard Select',
  render: () => <MUIBaseRender />,
}

/** 文字列配列を渡すだけのシンプルなラッパー */
export const Simple: StoryObj<typeof SimpleSelect> = {
  name: 'SimpleSelect (Wrapper)',
  render: (args) => <SimpleRender {...args} />,
  args: {
    label: '都道府県',
    size: 'small',
  },
}

/** ツールチップや必須マークなどの装飾が付いた高機能版 */
export const Custom: StoryObj<typeof CustomSelect> = {
  name: 'CustomSelect (Rich)',
  render: (args) => <CustomSelect {...args} options={droneModels} />,
  args: {
    label: 'ドローン選択',
    placeholder: '選択してください',
    size: 'small',
    tooltip: '運用に使用する機体を選択してください',
  },
}

/** チェックボックス付きの複数選択 */
export const Multiple: StoryObj<typeof MultipleSelect> = {
  name: 'MultipleSelect (Checkbox)',
  render: (args) => <MultipleRender {...args} />,
  args: {
    label: '対象地域',
    size: 'small',
  },
}

/** 検索・フィルタリング可能な複数選択（Autocompleteベース） */
export const MultiAutocomplete: StoryObj<typeof MultiSelectAutocomplete> = {
  name: 'MultiSelectAutocomplete (Searchable)',
  render: (args) => (
    <MultiSelectAutocomplete {...args} options={memberOptions} />
  ),
  args: {
    label: 'メンバー選択',
    placeholder: 'メンバーを検索...',
    size: 'small',
  },
}

/** MUI標準のAutocompleteコンポーネントを使用した実装例 */
export const MUIAutocomplete: StoryObj = {
  name: 'MUI Standard Autocomplete',
  render: () => <MUIAutocompleteRender />,
}
