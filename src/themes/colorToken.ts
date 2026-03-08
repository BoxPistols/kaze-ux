import { amber, blue, pink } from '@mui/material/colors'

export interface ColorSet {
  main: string
  dark: string
  light: string
  lighter: string
  textContrast?: string
  contrastText: string
}

export interface GreyShades extends Record<string, string> {
  [key: number]: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  850: string
  900: string
}

export interface ThemeColors {
  primary: ColorSet
  secondary: ColorSet
  success: ColorSet
  info: ColorSet
  warning: ColorSet
  error: ColorSet
  grey: GreyShades
  text: {
    primary: string
    secondary: string
    disabled: string
    white: string
  }
  background: {
    default: string
    paper: string
  }
  action: {
    hover: string
    selected: string
    disabled: string
    active: string
  }
  surface: {
    background: string
    backgroundDark: string
    backgroundDisabled: string
  }
  icon: {
    white: string
    light: string
    dark: string
    action: string
    disabled: string
  }
  divider: string
  common: {
    black: string
    white: string
  }
}

const createColorSet = (
  main: string,
  dark: string,
  light: string,
  lighter: string,
  textContrast?: string,
  contrastText: string = '#ffffff'
): ColorSet => ({
  main,
  dark,
  light,
  lighter,
  textContrast,
  contrastText,
})

const greyShades: GreyShades = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#4e4e4e',
  800: '#3a3a3a',
  850: '#323232',
  900: '#292929',
}

const createThemeColors = (isLight: boolean): ThemeColors => ({
  primary: createColorSet(
    isLight ? '#2642be' : '#5d7ce8', // ダークモードで明るめに
    isLight ? '#1a2c80' : '#4a66c9',
    isLight ? '#4d68d4' : '#7b94ec',
    isLight ? '#a6b4ec' : '#3d4a6d',
    undefined,
    '#ffffff'
  ),
  secondary: createColorSet(
    isLight ? '#696881' : '#a0a1b8',
    isLight ? '#424242' : '#6a6a6a',
    isLight ? '#757575' : '#b5b5b5',
    isLight ? '#FAFAFA' : '#454550',
    undefined,
    '#ffffff'
  ),
  success: createColorSet(
    isLight ? '#46ab4a' : '#7cd07f', // ダークモードでコントラスト向上
    isLight ? '#3f7f42' : '#4caf50',
    isLight ? '#6db770' : '#97dc9a',
    isLight ? '#d4e9d4' : '#2d4a2e',
    undefined,
    isLight ? '#ffffff' : '#1a2e1a'
  ),
  info: createColorSet(
    isLight ? '#1dafc2' : '#4dd4e8', // ダークモードで視認性向上
    isLight ? '#277781' : '#1ba8b9',
    isLight ? '#43bfcf' : '#7ae3f0',
    isLight ? '#bde8ee' : '#1d3d42',
    undefined,
    isLight ? '#ffffff' : '#0d2528'
  ),
  warning: createColorSet(
    isLight ? '#eb8117' : '#ffb74d', // ダークモードで明るく
    isLight ? '#EF6C00' : '#ff9800',
    isLight ? '#dd9c3c' : '#ffcc80',
    isLight ? '#FFF3E0' : '#4a3520',
    undefined,
    isLight ? '#ffffff' : '#2d1f0d'
  ),
  error: createColorSet(
    isLight ? '#da3737' : '#f07070', // ダークモードでコントラスト向上
    isLight ? '#c63535' : '#e53935',
    isLight ? '#dc4e4e' : '#f5a0a0',
    isLight ? '#FFEBEE' : '#4a2828',
    undefined,
    isLight ? '#ffffff' : '#2d1515'
  ),
  grey: greyShades,
  text: {
    // ダークモードでWCAG AA準拠のコントラスト比を確保
    primary: isLight ? '#1a1a2e' : '#f5f5f7',
    secondary: isLight ? '#4a5568' : '#b0b5c0',
    disabled: isLight ? greyShades[400] : greyShades[500],
    white: '#ffffff',
  },
  background: {
    // ダークモードでより洗練された背景色
    default: isLight ? '#f8fafc' : '#18181b',
    paper: isLight ? '#ffffff' : '#27272a',
  },
  action: {
    hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
    selected: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
    disabled: isLight ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
    active: isLight ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.56)',
  },
  surface: {
    background: isLight ? '#f8fafc' : '#1f1f23',
    backgroundDark: '#3f3f46',
    backgroundDisabled: isLight ? '#f1f5f9' : '#3f3f46',
  },
  icon: {
    white: '#ffffff',
    light: isLight ? '#64748b' : '#a1a1aa',
    dark: isLight ? '#334155' : '#d4d4d8',
    action: amber[400],
    disabled: isLight ? '#cbd5e1' : '#52525b',
  },
  // ダークモードで微妙な境界線
  divider: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
  common: {
    black: '#09090b',
    white: '#ffffff',
  },
})

// これは、後にチャートなどの色を設計する時の参考
export const colorData = {
  chart: {
    blue: { 50: blue[50], 200: blue[200] },
    pink: { 200: pink[200] },
  },
  ...createThemeColors(true),
  dark: createThemeColors(false),
}

export const getGrey = (shade: keyof GreyShades): string => greyShades[shade]

/* ===== Examples =====
styled-componentsを使う場合
const StyledComponent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

useThemeフックを使う場合
function SomeComponent() {
  const theme = useTheme();
  return <Box sx={{ backgroundColor: theme.palette.primary.main }}>Hello</Box>;
}
*/

//  ===== CSS Variables =====
/** CSS化する場合の生成コード */
/**
let cssVars = ':root {\n'
for (const [key, value] of Object.entries(colorData)) {
  if (typeof value === 'string') {
    cssVars += `  --${key}: ${value};\n`
  } else {
    for (const [subKey, subValue] of Object.entries(value)) {
      if (typeof subValue === 'string') {
        cssVars += `  --${key}-${subKey}: ${subValue};\n`
      } else {
        for (const [nestedKey, nestedValue] of Object.entries(subValue)) {
          cssVars += `  --${key}-${subKey}-${nestedKey}: ${nestedValue};\n`
        }
      }
    }
  }
}
cssVars += '}'

console.log(cssVars)
*/
