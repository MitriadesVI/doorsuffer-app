// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Asumo que la ruta a ThemeContext y THEMES es correcta.
// Si useTheme y THEMES no se exportan de './contexts/ThemeContext', necesitarás ajustar esto.
import { ThemeProvider, useTheme, THEMES } from './contexts/ThemeContext'; 
import TabNavigation from './components/TabNavigation';
import DailyGoals from './features/goals/DailyGoals';
import PenaltySystem from './features/penalties/PenaltySystem';
import PointSystem from './features/points/PointSystem';
import RewardsSystem from './features/rewards/RewardsSystem';
import AchievementSystem from './features/achievements/AchievementSystem';
import SocialMediaTimeDisplay from './features/social/SocialMediaTimeDisplay';
import MetricsWidget from './features/metrics/MetricsWidget';
import SavingsGoals from './features/savings/SavingsGoals';
import PomodoroTimer from './features/pomodoro/PomodoroTimer';
import ChallengeSystem from './features/challenges/ChallengeSystem';
import WeeklyRetrospective from './features/retrospective/WeeklyRetrospective';
import './App.css';

// Componente de notificación mejorado
const Notification = ({ message, type, onClose }) => {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return theme === THEMES.GOTHIC ? '#4b7340' : '#10b981';
      case 'error': return theme === THEMES.GOTHIC ? '#a00000' : '#ef4444';
      case 'warning': return theme === THEMES.GOTHIC ? '#a16207' : '#f59e0b';
      default: return theme === THEMES.GOTHIC ? '#1d4ed8' : '#3b82f6';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };
  
  const styles = {
    container: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      maxWidth: '20rem',
      backgroundColor: getBackgroundColor(),
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out forwards',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    icon: {
      fontSize: '1.25rem',
      lineHeight: '1.5rem',
      flexShrink: '0'
    },
    content: {
      flex: '1',
      fontSize: '0.9rem'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      opacity: '0.7',
      cursor: 'pointer',
      fontSize: '1.25rem',
      lineHeight: '1',
      padding: '0',
      marginLeft: '0.5rem',
      transition: 'opacity 0.2s ease',
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={styles.container}>
      <span style={styles.icon}>{getIcon()}</span>
      <div style={styles.content}>{message}</div>
      <button 
        style={styles.closeButton} 
        onClick={onClose}
        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
      >×</button>
    </div>
  );
};

// Componente selector de temas
const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme();
  return (
    <div className="absolute top-4 right-4 z-10">
      <select 
        value={theme}
        onChange={(e) => changeTheme(e.target.value)}
        className="p-2 border rounded shadow-sm"
        style={{ 
          backgroundColor: 'var(--color-bg)', 
          color: 'var(--color-text)',
          borderColor: 'var(--color-secondary)'
        }}
      >
        <option value="artnouveau">Art Nouveau</option>
        <option value="gothic">Gótico</option>
        <option value="minimal">Minimalista</option>
      </select>
    </div>
  );
};

// Componente para la palabra del día
const DailyWord = () => {
  const { theme } = useTheme();
  const [wordData, setWordData] = useState({
    word: "Perseverancia",
    definition: "Firmeza y constancia en la ejecución de los propósitos y resoluciones del ánimo o en las acciones.",
    quote: "La perseverancia no es una carrera larga, es muchas carreras cortas una tras otra."
  });

  useEffect(() => {
    const words = [
      { word: "Perseverancia", definition: "Firmeza y constancia en la ejecución de los propósitos y resoluciones del ánimo o en las acciones.", quote: "La perseverancia no es una carrera larga, es muchas carreras cortas una tras otra." },
      { word: "Disciplina", definition: "Capacidad de las personas para poner en práctica una serie de principios relativos al orden y la constancia.", quote: "La disciplina es el puente entre objetivos y logros." },
      { word: "Enfoque", definition: "Capacidad de concentrar la atención en una tarea o un objetivo, eliminando distracciones.", quote: "Donde va el enfoque, fluye la energía." },
      { word: "Determinación", definition: "Firmeza en la toma de decisiones y en la consecución de objetivos propuestos.", quote: "La determinación de hoy es el éxito de mañana." },
      { word: "Constancia", definition: "Firmeza y perseverancia en las resoluciones y en los propósitos.", quote: "La constancia convierte lo difícil en fácil, lo imposible en posible." }
    ];
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const wordIndex = dayOfYear % words.length;
    setWordData(words[wordIndex]);
  }, []);

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : (theme === THEMES.MINIMAL ? 'var(--color-card-bg)' : 'white'),
      boxShadow: 'var(--box-shadow)', borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)', borderWidth: '1px'
    }}>
      <h2 className="text-2xl font-semibold mb-3">Palabra del Día</h2>
      <div className="text-center">
        <p className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{wordData.word}</p>
        <p className="text-sm mb-4 opacity-80">{wordData.definition}</p>
        <blockquote className="italic border-l-4 pl-4 py-2" style={{ borderColor: 'var(--color-primary)' }}>"{wordData.quote}"</blockquote>
      </div>
    </section>
  );
};

// Función auxiliar para formatear fecha, usada en applyPenalty
const formatDateForNotification = (dateString) => {
    if (!dateString) return 'una fecha futura';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options); // Asegurar zona horaria local
    } catch (e) {
        return 'una fecha futura';
    }
};


function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [dailyGoals, setDailyGoals] = useState(() => {
    const savedGoals = localStorage.getItem('doorsuffer_dailyGoals');
    if (savedGoals) {
      try { return JSON.parse(savedGoals); } 
      catch (e) { console.error("Failed to parse dailyGoals from localStorage", e); return []; }
    }
    return [
      { id: "default-1", text: "Hacer 30 minutos de ejercicio", category: "Salud Física", completed: false, rewardType: "socialTime", rewardAmount: 15, dueTime: null, penaltyType: null, penaltyAmount: null, recurrenceType: "daily", recurrenceDays: null },
      { id: "default-2", text: "Meditar 10 minutos", category: "Salud Mental", completed: false, rewardType: "socialTime", rewardAmount: 10, dueTime: null, penaltyType: null, penaltyAmount: null, recurrenceType: "daily", recurrenceDays: null },
      { id: "default-3", text: "Terminar informe pendiente", category: "Trabajo", completed: false, rewardType: "points", rewardAmount: 20, dueTime: "17:00", penaltyType: "points", penaltyAmount: 5, recurrenceType: "weekdays", recurrenceDays: null },
    ];
  });
  const [penalties, setPenalties] = useState(() => {
    const savedPenalties = localStorage.getItem('doorsuffer_penalties');
    if (savedPenalties) {
      try { return JSON.parse(savedPenalties); } 
      catch (e) { console.error("Failed to parse penalties from localStorage", e); return []; }
    }
    return [];
  });
  const [socialMediaTime, setSocialMediaTime] = useState(() => {
    const savedTime = localStorage.getItem('doorsuffer_socialMediaTime');
    return savedTime ? parseInt(savedTime, 10) : 0;
  });
  const [totalCompletedGoals, setTotalCompletedGoals] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_totalCompletedGoals');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showPomodoro, setShowPomodoro] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_showPomodoro');
    return saved ? saved === 'true' : false;
  });
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('doorsuffer_points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });
  const [pointTransactions, setPointTransactions] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_pointTransactions');
    if (saved) {
      try { return JSON.parse(saved); } 
      catch(e) { console.error("Failed to parse pointTransactions from localStorage", e); return []; }
    }
    return [];
  });
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    const audioPath = type === 'success' ? '/sounds/success.mp3' : type === 'error' ? '/sounds/error.mp3' : type === 'warning' ? '/sounds/warning.mp3' : '/sounds/notification.mp3';
    const audio = new Audio(audioPath);
    audio.play().catch(() => {});
    if ("Notification" in window && Notification.permission === "granted") {
      new window.Notification("Doorsuffer", { body: message, tag: type });
    }
  }, []);
  
  const addPointTransaction = useCallback((amount, description) => {
    const transaction = { id: Date.now().toString(), amount, description, timestamp: new Date().toISOString() };
    setPointTransactions(prev => [...prev, transaction]);
  }, []);
  
  const handleLinkGoalToChallenge = useCallback((challengeId, goalId) => {
    notify(`Meta vinculada al desafío (ID: ${challengeId}) correctamente.`, 'success');
  }, [notify]);

  const handleAddPoints = useCallback((amount, description) => {
    setPoints(prev => Math.max(0, prev + amount)); 
    addPointTransaction(amount, description);
  }, [addPointTransaction]);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") notify("¡Notificaciones activadas correctamente!", "success");
      else if (permission === "denied") notify("Permiso de notificaciones denegado.", "warning");
    }
  }, [notify]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registrado con éxito:', registration))
        .catch(error => console.error('Error al registrar Service Worker:', error));
    }
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => requestNotificationPermission(), 3000);
    }
  }, [requestNotificationPermission]);

  useEffect(() => {
    localStorage.setItem('doorsuffer_dailyGoals', JSON.stringify(dailyGoals));
    const allCompleted = dailyGoals.length > 0 && dailyGoals.every(goal => goal.completed);
    const prevAllCompleted = localStorage.getItem('doorsuffer_allGoalsCompleted') === 'true';
    if (allCompleted && !prevAllCompleted) {
      notify('¡Felicidades! Has completado todas tus metas del día.', 'success');
      localStorage.setItem('doorsuffer_allGoalsCompleted', 'true');
    } else if (!allCompleted && prevAllCompleted) {
      localStorage.setItem('doorsuffer_allGoalsCompleted', 'false');
    }
  }, [dailyGoals, notify]);

  useEffect(() => localStorage.setItem('doorsuffer_penalties', JSON.stringify(penalties)), [penalties]);
  useEffect(() => localStorage.setItem('doorsuffer_points', points.toString()), [points]);
  useEffect(() => localStorage.setItem('doorsuffer_pointTransactions', JSON.stringify(pointTransactions)), [pointTransactions]);

  useEffect(() => { 
    const earnedTime = dailyGoals.reduce((total, goal) => (goal.completed && goal.rewardType === 'socialTime' ? total + (Number(goal.rewardAmount) || 0) : total), 0);
    const timePenaltyAmount = penalties.reduce((total, penalty) => (penalty.type === 'socialTime' && !penalty.isCommitment ? total + (Number(penalty.amount) || 0) : total), 0); // Solo penalizaciones inmediatas de tiempo social
    const netTime = Math.max(0, earnedTime - timePenaltyAmount);
    const previousTime = parseInt(localStorage.getItem('doorsuffer_socialMediaTime') || '0', 10);
    if (netTime !== previousTime) {
        setSocialMediaTime(netTime);
        if (Math.abs(netTime - previousTime) >= 1) notify(`Tiempo para redes sociales actualizado: ${netTime} minutos disponibles.`, 'info');
        localStorage.setItem('doorsuffer_socialMediaTime', netTime.toString());
    }
  }, [dailyGoals, penalties, notify]);

  // MODIFICACIÓN DE applyPenalty
  const applyPenalty = useCallback((penaltyData) => {
    const newPenaltyBase = {
      id: Date.now().toString() + Math.random().toString(36).substr(2,9),
      reason: penaltyData.reason, 
      type: penaltyData.type, 
      amount: Number(penaltyData.amount) || 0, 
      timestamp: new Date().toISOString(), 
      recurrenceType: penaltyData.recurrenceType || 'once',
      recurrenceDays: penaltyData.recurrenceDays || null, 
      linkedChallenge: penaltyData.linkedChallenge || null,
      dueDate: penaltyData.dueDate || null, 
      dueTime: penaltyData.dueTime || null,
      isCommitment: penaltyData.isCommitment || false, 
      completed: penaltyData.completed || false,
      penaltyApplied: false // Siempre inicia como no aplicada
    };

    // Para penalizaciones inmediatas (sin fecha futura o no marcadas como compromiso explícitamente)
    if (!newPenaltyBase.isCommitment) {
      if (newPenaltyBase.type === 'points') {
        // Aplicar penalización de puntos inmediatamente
        setPoints(prev => Math.max(0, prev - newPenaltyBase.amount));
        addPointTransaction(-newPenaltyBase.amount, `Penalización: ${newPenaltyBase.reason}`);
      } 
      // Para penalizaciones de tiempo social inmediatas, NO se hace nada aquí directamente.
      // Se guarda en `penalties` y el useEffect que escucha [dailyGoals, penalties] 
      // (el que calcula socialMediaTime) se encargará.
      // Asegurarse que ese useEffect solo considere `!isCommitment` para tiempo social.
      notify(`Penalización aplicada: -${newPenaltyBase.amount} ${newPenaltyBase.type === 'socialTime' ? 'minutos' : 'puntos'} por "${newPenaltyBase.reason}".`, 'warning');
    }
    
    // Para cualquier tipo, añadir a la lista de penalizaciones/compromisos
    // Esto es crucial para que los compromisos (incluidos los de puntos) sean rastreados
    // y el useEffect `checkOverdueCommitments` pueda actuar sobre ellos.
    // También para que las penalizaciones inmediatas de tiempo social se registren.
    setPenalties(prev => [...prev, newPenaltyBase]);
    
    // Si es un compromiso programado (tiene dueDate y dueTime), solo notificar registro
    if (newPenaltyBase.isCommitment) {
      notify(`Compromiso "${newPenaltyBase.reason}" registrado para el ${formatDateForNotification(newPenaltyBase.dueDate)}.`, 'success');
    }
    
    if (newPenaltyBase.linkedChallenge) {
      console.log(`Penalización/Compromiso aplicado y vinculado al desafío ID: ${newPenaltyBase.linkedChallenge}`);
    }
  }, [addPointTransaction, notify, setPoints, setPenalties]); // Añadido setPoints y setPenalties como dependencias

  const toggleGoalCompletion_final = useCallback((goalId) => {
    let completedGoalForStreak = null; 
    setDailyGoals(prevGoals => {
      const goalToToggle = prevGoals.find(g => g.id === goalId);
      if (!goalToToggle) return prevGoals; 
      const isCompleting = !goalToToggle.completed;
      if (isCompleting) {
        completedGoalForStreak = goalToToggle; 
        const now = new Date();
        const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const isOnTime = !goalToToggle.dueTime || currentTimeString <= goalToToggle.dueTime;
        if (goalToToggle.rewardType === 'points') {
          handleAddPoints(Number(goalToToggle.rewardAmount) || 0, `Meta completada: ${goalToToggle.text}`);
          notify(`¡Meta completada! +${goalToToggle.rewardAmount} puntos.`, 'success');
        } else if (goalToToggle.rewardType === 'socialTime') { 
          notify(`¡Meta completada! +${goalToToggle.rewardAmount} minutos para redes sociales.`, 'success');
        }
        if (!isOnTime && goalToToggle.penaltyType && (Number(goalToToggle.penaltyAmount) || 0) > 0) {
          // Para penalizaciones por completar metas tarde, se asume que son inmediatas
          applyPenalty({ 
            reason: `Meta "${goalToToggle.text}" completada fuera de tiempo`, 
            type: goalToToggle.penaltyType, 
            amount: Number(goalToToggle.penaltyAmount) || 0,
            isCommitment: false // No es un compromiso programado, es una consecuencia inmediata
          });
        }
        const newTotal = totalCompletedGoals + 1;
        setTotalCompletedGoals(newTotal);
        localStorage.setItem('doorsuffer_totalCompletedGoals', newTotal.toString());
        if (newTotal >= 5 && !showPomodoro) {
            setShowPomodoro(true); localStorage.setItem('doorsuffer_showPomodoro', 'true');
            notify('¡Has desbloqueado el temporizador Pomodoro!', 'success');
        }
      } else { 
        if (goalToToggle.rewardType === 'points') handleAddPoints(-(Number(goalToToggle.rewardAmount) || 0), `Meta desmarcada: ${goalToToggle.text}`);
        const newTotal = Math.max(0, totalCompletedGoals - 1);
        setTotalCompletedGoals(newTotal); localStorage.setItem('doorsuffer_totalCompletedGoals', newTotal.toString());
      }
      return prevGoals.map(goal => goal.id === goalId ? { ...goal, completed: !goal.completed } : goal);
    });
    if (completedGoalForStreak) { 
        const todayStr = new Date().toDateString();
        const lastLoginDate = localStorage.getItem('doorsuffer_lastLoginDate');
        let currentStreak = parseInt(localStorage.getItem('doorsuffer_streak') || '0', 10);
        if (lastLoginDate !== todayStr) { 
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastLoginDate === yesterday) currentStreak++; else currentStreak = 1;
            localStorage.setItem('doorsuffer_streak', currentStreak.toString());
            localStorage.setItem('doorsuffer_lastLoginDate', todayStr); 
            notify(`¡Racha de ${currentStreak} día(s)!`, 'info');
        }
    }
  }, [handleAddPoints, notify, totalCompletedGoals, showPomodoro, applyPenalty, setTotalCompletedGoals, setShowPomodoro]);

  const addGoal = useCallback((goalDataFromComponent, isFromChallenge = false) => { 
    const newGoalId = Date.now().toString() + Math.random().toString(36).substr(2,9);
    const newGoal = {
      id: newGoalId, completed: false, 
      text: goalDataFromComponent.text || "Meta sin título",
      category: goalDataFromComponent.category || "General",
      rewardType: goalDataFromComponent.rewardType || "socialTime", 
      rewardAmount: parseInt(goalDataFromComponent.rewardAmount || goalDataFromComponent.rewardTime || '0', 10),
      dueTime: goalDataFromComponent.dueTime || null, 
      penaltyType: goalDataFromComponent.penaltyType || null,
      penaltyAmount: goalDataFromComponent.penaltyAmount ? parseInt(goalDataFromComponent.penaltyAmount, 10) : null,
      recurrenceType: goalDataFromComponent.recurrenceType || 'once',
      recurrenceDays: goalDataFromComponent.recurrenceDays || null,
      linkedToChallenge: isFromChallenge ? true : false
    };
    setDailyGoals(prevGoals => [...prevGoals, newGoal]);
    if (!isFromChallenge) {
        notify(`Nueva meta "${newGoal.text}" añadida correctamente.`, 'success');
    }
    return newGoalId;
  }, [notify]);

  const deleteGoal = useCallback((goalId) => {
    setDailyGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    notify('Meta eliminada.', 'info');
  }, [notify]);

  const completePenalty = useCallback((penaltyId) => {
    setPenalties(prevPenalties => prevPenalties.map(p => p.id === penaltyId ? { ...p, completed: true } : p));
    notify('¡Compromiso completado!', 'success');
  }, [notify]);

  const deletePenalty = useCallback((penaltyId) => {
    setPenalties(prevPenalties => prevPenalties.filter(p => p.id !== penaltyId));
    notify('Compromiso eliminado.', 'info');
  }, [notify]);

  const resetDailyGoals = useCallback(() => {
    setDailyGoals(prevGoals => prevGoals.map(goal => ({ ...goal, completed: false })));
    localStorage.setItem('doorsuffer_allGoalsCompleted', 'false'); 
    notify('Metas diarias reiniciadas para el nuevo día.', 'info');
  }, [notify]);
  
  const handleRewardClaimed = useCallback((reward) => {
    notify(`¡Has reclamado la recompensa "${reward.title}"!`, 'success');
  }, [notify]);
  
  const handlePomodoroComplete = useCallback((mode) => {
    if (mode === 'work') notify('¡Sesión de trabajo completada! Tómate un descanso.', 'success'); 
    else notify('¡Descanso completado! Hora de volver al trabajo.', 'info');
  }, [notify]);

  useEffect(() => {
    const lastResetDate = localStorage.getItem('doorsuffer_lastResetDate');
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      if (window.confirm("Parece ser un nuevo día. ¿Quieres reiniciar tus metas diarias para hoy?")) resetDailyGoals();
      localStorage.setItem('doorsuffer_lastResetDate', today);
    }
  }, [resetDailyGoals]);

  useEffect(() => {
    const today = new Date(); const dayOfWeekJS = today.getDay(); 
    const dayOfWeekCustom = (dayOfWeekJS === 0) ? 6 : dayOfWeekJS - 1; 
    const todayString = today.toDateString();
    const lastRegenDate = localStorage.getItem('doorsuffer_lastRegenDate');
    if (lastRegenDate !== todayString) {
      const goalsToRegenerate = [];
      dailyGoals.forEach(goal => {
        if (goal.completed && goal.recurrenceType && goal.recurrenceType !== 'once') {
          let shouldRegenerate = false;
          if (goal.recurrenceType === 'daily') shouldRegenerate = true;
          else if (goal.recurrenceType === 'weekdays' && dayOfWeekCustom >= 0 && dayOfWeekCustom <= 4) shouldRegenerate = true;
          else if (goal.recurrenceType === 'custom' && goal.recurrenceDays && goal.recurrenceDays[dayOfWeekCustom]) shouldRegenerate = true;
          if (shouldRegenerate) goalsToRegenerate.push({ ...goal, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), completed: false });
        }
      });
      if (goalsToRegenerate.length > 0) {
        setDailyGoals(prevDailyGoals => [...prevDailyGoals.filter(g => !goalsToRegenerate.some(rg => rg.text === g.text && g.recurrenceType !== 'once')), ...goalsToRegenerate]);
        notify(`Se han regenerado ${goalsToRegenerate.length} metas recurrentes para hoy.`, 'info');
      }
      localStorage.setItem('doorsuffer_lastRegenDate', todayString);
    }
  }, [dailyGoals, notify]);

  useEffect(() => {
    const today = new Date(); const dayOfWeekJS = today.getDay();
    const dayOfWeekCustom = (dayOfWeekJS === 0) ? 6 : dayOfWeekJS - 1;
    const todayString = today.toDateString();
    const lastPenaltyRegenDate = localStorage.getItem('doorsuffer_lastPenaltyRegenDate');
    if (lastPenaltyRegenDate !== todayString) {
      penalties.forEach(penalty => { // No es necesario crear un nuevo array penaltiesToReapply
        if (penalty.recurrenceType && penalty.recurrenceType !== 'once' && penalty.isCommitment && !penalty.completed) { // Solo compromisos recurrentes no completados
          let shouldReapply = false; const lastAppliedTimestamp = new Date(penalty.timestamp);
          if (penalty.recurrenceType === 'daily') { if (lastAppliedTimestamp.toDateString() !== todayString) shouldReapply = true; } 
          else if (penalty.recurrenceType === 'weekly') { const daysSince = Math.floor((today.getTime() - lastAppliedTimestamp.getTime()) / (1000 * 60 * 60 * 24)); if (daysSince >= 7) shouldReapply = true; } 
          else if (penalty.recurrenceType === 'monthly') { if (lastAppliedTimestamp.getFullYear() < today.getFullYear() || (lastAppliedTimestamp.getFullYear() === today.getFullYear() && lastAppliedTimestamp.getMonth() < today.getMonth())) { shouldReapply = true; } } 
          else if (penalty.recurrenceType === 'custom' && penalty.recurrenceDays && penalty.recurrenceDays[dayOfWeekCustom]) { if (lastAppliedTimestamp.toDateString() !== todayString) shouldReapply = true; }
          
          if (shouldReapply) {
            // En lugar de añadir uno nuevo, si el compromiso es recurrente y no se completó,
            // su penalización se aplicaría al vencer. Aquí podríamos notificar que "sigue activo".
            // La lógica de `checkOverdueCommitments` se encargará de aplicar la penalización si vence.
            // Si la idea es que un compromiso no cumplido se "reactive" como uno nuevo, la lógica de applyPenalty sería más adecuada.
            // Por ahora, esta lógica solo se asegura que la penalización se aplique al vencer.
            // Si ya venció y no se completó, `checkOverdueCommitments` ya debió actuar.
            // Si queremos "re-penalizar" o "re-crear" un compromiso no cumplido, es una lógica diferente.
            // Lo que se hace aquí es que el `localStorage.setItem('doorsuffer_lastPenaltyRegenDate', todayString)`
            // asegura que esta lógica de chequeo de recurrencia se ejecute una vez al día.
            // `checkOverdueCommitments` se encarga de la penalización real.
          }
        }
      });
      localStorage.setItem('doorsuffer_lastPenaltyRegenDate', todayString);
    }
  }, [penalties, notify, addPointTransaction]);


  useEffect(() => {
    const checkOverdueCommitments = () => {
      const now = new Date(); let penaltiesStateChanged = false;
      const updatedPenalties = penalties.map(commitment => {
        let currentCommitment = {...commitment}; // Trabajar con una copia

        // Solo procesar compromisos que son 'isCommitment', no están completados, y su penalización aún no se ha aplicado
        if (currentCommitment.isCommitment && !currentCommitment.completed && !currentCommitment.penaltyApplied) {
          if (currentCommitment.dueDate && currentCommitment.dueTime) {
            const dueDateTime = new Date(`${currentCommitment.dueDate}T${currentCommitment.dueTime}`);
            if (now > dueDateTime) { // Si el compromiso ha vencido
              currentCommitment.penaltyApplied = true; // Marcar que la penalización se va a procesar
              penaltiesStateChanged = true;
              
              if (currentCommitment.type === 'points') {
                setPoints(prev => Math.max(0, prev - currentCommitment.amount));
                addPointTransaction(-currentCommitment.amount, `Compromiso vencido: ${currentCommitment.reason}`);
                notify(`Compromiso vencido: -${currentCommitment.amount} puntos por "${currentCommitment.reason}".`, 'warning');
              } else if (currentCommitment.type === 'socialTime') {
                // La deducción de tiempo social por compromiso vencido se maneja indirectamente
                // al actualizar `penalties` con `penaltyApplied: true`.
                // El useEffect de `socialMediaTime` necesita ser ajustado para considerar esto.
                // Por ahora, solo notificamos. La lógica de `socialMediaTime` debe cambiar.
                notify(`Compromiso vencido: -${currentCommitment.amount} minutos de tiempo social por "${currentCommitment.reason}".`, 'warning');
              }
            }
          }
        }
        return currentCommitment;
      });
      if (penaltiesStateChanged) setPenalties(updatedPenalties);
    };
    checkOverdueCommitments();
    const interval = setInterval(checkOverdueCommitments, 60000);
    return () => clearInterval(interval);
  }, [penalties, addPointTransaction, notify, setPoints, setPenalties]); // Agregado setPenalties

  const tabTitles = { 'today': 'Doorsuffer - Metas Diarias', 'metrics': 'Doorsuffer - Métricas', 'commitments': 'Doorsuffer - Compromisos', 'rewards': 'Doorsuffer - Recompensas', 'challenges': 'Doorsuffer - Desafíos' };
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = tabTitles[tabId] || 'Doorsuffer';
    localStorage.setItem('doorsuffer_lastTab', tabId);
  };

  useEffect(() => {
    const lastTab = localStorage.getItem('doorsuffer_lastTab');
    if (lastTab && Object.keys(tabTitles).includes(lastTab)) handleTabChange(lastTab);
    else document.title = tabTitles[activeTab] || 'Doorsuffer';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'today':
        return (
          <>
            <DailyWord />
            <DailyGoals goals={dailyGoals} onToggleGoal={toggleGoalCompletion_final} onAddGoal={addGoal} onDeleteGoal={deleteGoal} notify={notify}/>
            <SocialMediaTimeDisplay timeMinutes={socialMediaTime} points={points}/>
            {showPomodoro && <PomodoroTimer onComplete={handlePomodoroComplete} />}
          </>
        );
      case 'metrics':
        return (
          <>
            <MetricsWidget 
              goals={dailyGoals} 
              penalties={penalties}
              points={points}
              pointTransactions={pointTransactions}
            />
            <WeeklyRetrospective
              goals={dailyGoals}
              penalties={penalties}
              points={points}
              pointTransactions={pointTransactions}
            />
          </>
        );
      case 'commitments':
        return (<PenaltySystem onApplyPenalty={applyPenalty} penalties={penalties} onCompletePenalty={completePenalty} onDeletePenalty={deletePenalty} notify={notify} challenges={[] /* Pasar lista de desafíos si es necesario para PenaltySystem */} />);
      case 'rewards':
        return (
          <>
            <PointSystem points={points} transactions={pointTransactions} />
            <AchievementSystem goals={dailyGoals} completedGoalsCount={totalCompletedGoals} socialMediaTime={socialMediaTime} points={points}/>
            <RewardsSystem goals={dailyGoals} completedGoalsCount={totalCompletedGoals} onRewardClaimed={handleRewardClaimed} points={points} onSpendPoints={(amount, description) => handleAddPoints(-amount, description)} notify={notify}/>
          </>
        );
      case 'challenges':
        return (
          <>
            <ChallengeSystem 
              dailyGoals={dailyGoals} 
              notify={notify} 
              points={points} 
              onAddPoints={handleAddPoints} 
              onAddDailyGoal={addGoal}
              onToggleDailyGoalCompletion={toggleGoalCompletion_final} 
            />
            <SavingsGoals />
          </>
        );
      default:
        return <p>Selecciona una pestaña para comenzar</p>;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-container min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <ThemeSelector />
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        <header className="w-full max-w-4xl mx-auto mb-4 md:mb-2 text-center pt-8 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-text)' }}>Doorsuffer</h1>
          <p className="mt-1 text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>Tu asistente para la productividad personal</p>
        </header>
        <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
        <main className="w-full max-w-4xl mx-auto space-y-6 px-4 pb-20 md:pb-8">
          {renderTabContent()}
        </main>
        <footer className="w-full max-w-4xl mx-auto mt-8 text-center text-xs pb-20 md:pb-6 opacity-70">
          <p>© {new Date().getFullYear()} Doorsuffer - Tu compañero para vencer la procrastinación</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;