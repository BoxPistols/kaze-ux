import {
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Stepper> = {
  title: 'Components/UI/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    activeStep: {
      control: { type: 'number', min: 0 },
      description: '現在のアクティブステップ',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'ステッパーの向き',
    },
    alternativeLabel: {
      control: 'boolean',
      description: 'ラベルをステップアイコンの下に配置',
    },
    nonLinear: { control: 'boolean', description: '非線形ステッパー' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3, maxWidth: 900 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta

const steps = ['フライト設定', 'ルート作成', '安全確認', '承認申請', '完了']

const StepperDemo = () => {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Stack direction='row' spacing={2} justifyContent='center'>
          <Button
            variant='outlined'
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}>
            戻る
          </Button>
          <Button
            variant='contained'
            disabled={activeStep === steps.length - 1}
            onClick={() => setActiveStep((prev) => prev + 1)}>
            次へ
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}

export const Default: StoryObj<typeof Stepper> = {
  render: () => <StepperDemo />,
}
