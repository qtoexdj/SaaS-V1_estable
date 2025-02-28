import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Colores principales
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Espaciado
    padding: 24,
    paddingXS: 12,
    paddingSM: 16,
    paddingLG: 32,
    margin: 24,
    marginXS: 12,
    marginSM: 16,
    marginLG: 32,

    // Bordes
    borderRadius: 6,
    borderRadiusLG: 8,

    // Sombras
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // Tipografía
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeHeading1: 20,
  },
  components: {
    Layout: {
      headerBg: '#fff',
      siderBg: '#001529',
      bodyBg: '#f0f2f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#002140',
    },
  },
};

// CSS Variables para configuraciones adicionales
export const cssVariables = {
  layout: {
    headerHeight: '64px',
    siderWidth: '240px',
    siderCollapsedWidth: '80px',
    headerPadding: '24px',
    contentPadding: '24px',
    contentMargin: '24px',
  },
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  }
};
