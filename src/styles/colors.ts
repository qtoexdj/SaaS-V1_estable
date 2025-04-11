import { ThemeConfig } from 'antd';

// Definición de colores base
export const colors = {
  // Colores base del tema
  primary: '#171717',         // Gris muy oscuro (casi negro)
  secondary: '#0c0c0c',       // Negro
  tertiary: '#1d1d1d',        // Gris oscuro
  quaternary: '#f3f3f3',      // Gris muy claro
  quinary: '#f9f9f9',         // Casi blanco
  senary: '#ffffff',          // Blanco puro

  // Colores para el modo oscuro mejorados
  darkPrimary: '#121212',     // Fondo principal modo oscuro
  darkSecondary: '#1E1E1E',   // Fondo secundario modo oscuro
  darkTertiary: '#252525',    // Fondo de componentes oscuro
  darkElevated: '#2A2A2A',    // Componentes elevados oscuros
  darkBorder: '#333333',      // Bordes en modo oscuro
  darkComponent: '#2C2C2C',   // Fondos de componentes
  darkHover: '#353535',       // Color al pasar el ratón en oscuro

  // Colores de marca
  brandPrimary: '#75fcd4',    // Verde brillante
  brandPrimaryLighten: '#effff8',
  brandPrimaryDarken: '#5ad9b5',
  brandPrimaryDarknest: '#4ac0a0',

  brandSecondary: '#e9ffcc',  // Verde pálido
  brandSecondaryLighten: '#fdfff1',
  brandSecondaryDarken: '#c7dba9',
  brandSecondaryDarknest: '#a8b98c',

  brandTertiary: '#f4dbfb',   // Púrpura pálido
  brandTertiaryLighten: '#fbf4fc',
  brandTertiaryDarken: '#d2b9d8',
  brandTertiaryDarknest: '#a58fad',

  // Colores de estado
  warning: '#f61e5d',         // Rojo brillante
  success: '#2ECC71',         // Verde brillante
  info: '#3498DB',           // Azul brillante
  error: '#E74C3C',          // Rojo brillante

  // Textos
  textLight: '#FAFAFA',       // Texto principal modo oscuro
  textLightSecondary: '#A0A0A0', // Texto secundario modo oscuro
  textDark: '#222222',        // Texto principal modo claro
  textDarkSecondary: '#777777', // Texto secundario modo claro

  // Colores de fondo específicos
  backgroundWrapper: '#f8f9fb',
};

// Definición de la interfaz Theme para tipar correctamente los temas
export interface Theme {
  // Colores base
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  
  // Colores para el modo oscuro
  darkPrimary: string;
  darkSecondary: string;
  darkTertiary: string;
  darkElevated: string;
  darkBorder: string;
  darkComponent: string;
  darkHover: string;
  
  // Colores de marca
  brandPrimary: string;
  brandPrimaryLighten: string;
  brandPrimaryDarken: string;
  brandPrimaryDarknest: string;
  brandSecondary: string;
  brandSecondaryLighten: string;
  brandSecondaryDarken: string;
  brandSecondaryDarknest: string;
  brandTertiary: string;
  brandTertiaryLighten: string;
  brandTertiaryDarken: string;
  brandTertiaryDarknest: string;
  
  // Colores de estado
  warning: string;
  success: string;
  info: string;
  error: string;
  
  // Textos
  textLight: string;
  textLightSecondary: string;
  textDark: string;
  textDarkSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textQuaternary?: string;
  
  // Fondos
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundQuaternary: string;
  backgroundQuinary: string;
  backgroundSenary: string;
  backgroundWrapper: string;
  
  // Bordes y otros
  border: string;
  backgroundDropdown: string;
  backgroundChart: string;
  backgroundChartSection: string;
  
  // Componentes específicos para modo oscuro
  cardBackground?: string;
  tableBg?: string;
  tableHeaderBg?: string;
  inputBg?: string;
  inputBorderHover?: string;
  buttonBg?: string;
  buttonHoverBg?: string;
  listItemHoverBg?: string;
}

// Temas (ajustados según el template de referencia)
export const lightTheme: Theme = {
  ...colors,
  // Fondos
  backgroundPrimary: colors.primary,        // menú background
  backgroundSecondary: colors.secondary,
  backgroundTertiary: colors.tertiary,
  backgroundQuaternary: colors.quaternary,  // iconos, dropdowns
  backgroundQuinary: colors.quinary,        // inputs
  backgroundSenary: colors.senary,          // fondo de la app
  backgroundWrapper: colors.backgroundWrapper,
  
  // Textos
  textPrimary: colors.textDark,
  textSecondary: colors.textDarkSecondary,
  textTertiary: colors.senary,
  
  // Bordes y otros
  border: colors.quaternary,
  backgroundDropdown: colors.senary,
  backgroundChart: colors.quinary,
  backgroundChartSection: colors.primary,
};

export const darkTheme: Theme = {
  ...colors,
  // Fondos
  backgroundPrimary: colors.darkPrimary,    // menú background
  backgroundSecondary: colors.darkSecondary,
  backgroundTertiary: colors.darkTertiary,
  backgroundQuaternary: colors.darkElevated, // iconos, dropdowns
  backgroundQuinary: colors.darkComponent,   // inputs
  backgroundSenary: colors.darkSecondary,    // fondo de la app
  backgroundWrapper: colors.darkPrimary,
  
  // Textos
  textPrimary: colors.textLight,
  textSecondary: colors.textLightSecondary,
  textTertiary: colors.quaternary,
  textQuaternary: colors.senary,
  
  // Bordes y otros
  border: colors.darkBorder,
  backgroundDropdown: colors.darkElevated,
  backgroundChart: colors.darkComponent,
  backgroundChartSection: colors.darkElevated,
  
  // Componentes específicos para modo oscuro
  cardBackground: colors.darkTertiary,
  tableBg: colors.darkComponent,
  tableHeaderBg: colors.darkElevated,
  inputBg: colors.darkComponent,
  inputBorderHover: colors.brandPrimary,
  buttonBg: colors.darkComponent,
  buttonHoverBg: colors.darkHover,
  listItemHoverBg: colors.darkHover,
};

// Configuración de tema para Ant Design
export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.brandPrimary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,

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