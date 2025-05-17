// src/features/metrics/MetricsWidget.jsx (versión mejorada)
import React, { useEffect, useState } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const MetricsWidget = ({ goals, penalties, points, pointTransactions }) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState({
    completionRate: 0,
    topCategory: 'Ninguna',
    streakDays: 0,
    totalTimeEarned: 0,
    failedCommitments: 0,
    totalPointsEarned: 0,
    totalPointsLost: 0,
    maxPointsPerDay: 0,
    favoriteActivity: 'Ninguna'
  });

  // Mantengo la lógica existente para calcular las métricas
  useEffect(() => {
    // Calcular métricas básicas
    let newMetrics = {
      completionRate: 0,
      topCategory: 'Ninguna',
      streakDays: parseInt(localStorage.getItem('doorsuffer_streak') || '0'),
      totalTimeEarned: 0,
      failedCommitments: 0,
      totalPointsEarned: 0,
      totalPointsLost: 0,
      maxPointsPerDay: 0,
      favoriteActivity: 'Ninguna'
    };

    // Procesar las metas
    if (goals && goals.length > 0) {
      // Tasa de completado (porcentaje)
      const completed = goals.filter(goal => goal.completed).length;
      newMetrics.completionRate = Math.round((completed / goals.length) * 100);

      // Categorías y actividades
      const categories = {};
      const activities = {};
      
      goals.forEach(goal => {
        // Contar categorías
        categories[goal.category] = (categories[goal.category] || 0) + 1;
        
        // Contar actividades (por texto de la meta)
        if (goal.completed) {
          activities[goal.text] = (activities[goal.text] || 0) + 1;
        }
        
        // Calcular tiempo ganado
        if (goal.completed && (!goal.rewardType || goal.rewardType === 'socialTime')) {
          const amount = Number(goal.rewardAmount || goal.rewardTime) || 0;
          newMetrics.totalTimeEarned += amount;
        }
        
        // Calcular puntos ganados
        if (goal.completed && goal.rewardType === 'points') {
          newMetrics.totalPointsEarned += Number(goal.rewardAmount) || 0;
        }
      });
      
      // Determinar categoría principal
      let topCategory = 'Ninguna';
      let maxCategoryCount = 0;
      
      Object.entries(categories).forEach(([category, count]) => {
        if (count > maxCategoryCount) {
          maxCategoryCount = count;
          topCategory = category;
        }
      });
      
      newMetrics.topCategory = topCategory;
      
      // Determinar actividad favorita
      let favoriteActivity = 'Ninguna';
      let maxActivityCount = 0;
      
      Object.entries(activities).forEach(([activity, count]) => {
        if (count > maxActivityCount) {
          maxActivityCount = count;
          favoriteActivity = activity;
        }
      });
      
      newMetrics.favoriteActivity = favoriteActivity;
    }
    
    // Procesar compromisos fallidos
    if (penalties && penalties.length > 0) {
      // Contar compromisos vencidos o con penaltyApplied = true
      newMetrics.failedCommitments = penalties.filter(p => 
        (p.isCommitment && p.penaltyApplied) || (!p.isCommitment)
      ).length;
    }
    
    // Procesar transacciones de puntos
    if (pointTransactions && pointTransactions.length > 0) {
      let pointsLost = 0;
      const pointsByDay = {};
      
      pointTransactions.forEach(transaction => {
        const amount = Number(transaction.amount) || 0;
        
        // Sumar puntos perdidos
        if (amount < 0) {
          pointsLost += Math.abs(amount);
        }
        
        // Calcular puntos por día
        const day = new Date(transaction.timestamp).toDateString();
        if (amount > 0) {
          pointsByDay[day] = (pointsByDay[day] || 0) + amount;
        }
      });
      
      newMetrics.totalPointsLost = pointsLost;
      
      // Calcular máximo de puntos en un día
      newMetrics.maxPointsPerDay = Math.max(0, ...Object.values(pointsByDay));
    }
    
    setMetrics(newMetrics);
  }, [goals, penalties, points, pointTransactions]);

  // Mejorar la visualización de métricas con iconos y colores
  const getMetricIcon = (metricName) => {
    switch(metricName) {
      case 'completionRate': return '📊';
      case 'topCategory': return '📌';
      case 'streakDays': return '🔥';
      case 'totalTimeEarned': return '⏱️';
      case 'failedCommitments': return '⚠️';
      case 'pointsBalance': return '⚖️';
      case 'maxPointsPerDay': return '🏆';
      case 'favoriteActivity': return '❤️';
      default: return '📈';
    }
  };

  // Obtener color de tendencia para una métrica
  const getMetricColor = (metricName, value) => {
    switch(metricName) {
      case 'completionRate': 
        return value > 75 ? '#10B981' : value > 50 ? '#f59e0b' : '#ef4444';
      case 'streakDays':
        return value > 5 ? '#10B981' : value > 2 ? '#f59e0b' : '#3B82F6';
      case 'failedCommitments':
        return value === 0 ? '#10B981' : value < 3 ? '#f59e0b' : '#ef4444';
      default:
        return 'var(--color-primary)';
    }
  };

  // Estilizar tarjetas de métricas según el tema
  const getCardStyle = () => {
    return {
      backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#f8f4ed' : '#f9fafb'),
      borderRadius: 'var(--border-radius)',
      borderWidth: '1px',
      borderColor: 'var(--color-secondary)',
      boxShadow: theme === THEMES.GOTHIC ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }
  };

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <h2 className="text-2xl font-semibold mb-6">Métricas de Productividad</h2> 
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Tasa de Completado */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('completionRate')}</span>
            <h3 className="text-lg font-medium">Tasa de Completado</h3>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ 
                  width: `${metrics.completionRate}%`,
                  backgroundColor: getMetricColor('completionRate', metrics.completionRate),
                  transition: 'width 0.5s ease-in-out'
                }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
              ></div>
            </div>
            <p className="mt-2 text-2xl font-semibold" 
               style={{ color: getMetricColor('completionRate', metrics.completionRate) }}>
              {metrics.completionRate}%
            </p>
            <p className="text-xs mt-1 opacity-70">
              {metrics.completionRate < 50 ? 'Puedes mejorar' : metrics.completionRate < 75 ? '¡Buen progreso!' : '¡Excelente!'}
            </p>
          </div>
        </div>
        
        {/* Categoría Principal */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('topCategory')}</span>
            <h3 className="text-lg font-medium">Categoría Principal</h3>
          </div>
          <p className="text-2xl font-semibold truncate" 
             style={{ color: 'var(--color-primary)' }}>
            {metrics.topCategory}
          </p>
          <p className="text-xs mt-1 opacity-70">Tu enfoque más frecuente</p>
        </div>
        
        {/* Racha Actual */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('streakDays')}</span>
            <h3 className="text-lg font-medium">Racha Actual</h3>
          </div>
          <p className="text-2xl font-semibold" 
             style={{ color: getMetricColor('streakDays', metrics.streakDays) }}>
            {metrics.streakDays} día{metrics.streakDays !== 1 ? 's' : ''}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {metrics.streakDays > 0 ? '¡No rompas tu racha!' : 'Completa metas para iniciar una racha'}
          </p>
        </div>
        
        {/* Tiempo Social Ganado */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('totalTimeEarned')}</span>
            <h3 className="text-lg font-medium">Tiempo Social Ganado</h3>
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
            {metrics.totalTimeEarned} min
          </p>
          <p className="text-xs mt-1 opacity-70">
            {metrics.totalTimeEarned > 60 ? Math.floor(metrics.totalTimeEarned/60) + 'h ' + (metrics.totalTimeEarned % 60) + 'm' : metrics.totalTimeEarned + ' minutos'}
          </p>
        </div>
        
        {/* Compromisos Fallidos */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('failedCommitments')}</span>
            <h3 className="text-lg font-medium">Compromisos Fallidos</h3>
          </div>
          <p className="text-2xl font-semibold" 
             style={{ color: getMetricColor('failedCommitments', metrics.failedCommitments) }}>
            {metrics.failedCommitments}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {metrics.failedCommitments === 0 ? '¡Perfecto!' : '¡Oportunidades para mejorar!'}
          </p>
        </div>
        
        {/* Puntos Ganados vs Perdidos */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('pointsBalance')}</span>
            <h3 className="text-lg font-medium">Balance de Puntos</h3>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-semibold text-green-500">
                +{metrics.totalPointsEarned}
              </p>
              <p className="text-xs opacity-70">Ganados</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-500">
                -{metrics.totalPointsLost}
              </p>
              <p className="text-xs opacity-70">Perdidos</p>
            </div>
          </div>
          <p className="text-xs mt-2 text-center font-medium" style={{color: 'var(--color-primary)'}}>
            Balance: {metrics.totalPointsEarned - metrics.totalPointsLost}
          </p>
        </div>
        
        {/* Récord de Puntos por Día */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('maxPointsPerDay')}</span>
            <h3 className="text-lg font-medium">Récord de Puntos (día)</h3>
          </div>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
            {metrics.maxPointsPerDay} pts
          </p>
          <p className="text-xs mt-1 opacity-70">Tu día más productivo</p>
        </div>
        
        {/* Actividad Favorita */}
        <div className="p-4 border rounded-lg hover:shadow-md transition-all"
             style={getCardStyle()}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{getMetricIcon('favoriteActivity')}</span>
            <h3 className="text-lg font-medium">Actividad Favorita</h3>
          </div>
          <p className="text-xl font-semibold truncate" 
             style={{ color: 'var(--color-primary)' }}>
            {metrics.favoriteActivity}
          </p>
          <p className="text-xs mt-1 opacity-70">Tu meta más completada</p>
        </div>
      </div>
    </section>
  );
};

export default MetricsWidget;