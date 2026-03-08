// CustomTextField
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import {
  TextField,
  type TextFieldProps,
  Tooltip,
  useTheme,
} from '@mui/material'
import { FormControl, InputLabel } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { CSSProperties } from 'react'

type CustomTextFieldProps = TextFieldProps & {
  label: string
  tooltip?: string
  helperText?: string
  required?: boolean
  error?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  id?: string
  name?: string
  placeholder?: string
}

const StyledFormControl = styled(FormControl)({
  width: '100%',
})

const StyledInputLabel = styled(InputLabel, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'size',
})<{ error?: boolean }>(({ theme, error }) => ({
  position: 'static',
  transform: 'none',
  transition: 'none',
  pointerEvents: 'auto',
  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',
  alignSelf: 'start',
  fontWeight: 'bold',
  marginBottom: '4px',
  color: error ? theme.palette.error.main : 'inherit',
}))

const RequiredMark = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginRight: theme.spacing(1),
  marginLeft: 0,
  fontSize: '1.2em',
  lineHeight: '1.25',
}))

const TooltipIcon = styled(HelpOutlineOutlinedIcon)<{
  size?: 'small' | 'medium'
}>(({ size }) => ({
  fontSize: size === 'small' ? '0.875rem' : '1rem',
  marginLeft: '4px',
  color: 'inherit',
}))

const CustomTextField = ({
  label,
  InputProps,
  inputProps,
  required,
  tooltip,
  error,
  name,
  size = 'medium',
  fullWidth = false,
  placeholder = '入力してください',
  ...props
}: CustomTextFieldProps) => {
  const theme = useTheme()
  const inputId =
    props.id || `custom-textfield-${label.replace(/\s+/g, '-').toLowerCase()}`
  const inputName = name || inputId

  return (
    <StyledFormControl>
      <StyledInputLabel
        shrink
        htmlFor={inputId}
        error={error}
        size={size as 'small' | undefined}
        sx={{
          lineHeight: size === 'small' ? '1.5' : '1.75',
          color: theme.palette.text.primary,
          marginBottom: 0,
        }}>
        {required && (
          <RequiredMark
            aria-hidden='true'
            sx={{
              fontSize: size === 'small' ? '1.3em' : '1.5em',
              mr: 1,
              ml: 0,
              lineHeight: '1.25',
              color: theme.palette.error.main,
            }}>
            *
          </RequiredMark>
        )}
        {label}
        {tooltip && (
          <Tooltip
            title={tooltip}
            arrow
            sx={{
              fontSize: size === 'small' ? '1.3em' : '1.5em',
              // color: theme.palette.text.secondary,
            }}>
            <TooltipIcon aria-label={`${label}についてのヘルプ`} size={size} />
          </Tooltip>
        )}
      </StyledInputLabel>
      <TextField
        {...props}
        name={inputName}
        id={inputId}
        fullWidth={fullWidth}
        error={error}
        required={required}
        size={size}
        placeholder={placeholder}
        aria-required={required ? 'true' : 'false'}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={tooltip ? `${inputId}-tooltip` : undefined}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          ...InputProps,
          style: {
            ...(InputProps?.style as CSSProperties),
            marginTop: 0,
          },
        }}
        inputProps={{
          ...inputProps,
          'aria-label': `${label}${required ? '（必須）' : ''}`,
          style: {
            ...(inputProps?.style as CSSProperties),
            paddingTop: size === 'small' ? '8px' : '10px',
            paddingBottom: size === 'small' ? '6px' : '8px',
            height: 'auto',
          },
        }}
      />
      {tooltip && (
        <span id={`${inputId}-tooltip`} style={{ display: 'none' }}>
          {tooltip}
        </span>
      )}
    </StyledFormControl>
  )
}

export { CustomTextField }
