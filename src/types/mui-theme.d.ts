import '@mui/material/styles'
import '@mui/material/Typography'

declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
  }

  interface SimplePaletteColorOptions {
    lighter?: string
  }
  interface TypographyVariants {
    displayLarge: React.CSSProperties
    displayMedium: React.CSSProperties
    displaySmall: React.CSSProperties
    xxl: React.CSSProperties
    xl: React.CSSProperties
    lg: React.CSSProperties
    ml: React.CSSProperties
    md: React.CSSProperties
    sm: React.CSSProperties
    xs: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    displayLarge: React.CSSProperties
    displayMedium: React.CSSProperties
    displaySmall: React.CSSProperties
    xxl?: React.CSSProperties
    xl?: React.CSSProperties
    lg?: React.CSSProperties
    ml?: React.CSSProperties
    md?: React.CSSProperties
    sm?: React.CSSProperties
    xs?: React.CSSProperties
  }

  interface Typography {
    displayLarge: React.CSSProperties
    displayMedium: React.CSSProperties
    displaySmall: React.CSSProperties
    xxl?: React.CSSProperties
    xl?: React.CSSProperties
    lg?: React.CSSProperties
    ml?: React.CSSProperties
    md?: React.CSSProperties
    sm?: React.CSSProperties
    xs?: React.CSSProperties
  }

  interface Palette {
    surface?: {
      background?: string
      backgroundDark?: string
      backgroundDisabled?: string
    }
    icon?: {
      white?: string
      light?: string
      dark?: string
      action?: string
      disabled?: string
    }
    chart?: {
      blue: Record<string, string>
      pink: Record<string, string>
    }
  }

  interface PaletteOptions {
    surface?: {
      background?: string
      backgroundDark?: string
      backgroundDisabled?: string
    }
    icon?: {
      white?: string
      light?: string
      dark?: string
      action?: string
      disabled?: string
    }
    chart?: {
      blue: Record<string, string>
      pink: Record<string, string>
    }
  }

  interface Theme {
    colorSchemes?: {
      light?: {
        palette: PaletteOptions
      }
      dark?: {
        palette: PaletteOptions
      }
    }
  }

  interface ThemeOptions {
    colorSchemes?: {
      light?: {
        palette: PaletteOptions
      }
      dark?: {
        palette: PaletteOptions
      }
    }
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayLarge: true
    displayMedium: true
    displaySmall: true
    xxl: true
    xl: true
    lg: true
    ml: true
    md: true
    sm: true
    xs: true
  }
}