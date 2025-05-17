// src/components/TabNavigation.jsx (versión mejorada)
import React from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  
  // Tabs con iconos mejorados para mayor claridad
  const tabs = [
    { id: 'today', label: 'Hoy', icon: '📝' },
    { id: 'metrics', label: 'Métricas', icon: '📊' },
    { id: 'commitments', label: 'Compromisos', icon: '🔔' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁' },
    { id: 'challenges', label: 'Desafíos', icon: '🎯' }
  ];

  // Mejorar los estilos condicionales para mayor contraste y mejor UX
  const getTabStyle = (isActive) => {
    const baseStyles = {
      backgroundColor: isActive 
        ? (theme === THEMES.GOTHIC ? '#333' : (theme === THEMES.ARTNOUVEAU ? '#e7d8c3' : '#eef2ff')) 
        : 'transparent',
      color: isActive 
        ? 'var(--color-primary)' 
        : 'var(--color-text-secondary)',
      borderColor: isActive 
        ? 'var(--color-primary)' 
        : 'transparent',
      transition: 'all 0.2s ease',
    };
    
    return baseStyles;
  };

  return (
    <>
      {/* Navegación móvil - adaptada para safe-area y mejor visibilidad */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 shadow-lg z-10" 
        style={{ 
          backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
          borderTop: '1px solid var(--color-secondary)',
          paddingBottom: 'env(safe-area-inset-bottom)' // Para dispositivos con notch
        }}>
        <div className="flex justify-between">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center justify-center ${activeTab === tab.id ? 'font-medium' : ''}`}
              style={getTabStyle(activeTab === tab.id)}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Navegación desktop - mejorada con espaciado consistente */}
      <nav className="hidden md:flex justify-center my-6">
        <div className="flex space-x-2 p-1.5 rounded-lg shadow-sm" 
          style={{ 
            backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#f8f4ed' : '#f3f4f6'),
            border: '1px solid var(--color-secondary-accent)'
          }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-md flex items-center transition-all duration-200 ${activeTab === tab.id ? 'font-medium shadow-sm' : 'hover:bg-opacity-50 hover:bg-gray-100'}`}
              style={getTabStyle(activeTab === tab.id)}
            >
              <span className="mr-2 text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default TabNavigation;