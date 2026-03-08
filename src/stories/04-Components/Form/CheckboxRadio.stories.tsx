import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/Form/Checkbox & Radio',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}
export default meta

/**
 * Checkbox の各状態
 */
export const CheckboxStory: StoryObj = {
  name: 'Checkbox',
  render: () => (
    <Stack spacing={1}>
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label='チェック済み'
      />
      <FormControlLabel control={<Checkbox />} label='未チェック' />
      <FormControlLabel
        control={<Checkbox defaultChecked disabled />}
        label='無効（チェック済み）'
      />
      <FormControlLabel
        control={<Checkbox disabled />}
        label='無効（未チェック）'
      />
      <FormControlLabel
        control={<Checkbox defaultChecked indeterminate />}
        label='不定状態'
      />
      <FormControlLabel
        control={<Checkbox color='error' defaultChecked />}
        label='エラーカラー'
      />
    </Stack>
  ),
}

/**
 * RadioGroup の基本
 */
const RadioDemo = () => {
  const [value, setValue] = useState('auto')

  return (
    <FormControl>
      <FormLabel>動作モード</FormLabel>
      <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
        <FormControlLabel value='auto' control={<Radio />} label='自動実行' />
        <FormControlLabel value='manual' control={<Radio />} label='手動操作' />
        <FormControlLabel
          value='hover'
          control={<Radio />}
          label='ホバリング'
        />
        <FormControlLabel
          value='emergency'
          control={<Radio disabled />}
          label='緊急着陸（無効）'
        />
      </RadioGroup>
    </FormControl>
  )
}

export const RadioStory: StoryObj = {
  name: 'Radio',
  render: () => <RadioDemo />,
}
