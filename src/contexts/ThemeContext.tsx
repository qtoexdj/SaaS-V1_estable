import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { lightTheme, darkTheme, layout, antTheme as defaultAntTheme } from '../styles/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  theme: typeof lightTheme;
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
      colorBgBase: themeMode === 'dark' ? theme.backgroundSecondary : theme.backgroundSenary,
      colorTextBase: theme.textPrimary,
      
      // Usar los espaciados definidos en layout
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
        darkItemHoverBg: theme.backgroundSecondary,
      },
      Card: {
        colorBgContainer: themeMode === 'dark' ? theme.backgroundTertiary : theme.backgroundSenary,
      },
      Table: {
        colorBgContainer: themeMode === 'dark' ? theme.backgroundTertiary : theme.backgroundSenary,
        headerBg: themeMode === 'dark' ? theme.backgroundTertiary : theme.backgroundSenary,
      },
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