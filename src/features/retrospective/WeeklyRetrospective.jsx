// src/features/retrospective/WeeklyRetrospective.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import RetrospectiveInsights from './RetrospectiveInsights';

const WeeklyRetrospective = ({ goals, penalties, points, pointTransactions }) => {
  const { theme } = useTheme();
  const [period, setPeriod] = useState('weekly'); // 'weekly' o 'monthly'
  const [retrospectiveData, setRetrospectiveData] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_retrospective');
    return saved ? JSON.parse(saved) : {
      weeklyReports: [],
      monthlyReports: [],
      lastWeekGenerated: null,
      lastMonthGenerated: null
    };
  });

  // Calcular datos actuales del período
  const currentPeriodData = useMemo(() => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar metas completadas en el período actual
    const completedGoalsInPeriod = goals.filter(goal => {
      if (!goal.completed) return false;
      
      // Aproximación: si no hay timestamp de completado, usamos ahora
      const completedDate = goal.completedAt ? new Date(goal.completedAt) : now;
      
      if (period === 'weekly') {
        return getWeekNumber(completedDate) === currentWeek && 
               completedDate.getFullYear() === currentYear;
      } else {
        return completedDate.getMonth() === currentMonth && 
               completedDate.getFullYear() === currentYear;
      }
    });
    
    // Categorías más frecuentes
    const categoryCounts = {};
    completedGoalsInPeriod.forEach(goal => {
      categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
    
    // Calcular tasa de completado
    const totalGoalsInPeriod = goals.filter(goal => {
      // Simplificación: si el goal existe, asumimos que pertenece al período actual
      // En una implementación completa, se verificaría la fecha de creación
      return true;
    });
    
    const completionRate = totalGoalsInPeriod.length > 0 
      ? (completedGoalsInPeriod.length / totalGoalsInPeriod.length) * 100 
      : 0;
    
    // Días más productivos (simplificado)
    const dailyCompletions = {};
    completedGoalsInPeriod.forEach(goal => {
      const date = goal.completedAt ? new Date(goal.completedAt) : now;
      const dayKey = date.toISOString().split('T')[0];
      dailyCompletions[dayKey] = (dailyCompletions[dayKey] || 0) + 1;
    });
    
    const mostProductiveDay = Object.entries(dailyCompletions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1)
      .map(([day, count]) => ({ 
        date: new Date(day), 
        count 
      }))[0] || null;
    
    // Puntos ganados en el período
    const pointsEarnedInPeriod = pointTransactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        if (period === 'weekly') {
          return getWeekNumber(transactionDate) === currentWeek && 
                 transactionDate.getFullYear() === currentYear;
        } else {
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        }
      })
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return {
      period,
      completedGoals: completedGoalsInPeriod.length,
      topCategories,
      completionRate,
      mostProductiveDay,
      pointsEarned: pointsEarnedInPeriod,
      periodStart: period === 'weekly' 
        ? getStartOfWeek(now).toLocaleDateString() 
        : new Date(currentYear, currentMonth, 1).toLocaleDateString(),
      periodEnd: period === 'weekly'
        ? getEndOfWeek(now).toLocaleDateString()
        : new Date(currentYear, currentMonth + 1, 0).toLocaleDateString(),
    };
  }, [goals, penalties, points, pointTransactions, period]);

  // Generar retrospectiva
  useEffect(() => {
    const now = new Date();
    const currentWeek = `${now.getFullYear()}-W${getWeekNumber(now)}`;
    const currentMonth = `${now.getFullYear()}-M${now.getMonth()}`;
    
    let updatedRetrospective = { ...retrospectiveData };
    let needsUpdate = false;
    
    // Generar retrospectiva semanal si es un nuevo día y no existe para la semana actual
    if (retrospectiveData.lastWeekGenerated !== currentWeek) {
      // Aquí se generaría una retrospectiva completa con análisis detallado
      // Para este ejemplo, simplificamos usando los datos actuales
      updatedRetrospective.weeklyReports = [
        {
          id: currentWeek,
          date: now.toISOString(),
          ...currentPeriodData,
          insights: generateInsights(currentPeriodData, 'weekly', retrospectiveData.weeklyReports[0]),
        },
        ...updatedRetrospective.weeklyReports.slice(0, 11) // Mantener últimas 12 semanas
      ];
      updatedRetrospective.lastWeekGenerated = currentWeek;
      needsUpdate = true;
    }
    
    // Similar para retrospectiva mensual
    if (retrospectiveData.lastMonthGenerated !== currentMonth) {
      // Aquí se generaría una retrospectiva mensual completa
      updatedRetrospective.monthlyReports = [
        {
          id: currentMonth,
          date: now.toISOString(),
          ...currentPeriodData,
          insights: generateInsights(currentPeriodData, 'monthly', retrospectiveData.monthlyReports[0]),
        },
        ...updatedRetrospective.monthlyReports.slice(0, 11) // Mantener últimos 12 meses
      ];
      updatedRetrospective.lastMonthGenerated = currentMonth;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      setRetrospectiveData(updatedRetrospective);
      localStorage.setItem('doorsuffer_retrospective', JSON.stringify(updatedRetrospective));
    }
  }, [retrospectiveData, currentPeriodData]);

  // Obtener datos del reporte actual
  const currentReport = useMemo(() => {
    if (period === 'weekly') {
      return retrospectiveData.weeklyReports[0] || null;
    } else {
      return retrospectiveData.monthlyReports[0] || null;
    }
  }, [retrospectiveData, period]);

  // Obtener reporte anterior para comparación
  const previousReport = useMemo(() => {
    if (period === 'weekly') {
      return retrospectiveData.weeklyReports[1] || null;
    } else {
      return retrospectiveData.monthlyReports[1] || null;
    }
  }, [retrospectiveData, period]);

  // Funciones de utilidad
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(date) {
    const d = new Date(getStartOfWeek(date));
    d.setDate(d.getDate() + 6);
    return d;
  }

  function generateInsights(data, periodType, previousData) {
    const insights = [];
    
    // Tendencia de completado
    if (previousData) {
      const completionTrend = data.completedGoals - previousData.completedGoals;
      if (completionTrend > 3) {
        insights.push({
          type: 'positive',
          text: `Excelente progreso: has completado ${completionTrend} metas más que el ${periodType === 'weekly' ? 'semana' : 'mes'} anterior.`
        });
      } else if (completionTrend < -3) {
        insights.push({
          type: 'negative',
          text: `Has completado ${Math.abs(completionTrend)} metas menos que el ${periodType === 'weekly' ? 'semana' : 'mes'} anterior. ¿Hay algo que te está bloqueando?`
        });
      }
    }
    
    // Balance de categorías
    if (data.topCategories.length > 0) {
      const topCategory = data.topCategories[0];
      const secondCategory = data.topCategories[1];
      
      if (secondCategory && topCategory.count > secondCategory.count * 2) {
        insights.push({
          type: 'balanced',
          text: `Te has enfocado mucho en "${topCategory.category}". Considera balancear con otras áreas como "${secondCategory.category}".`
        });
      }
    }
    
    // Tasa de completado
    if (data.completionRate < 50) {
      insights.push({
        type: 'suggestion',
        text: `Tu tasa de completado es del ${data.completionRate.toFixed(0)}%. Considera establecer metas más pequeñas y alcanzables.`
      });
    } else if (data.completionRate > 90) {
      insights.push({
        type: 'positive',
        text: `¡Impresionante tasa de completado del ${data.completionRate.toFixed(0)}%! Considera aumentar el desafío de tus metas.`
      });
    }
    
    // Si no hay suficientes insights, agregar uno genérico
    if (insights.length < 2) {
      insights.push({
        type: 'suggestion',
        text: `Para mejorar tu productividad, intenta establecer metas específicas y medibles cada día.`
      });
    }
    
    return insights;
  }

  return (
    <section className="card p-6 space-y-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Retrospectiva</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setPeriod('weekly')} 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === 'weekly' ? 'font-semibold' : ''}`} 
            style={{ 
              backgroundColor: period === 'weekly' 
                ? (theme === THEMES.GOTHIC ? '#333' : 'var(--color-primary-accent)') 
                : 'transparent',
              color: period === 'weekly' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderWidth: '1px',
              borderColor: period === 'weekly' ? 'var(--color-primary)' : 'transparent'
            }}
          >
            Semanal
          </button>
          <button 
            onClick={() => setPeriod('monthly')} 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === 'monthly' ? 'font-semibold' : ''}`} 
            style={{ 
              backgroundColor: period === 'monthly' 
                ? (theme === THEMES.GOTHIC ? '#333' : 'var(--color-primary-accent)') 
                : 'transparent',
              color: period === 'monthly' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderWidth: '1px',
              borderColor: period === 'monthly' ? 'var(--color-primary)' : 'transparent'
            }}
          >
            Mensual
          </button>
        </div>
      </div>
      
      {currentReport ? (
        <div className="space-y-6">
          {/* Resumen del período */}
          <div className="p-4 rounded-lg" style={{
            backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f3f4f6'),
          }}>
            <h3 className="text-lg font-medium mb-3">{period === 'weekly' ? 'Resumen Semanal' : 'Resumen Mensual'}</h3>
            <p className="text-sm opacity-80 mb-4">
              Período: {currentReport.periodStart} a {currentReport.periodEnd}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Metas completadas */}
              <div className="p-3 rounded-md shadow-sm" style={{
                backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white',
                borderLeft: '4px solid var(--color-primary)'
              }}>
                <p className="text-xs uppercase opacity-70">Metas Completadas</p>
                <div className="flex items-end mt-1">
                  <span className="text-2xl font-bold mr-2">{currentReport.completedGoals}</span>
                  {previousReport && (
                    <span className={`text-xs ${currentReport.completedGoals > previousReport.completedGoals ? 'text-green-500' : currentReport.completedGoals < previousReport.completedGoals ? 'text-red-500' : 'opacity-50'}`}>
                      {currentReport.completedGoals > previousReport.completedGoals 
                        ? `↑ ${currentReport.completedGoals - previousReport.completedGoals}` 
                        : currentReport.completedGoals < previousReport.completedGoals 
                          ? `↓ ${previousReport.completedGoals - currentReport.completedGoals}` 
                          : '―'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Tasa de completado */}
              <div className="p-3 rounded-md shadow-sm" style={{
                backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white',
                borderLeft: '4px solid var(--color-accent)'
              }}>
                <p className="text-xs uppercase opacity-70">Tasa de Completado</p>
                <div className="flex items-end mt-1">
                  <span className="text-2xl font-bold mr-2">{currentReport.completionRate.toFixed(0)}%</span>
                  {previousReport && (
                    <span className={`text-xs ${currentReport.completionRate > previousReport.completionRate ? 'text-green-500' : currentReport.completionRate < previousReport.completionRate ? 'text-red-500' : 'opacity-50'}`}>
                      {currentReport.completionRate > previousReport.completionRate 
                        ? `↑ ${(currentReport.completionRate - previousReport.completionRate).toFixed(0)}%` 
                        : currentReport.completionRate < previousReport.completionRate 
                          ? `↓ ${(previousReport.completionRate - currentReport.completionRate).toFixed(0)}%` 
                          : '―'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Puntos ganados */}
              <div className="p-3 rounded-md shadow-sm" style={{
                backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white',
                borderLeft: '4px solid var(--color-success)'
              }}>
                <p className="text-xs uppercase opacity-70">Puntos Ganados</p>
                <div className="flex items-end mt-1">
                  <span className="text-2xl font-bold mr-2">{currentReport.pointsEarned}</span>
                  {previousReport && (
                    <span className={`text-xs ${currentReport.pointsEarned > previousReport.pointsEarned ? 'text-green-500' : currentReport.pointsEarned < previousReport.pointsEarned ? 'text-red-500' : 'opacity-50'}`}>
                      {currentReport.pointsEarned > previousReport.pointsEarned 
                        ? `↑ ${currentReport.pointsEarned - previousReport.pointsEarned}` 
                        : currentReport.pointsEarned < previousReport.pointsEarned 
                          ? `↓ ${previousReport.pointsEarned - currentReport.pointsEarned}` 
                          : '―'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Categorías principales */}
          <div>
            <h3 className="text-lg font-medium mb-3">Categorías Principales</h3>
            
            {currentReport.topCategories.length > 0 ? (
              <div className="space-y-3">
                {currentReport.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md" style={{
                    backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f3f4f6')
                  }}>
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{
                        index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔹'
                      }</span>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <span className="px-2 py-1 rounded-full text-sm font-medium" style={{
                      backgroundColor: theme === THEMES.GOTHIC ? '#333' : 'white'
                    }}>
                      {category.count} {category.count === 1 ? 'meta' : 'metas'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 opacity-70">No hay datos suficientes para mostrar.</p>
            )}
          </div>
          
          {/* Insights y recomendaciones */}
          <RetrospectiveInsights 
            insights={currentReport.insights || []} 
            period={period}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="opacity-70">No hay datos suficientes para generar una retrospectiva.</p>
          <p className="mt-2 text-sm">Completa algunas metas para ver tu análisis.</p>
        </div>
      )}
    </section>
  );
};

export default WeeklyRetrospective;