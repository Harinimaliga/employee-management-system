import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeModeContext = createContext();

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');

  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#090d16',
                  paper: '#0f172a',
                },
                text: {
                  primary: '#f8fafc',
                  secondary: '#94a3b8',
                },
              }
            : {
                background: {
                  default: '#f1f5f9',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#0f172a',
                  secondary: '#475569',
                },
              }),
        },
        typography: {
          fontFamily: 'Inter, Roboto, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
