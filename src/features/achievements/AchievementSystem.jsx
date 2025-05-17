// src/features/achievements/AchievementSystem.jsx (versión mejorada)
import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const AchievementSystem = ({ goals, completedGoalsCount, socialMediaTime, points }) => {
  const { theme } = useTheme();
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Lista de logros posibles
  const achievementsList = [
    { id: 'first_goal', title: 'Primer Paso', description: 'Completa tu primera meta', icon: '🔰', condition: () => completedGoalsCount >= 1 },
    { id: 'five_goals', title: 'Constancia', description: 'Completa 5 metas', icon: '⭐', condition: () => completedGoalsCount >= 5 },
    { id: 'ten_goals', title: 'Dedicación', description: 'Completa 10 metas', icon: '🌟', condition: () => completedGoalsCount >= 10 },
    { id: 'twenty_goals', title: 'Determinación', description: 'Completa 20 metas', icon: '💫', condition: () => completedGoalsCount >= 20 },
    { id: 'fifty_goals', title: 'Maestría', description: 'Completa 50 metas', icon: '👑', condition: () => completedGoalsCount >= 50 },
    { id: 'balanced', title: 'Equilibrio', description: 'Completa metas de 3+ categorías', icon: '⚖️', 
      condition: () => {
        const categories = new Set();
        goals.forEach(goal => {
          if (goal.completed) {
            categories.add(goal.category);
          }
        });
        return categories.size >= 3;
      }
    },
    { id: 'social_master', title: 'Maestro Social', description: 'Acumula 120+ minutos para redes', icon: '📱', condition: () => socialMediaTime >= 120 },
    { id: 'point_collector', title: 'Coleccionista', description: 'Acumula 100+ puntos', icon: '💰', condition: () => points >= 100 },
  ];

  // Mantener la lógica existente para calcular nivel y experiencia
  useEffect(() => {
    // Fórmula de experiencia: 10 puntos por meta completada
    const xp = completedGoalsCount * 10;
    
    // Fórmula para nivel: cada nivel requiere 50 puntos más que el anterior
    // xpForCurrentLevel = (level - 1) * 50;
    // xpForNextLevel = level * 50;
    // Si xp = 0, newLevel = 0/50 + 1 = 1
    // Si xp = 49, newLevel = 0 + 1 = 1
    // Si xp = 50, newLevel = 1 + 1 = 2
    const newLevel = Math.floor(xp / 50) + 1;
    
    setExperience(xp);
    setLevel(newLevel);
    
    // Guardar en localStorage (aunque ya no se usa para leerlos al inicio del componente, es bueno para persistencia externa)
    localStorage.setItem('doorsuffer_level', newLevel.toString());
    localStorage.setItem('doorsuffer_experience', xp.toString());
  }, [completedGoalsCount]);

  // Verificar logros desbloqueados
  useEffect(() => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;
    
    achievementsList.forEach(achievement => {
      if (!newAchievements.some(achId => achId === achievement.id) && achievement.condition()) { // Evitar duplicados y verificar condición
        newAchievements.push(achievement.id);
        hasNewAchievement = true;
        // Aquí se podría añadir una notificación si se desea
        // notify(`¡Logro desbloqueado: ${achievement.title}!`, 'success');
      }
    });
    
    if (hasNewAchievement) {
      setAchievements(newAchievements);
      localStorage.setItem('doorsuffer_achievements', JSON.stringify(newAchievements));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, completedGoalsCount, socialMediaTime, points, achievementsList]); // achievements se quita para evitar bucle si se añade notify
                                                                               // achievementsList es constante, se puede quitar si se define fuera o se memoiza


  // Calcular progreso hacia el siguiente nivel
  const calculateProgress = () => {
    const xpForCurrentLevelBase = (level - 1) * 50; // XP necesario para alcanzar el nivel actual
    const xpForNextLevelBase = level * 50; // XP necesario para alcanzar el siguiente nivel
    
    const xpInCurrentLevelCycle = experience - xpForCurrentLevelBase; // XP acumulado desde que se alcanzó el nivel actual
    const xpNeededForNextLevelCycle = xpForNextLevelBase - xpForCurrentLevelBase; // XP total necesario para pasar de nivel actual al siguiente (siempre 50)
    
    if (xpNeededForNextLevelCycle === 0) return 100; // Evitar división por cero si por alguna razón esto sucede
    return Math.min(100, (xpInCurrentLevelCycle / xpNeededForNextLevelCycle) * 100); // Asegurar que no exceda 100%
  };
  
  // Obtener XP en el ciclo actual del nivel y XP necesario para el siguiente
  const getCurrentLevelXPInfo = () => {
    const xpForCurrentLevelBase = (level - 1) * 50;
    const xpForNextLevelBase = level * 50;
    const xpInCurrentLevelCycle = experience - xpForCurrentLevelBase;
    const xpNeededForNextLevelCycle = xpForNextLevelBase - xpForCurrentLevelBase;
    return { xpInCurrentLevelCycle, xpNeededForNextLevelCycle };
  };
  
  const { xpInCurrentLevelCycle, xpNeededForNextLevelCycle } = getCurrentLevelXPInfo();


  // Obtener beneficios del nivel actual
  const getLevelBenefits = () => {
    const benefits = [];
    // Estos beneficios deben coincidir con los desbloqueos reales en App.jsx
    if (level >= 1) benefits.push("Acceso básico"); // Beneficio base
    if (level >= 2) benefits.push("Temas visuales"); // Asumiendo que se desbloquean en App.jsx o se activan aquí
    if (level >= 3) benefits.push("Temporizador Pomodoro"); // Esto depende de si `showPomodoro` se maneja aquí o en App.
    if (level >= 5) benefits.push("Recompensas Adicionales");
    if (level >= 10) benefits.push("Estadísticas Avanzadas");
    
    return benefits.length > 0 ? benefits : ["Sigue subiendo de nivel para desbloquear más."];
  };

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <h2 className="text-2xl font-semibold mb-5">Nivel y Logros</h2>
      
      {/* Nivel y barra de progreso */}
      <div className="mb-6 p-4 rounded-lg" style={{
        backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f3f4f6'),
      }}>
        <div className="flex items-baseline mb-1">
          <span className="text-3xl font-bold mr-2" style={{color: 'var(--color-primary)'}}>Nivel {level}</span>
          <span className="text-sm opacity-70">({experience} XP total)</span>
        </div>
        
        <div className="mb-2 flex justify-between text-sm opacity-80">
          <span>{xpInCurrentLevelCycle} XP</span>
          <span>{Math.max(0, xpNeededForNextLevelCycle - xpInCurrentLevelCycle)} XP para Nivel {level + 1}</span>
        </div>
        
        <div className="relative h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${calculateProgress()}%`,
              background: `linear-gradient(90deg, var(--color-primary-light, var(--color-primary)), var(--color-accent-light, var(--color-accent)))`
            }} 
          ></div>
        </div>
        
        {/* Beneficios del nivel actual */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Beneficios Desbloqueados:</h3>
          {getLevelBenefits().length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {getLevelBenefits().map((benefit, index) => (
                <span key={index} className="px-2.5 py-1 text-xs rounded-full font-medium" style={{
                  backgroundColor: theme === THEMES.GOTHIC ? 'var(--color-primary-dark)' : 'var(--color-primary-accent)', 
                  color: theme === THEMES.GOTHIC ? 'var(--color-text-on-primary)' : 'var(--color-primary)'
                }}>
                  {benefit}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-70">Sigue progresando para desbloquear beneficios.</p>
          )}
        </div>
      </div>
      
      {/* Logros desbloqueados */}
      <h3 className="text-lg font-medium mb-3">
        Logros Desbloqueados 
        <span className="ml-2 px-2 py-0.5 text-sm rounded-full font-semibold" style={{
          backgroundColor: 'var(--color-secondary-accent)', 
          color: 'var(--color-text)'
        }}>
          {achievements.length}/{achievementsList.length}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {achievementsList.map(achievement => {
          const isUnlocked = achievements.some(achId => achId === achievement.id);
          
          return (
            <div 
              key={achievement.id} 
              className="p-3 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md"
              style={{
                borderWidth: '1px',
                borderColor: isUnlocked ? 'var(--color-success)' : (theme === THEMES.GOTHIC ? 'var(--color-border-gothic)' : 'var(--color-border-light)'),
                backgroundColor: theme === THEMES.GOTHIC ? (isUnlocked ? '#2a3b2a' : '#222') : (isUnlocked ? '#f0fff4' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : 'white')),
                opacity: isUnlocked ? 1 : 0.7,
                transform: isUnlocked ? 'scale(1)' : 'scale(0.98)',
                boxShadow: isUnlocked ? '0 2px 5px rgba(0, 128, 0, 0.1)' : 'none'
              }}
              title={isUnlocked ? achievement.description : `Bloqueado: ${achievement.description}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 mr-3 flex items-center justify-center rounded-full" style={{
                  backgroundColor: isUnlocked ? 'var(--color-success-accent)' : (theme === THEMES.GOTHIC ? 'rgba(255,255,255,0.05)' : 'rgba(107, 114, 128, 0.05)'),
                  border: `2px solid ${isUnlocked ? 'var(--color-success)' : 'transparent'}`
                }}>
                  <span className="text-2xl">
                    {isUnlocked ? achievement.icon : '🔒'}
                  </span>
                </div>
                <div>
                  <p className="font-medium" style={{color: isUnlocked ? 'var(--color-success-text)' : 'var(--color-text-secondary)'}}>{achievement.title}</p>
                  <p className="text-xs opacity-80" style={{color: isUnlocked ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)'}}>{achievement.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Próximos logros */}
      {achievementsList.filter(achievement => !achievements.some(achId => achId === achievement.id)).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Próximos Objetivos</h3>
          <div className="space-y-3">
            {achievementsList.filter(achievement => !achievements.some(achId => achId === achievement.id))
              .slice(0, 2) // Mostrar solo los 2 primeros logros pendientes
              .map(achievement => (
                <div 
                  key={achievement.id} 
                  className="p-3 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: theme === THEMES.GOTHIC ? '#252525' : (theme === THEMES.ARTNOUVEAU ? '#f1ece1' : '#f3f4f6'),
                    borderLeft: `4px solid var(--color-primary-accent, ${theme === THEMES.GOTHIC ? '#4a5568' : '#a0aec0'})`
                  }}
                  title={`Objetivo: ${achievement.description}`}
                >
                  <span className="text-2xl mr-3">🎯</span>
                  <div>
                    <p className="font-medium" style={{color: 'var(--color-text)'}}>{achievement.title}</p>
                    <p className="text-xs opacity-80 mt-1" style={{color: 'var(--color-text-secondary)'}}>{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AchievementSystem;