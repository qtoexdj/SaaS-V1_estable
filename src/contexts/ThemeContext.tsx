import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { lightTheme, darkTheme, layout, antTheme as defaultAntTheme, Theme } from '../styles/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Verificar si hay una preferencia guardada en localStorage
  const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
  const [themeMode, setThemeMode] = useState<ThemeMode>(savedTheme || 'dark');
  const [theme, setTheme] = useState(themeMode === 'light' ? lightTheme : darkTheme);

  // Actualizar el tema cuando cambia el modo
  useEffect(() => {
    setTheme(themeMode === 'light' ? lightTheme : darkTheme);
    localStorage.setItem('themeMode', themeMode);
    
    // Aplicar clase al body para estilos CSS
    if (themeMode === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [themeMode]);

  // Función para cambiar entre temas
  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Configuración del tema para Ant Design
  const antThemeConfig = {
    algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      ...defaultAntTheme.token,
      // Colores bases
      colorBgBase: themeMode === 'dark' ? theme.backgroundSecondary : theme.backgroundSenary,
      colorTextBase: themeMode === 'dark' ? theme.textPrimary : theme.textDark,
      colorText: themeMode === 'dark' ? theme.textLight : theme.textDark,
      colorTextSecondary: themeMode === 'dark' ? theme.textLightSecondary : theme.textDarkSecondary,
      
      // Colores específicos para componentes
      colorBgContainer: themeMode === 'dark' ? theme.darkComponent : theme.senary,
      colorBgElevated: themeMode === 'dark' ? theme.darkElevated : theme.senary,
      colorBorder: themeMode === 'dark' ? theme.darkBorder : theme.quaternary,
      colorBorderSecondary: themeMode === 'dark' ? theme.darkBorder : theme.quinary,
      
      // Espaciados
      padding: layout.spacing.md,
      paddingXS: layout.spacing.xs,
      paddingSM: layout.spacing.sm,
      paddingLG: layout.spacing.lg,
      margin: layout.spacing.md,
      marginXS: layout.spacing.xs,
      marginSM: layout.spacing.sm,
      marginLG: layout.spacing.lg,
    },
    components: {
      Layout: {
        headerBg: theme.backgroundPrimary,
        siderBg: theme.backgroundPrimary,
        bodyBg: themeMode === 'dark' ? theme.backgroundSecondary : theme.backgroundWrapper,
      },
      Menu: {
        darkItemBg: theme.backgroundPrimary,
        darkItemSelectedBg: theme.brandPrimary,
        darkItemHoverBg: themeMode === 'dark' ? theme.darkHover : theme.backgroundSecondary,
        itemHoverBg: themeMode === 'dark' ? theme.darkHover : theme.quinary,
      },
      Card: {
        colorBgContainer: themeMode === 'dark' ? theme.cardBackground : theme.backgroundSenary,
        colorBorderSecondary: themeMode === 'dark' ? theme.darkBorder : theme.quaternary,
      },
      Table: {
        colorBgContainer: themeMode === 'dark' ? theme.tableBg : theme.backgroundSenary,
        headerBg: themeMode === 'dark' ? theme.tableHeaderBg : theme.quinary,
        rowHoverBg: themeMode === 'dark' ? theme.darkHover : theme.quinary,
        borderColor: themeMode === 'dark' ? theme.darkBorder : theme.quaternary,
      },
      Input: {
        colorBgContainer: themeMode === 'dark' ? theme.inputBg : theme.senary,
        colorBorder: themeMode === 'dark' ? theme.darkBorder : theme.quaternary,
        hoverBorderColor: theme.brandPrimary,
        activeBorderColor: theme.brandPrimary,
      },
      Select: {
        colorBgContainer: themeMode === 'dark' ? theme.inputBg : theme.senary,
        optionSelectedBg: themeMode === 'dark' ? theme.darkHover : theme.brandPrimaryLighten,
      },
      Button: {
        colorBgContainer: themeMode === 'dark' ? theme.buttonBg : theme.senary,
        colorBgContainerDisabled: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
      Modal: {
        contentBg: themeMode === 'dark' ? theme.darkComponent : theme.senary,
        headerBg: themeMode === 'dark' ? theme.darkComponent : theme.senary,
      },
      List: {
        colorBgContainer: themeMode === 'dark' ? theme.darkComponent : theme.senary,
        colorBorderSecondary: themeMode === 'dark' ? theme.darkBorder : theme.quaternary,
      }
    },
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, theme }}>
      <ConfigProvider theme={antThemeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};