// src/features/retrospective/RetrospectiveInsights.jsx
import React from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const RetrospectiveInsights = ({ insights, period }) => {
  const { theme } = useTheme();
  
  if (!insights || insights.length === 0) {
    return null;
  }
  
  const getIconForInsightType = (type) => {
    switch (type) {
      case 'positive': return '🌟';
      case 'negative': return '⚠️';
      case 'balanced': return '⚖️';
      case 'suggestion': return '💡';
      default: return '📊';
    }
  };
  
  const getColorForInsightType = (type) => {
    switch (type) {
      case 'positive': return 'var(--color-success)';
      case 'negative': return 'var(--color-warning)';
      case 'balanced': return 'var(--color-accent)';
      case 'suggestion': return 'var(--color-primary)';
      default: return 'var(--color-secondary)';
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Análisis y Recomendaciones</h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: theme === THEMES.GOTHIC ? '#222' : 'white',
              borderLeft: `4px solid ${getColorForInsightType(insight.type)}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex">
              <span className="text-xl mr-3 flex-shrink-0">{getIconForInsightType(insight.type)}</span>
              <p style={{ color: theme === THEMES.GOTHIC ? '#eee' : '#333' }}>{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 rounded-lg" style={{
        backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : (theme === THEMES.ARTNOUVEAU ? '#f8f4ed' : '#f3f4f6'),
        borderWidth: '1px',
        borderColor: 'var(--color-secondary-accent)'
      }}>
        <h4 className="font-medium mb-2">✨ Consejo para mejorar</h4>
        <p className="text-sm opacity-80">
          {period === 'weekly' 
            ? 'Dedica 10 minutos cada domingo para revisar tus metas y planificar la semana siguiente. Esto puede aumentar tu tasa de éxito hasta un 30%.'
            : 'Establece una meta de aprendizaje cada mes para mantenerte motivado. El crecimiento constante es la clave para el éxito a largo plazo.'}
        </p>
      </div>
    </div>
  );
};

export default RetrospectiveInsights;