import { ThemeConfig } from 'antd';

// Definición de colores base
export const colors = {
  // Colores base (igual que el template)
  primary: '#171717',
  secondary: '#0c0c0c',
  tertiary: '#1d1d1d',
  quaternary: '#f3f3f3',
  quinary: '#f9f9f9',
  senary: '#ffffff',

  // Colores de marca (ajustados según el template)
  brandPrimary: '#75fcd4',
  brandPrimaryLighten: '#effff8',
  brandPrimaryDarken: '#5ad9b5', // Ajustado para mayor consistencia
  brandPrimaryDarknest: '#4ac0a0',

  brandSecondary: '#e9ffcc',
  brandSecondaryLighten: '#fdfff1',
  brandSecondaryDarken: '#c7dba9', // Ajustado según el template
  brandSecondaryDarknest: '#a8b98c',

  brandTertiary: '#f4dbfb',
  brandTertiaryLighten: '#fbf4fc',
  brandTertiaryDarken: '#d2b9d8', // Ajustado según el template
  brandTertiaryDarknest: '#a58fad',

  // Colores de acción (igual que el template)
  warning: '#f61e5d',
  success: '#2ECC71',

  // Colores de fondo específicos
  backgroundWrapper: '#f8f9fb',
  textSecondary: '#777777',
};

// Temas (ajustados según el template)
export const lightTheme = {
  ...colors,
  // Fondos
  backgroundPrimary: colors.primary,        // menu background
  backgroundSecondary: colors.secondary,
  backgroundTertiary: colors.tertiary,
  backgroundQuaternary: colors.quaternary,  // icons, dropdowns
  backgroundQuinary: colors.quinary,        // inputs
  backgroundSenary: colors.senary,          // app background
  backgroundWrapper: colors.backgroundWrapper,
  
  // Textos
  textPrimary: colors.primary,
  textSecondary: colors.textSecondary,
  textTertiary: colors.senary,
  
  // Bordes y otros
  border: colors.quaternary,
  backgroundDropdown: colors.senary,
  backgroundChart: colors.quinary,
  backgroundChartSection: colors.primary,
};

export const darkTheme = {
  ...colors,
  // Fondos
  backgroundPrimary: colors.primary,        // menu background
  backgroundSecondary: colors.secondary,
  backgroundTertiary: colors.quinary,
  backgroundQuaternary: colors.tertiary,    // icons, dropdowns
  backgroundQuinary: colors.tertiary,       // inputs
  backgroundSenary: colors.secondary,       // app background
  backgroundWrapper: colors.primary,
  
  // Textos
  textPrimary: colors.primary,
  textSecondary: colors.textSecondary,
  textTertiary: colors.quaternary,
  textQuaternary: colors.senary,
  
  // Bordes y otros
  border: 'rgba(243, 243, 243, 0.1)',
  backgroundDropdown: colors.primary,
  backgroundChart: colors.tertiary,
  backgroundChartSection: '#3a3a3a',        // Ajustado para el tema oscuro
};

// Configuración de tema para Ant Design
export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.brandPrimary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: '#ff4d4f',
    colorInfo: colors.brandPrimary,

    borderRadius: 6,
    borderRadiusLG: 8,

    fontSize: 14,
    fontSizeLG: 16,
    fontSizeHeading1: 20,
  },
};

// Diseño y espaciado
export const layout = {
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  breakpoints: {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  },
  dimensions: {
    headerHeight: 64,
    siderWidth: 240,
    siderCollapsedWidth: 80,
    maxContentWidth: 1200,
  },
};