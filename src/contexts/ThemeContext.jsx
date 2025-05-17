// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Constantes para los temas disponibles
export const THEMES = {
  ARTNOUVEAU: 'artnouveau',
  GOTHIC: 'gothic',
  MINIMAL: 'minimal'
};

// Definiciones de variables CSS para cada tema
const themeVariables = {
  [THEMES.ARTNOUVEAU]: {
    '--color-bg': '#f8f3e8',
    '--color-text': '#3d2c1c',
    '--color-text-secondary': '#6b5a45',
    '--color-primary': '#a86f3e',
    '--color-primary-dark': '#8a5a32',
    '--color-primary-accent': 'rgba(168, 111, 62, 0.15)',
    '--color-secondary': '#e7d8c3',
    '--color-secondary-accent': '#d8c8b3',
    '--color-secondary-light': '#f2ede3',
    '--color-accent': '#738c65',
    '--color-accent-dark': '#5e7353',
    '--color-card-bg': '#fdfbf6',
    '--color-success': '#738c65',
    '--box-shadow': '0 1px 3px rgba(168, 111, 62, 0.1), 0 1px 2px rgba(168, 111, 62, 0.06)',
    '--border-radius': '0.5rem',
    '--font-primary': 'Playfair Display, serif'
  },
  [THEMES.GOTHIC]: {
    '--color-bg': '#121212',
    '--color-text': '#e6e6e6',
    '--color-text-secondary': '#a0a0a0',
    '--color-primary': '#8f0e0e',
    '--color-primary-dark': '#700b0b',
    '--color-primary-accent': 'rgba(143, 14, 14, 0.15)',
    '--color-secondary': '#2a2a2a',
    '--color-secondary-accent': '#3a3a3a',
    '--color-secondary-light': '#414141',
    '--color-accent': '#b91c1c',
    '--color-accent-dark': '#8f1616',
    '--color-card-bg': '#1a1a1a',
    '--color-success': '#4b7340',
    '--box-shadow': '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
    '--border-radius': '0.25rem',
    '--font-primary': 'Cinzel, serif'
  },
  [THEMES.MINIMAL]: {
    '--color-bg': '#f9fafb',
    '--color-text': '#1f2937',
    '--color-text-secondary': '#4b5563',
    '--color-primary': '#2563eb',
    '--color-primary-dark': '#1d4ed8',
    '--color-primary-accent': 'rgba(37, 99, 235, 0.15)',
    '--color-secondary': '#e5e7eb',
    '--color-secondary-accent': '#d1d5db',
    '--color-secondary-light': '#f3f4f6',
    '--color-accent': '#3b82f6',
    '--color-accent-dark': '#2563eb',
    '--color-card-bg': 'white',
    '--color-success': '#10b981',
    '--box-shadow': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    '--border-radius': '0.75rem',
    '--font-primary': 'DM Sans, sans-serif'
  }
};

// Función para aplicar las variables CSS del tema
const applyThemeVariables = (theme) => {
  const variables = themeVariables[theme];
  if (!variables) return;

  Object.entries(variables).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
  
  // Aplicar fuentes según el tema
  if (theme === THEMES.ARTNOUVEAU) {
    document.body.classList.add('font-artnouveau');
    document.body.classList.remove('font-gothic', 'font-minimal');
  } else if (theme === THEMES.GOTHIC) {
    document.body.classList.add('font-gothic');
    document.body.classList.remove('font-artnouveau', 'font-minimal');
  } else {
    document.body.classList.add('font-minimal');
    document.body.classList.remove('font-artnouveau', 'font-gothic');
  }
};

// Crear contexto del tema
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('doorsuffer_theme');
    return savedTheme || THEMES.MINIMAL; // Tema por defecto
  });

  const changeTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('doorsuffer_theme', newTheme);
      applyThemeVariables(newTheme);
    }
  };

  // Aplicar el tema al montar el componente
  useEffect(() => {
    applyThemeVariables(theme);
    
    // Detectar preferencia de esquema de color del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    // Si no hay tema guardado, aplicar uno basado en la preferencia del sistema
    if (!localStorage.getItem('doorsuffer_theme')) {
      const systemTheme = prefersDark ? THEMES.GOTHIC : THEMES.MINIMAL;
      setTheme(systemTheme);
      localStorage.setItem('doorsuffer_theme', systemTheme);
      applyThemeVariables(systemTheme);
    }
    
    // Listener para cambios en el esquema de color del sistema
    const darkModeListener = e => {
      if (!localStorage.getItem('doorsuffer_theme_manual')) {
        const newTheme = e.matches ? THEMES.GOTHIC : THEMES.MINIMAL;
        setTheme(newTheme);
        localStorage.setItem('doorsuffer_theme', newTheme);
        applyThemeVariables(newTheme);
      }
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', darkModeListener);
    
    return () => mediaQuery.removeEventListener('change', darkModeListener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);