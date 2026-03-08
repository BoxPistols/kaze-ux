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
  // Dracula-inspired dark mode: 青みがかった柔らかいダークテーマ
  primary: createColorSet(
    isLight ? '#2642be' : '#7c8cf8', // Dracula purple 寄りの青紫
    isLight ? '#1a2c80' : '#6270d8',
    isLight ? '#4d68d4' : '#9aa4fc',
    isLight ? '#a6b4ec' : '#363450',
    undefined,
    '#ffffff'
  ),
  secondary: createColorSet(
    isLight ? '#696881' : '#b0b1c8',
    isLight ? '#424242' : '#7a7a8f',
    isLight ? '#757575' : '#c5c5d2',
    isLight ? '#FAFAFA' : '#3d3d50',
    undefined,
    '#ffffff'
  ),
  success: createColorSet(
    isLight ? '#46ab4a' : '#50fa7b', // Dracula green
    isLight ? '#3f7f42' : '#3cbe5c',
    isLight ? '#6db770' : '#7afb9e',
    isLight ? '#d4e9d4' : '#1e3d2c',
    undefined,
    isLight ? '#ffffff' : '#1a2e1a'
  ),
  info: createColorSet(
    isLight ? '#1dafc2' : '#8be9fd', // Dracula cyan
    isLight ? '#277781' : '#5cc8db',
    isLight ? '#43bfcf' : '#b0f0fc',
    isLight ? '#bde8ee' : '#1e3540',
    undefined,
    isLight ? '#ffffff' : '#0d2528'
  ),
  warning: createColorSet(
    isLight ? '#eb8117' : '#ffb86c', // Dracula orange
    isLight ? '#EF6C00' : '#e8a45c',
    isLight ? '#dd9c3c' : '#ffd099',
    isLight ? '#FFF3E0' : '#3d3225',
    undefined,
    isLight ? '#ffffff' : '#2d1f0d'
  ),
  error: createColorSet(
    isLight ? '#da3737' : '#ff6e6e', // Dracula red 寄り
    isLight ? '#c63535' : '#e04040',
    isLight ? '#dc4e4e' : '#ff9a9a',
    isLight ? '#FFEBEE' : '#3d2530',
    undefined,
    isLight ? '#ffffff' : '#2d1515'
  ),
  grey: greyShades,
  text: {
    // Dracula foreground ベースのテキスト色
    primary: isLight ? '#1a1a2e' : '#f8f8f2',
    secondary: isLight ? '#4a5568' : '#b8bece',
    disabled: isLight ? greyShades[400] : greyShades[500],
    white: '#ffffff',
  },
  background: {
    // Dracula-inspired: 青みのある柔らかいダーク背景
    default: isLight ? '#f8fafc' : '#282a36',
    paper: isLight ? '#ffffff' : '#343746',
  },
  action: {
    hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
    selected: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)',
    disabled: isLight ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
    active: isLight ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.56)',
  },
  surface: {
    background: isLight ? '#f8fafc' : '#2d2f3d',
    backgroundDark: isLight ? '#3f3f46' : '#44475a',
    backgroundDisabled: isLight ? '#f1f5f9' : '#44475a',
  },
  icon: {
    white: '#ffffff',
    light: isLight ? '#64748b' : '#b0b8c8',
    dark: isLight ? '#334155' : '#dce0e8',
    action: amber[400],
    disabled: isLight ? '#cbd5e1' : '#565f73',
  },
  // Dracula: やや明るめのボーダーで視認性向上
  divider: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.10)',
  common: {
    black: isLight ? '#09090b' : '#21222c',
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
