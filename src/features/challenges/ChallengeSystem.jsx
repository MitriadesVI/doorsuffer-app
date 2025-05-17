// src/features/challenges/ChallengeSystem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
// import confetti from 'canvas-confetti'; // Eliminada la importación de confetti

// --- Componente de Modal para Vista Detallada de Desafío ---
const ChallengeDetailModal = ({ 
    challenge, 
    dailyGoals,
    onClose, 
    onToggleDailyGoalCompletion,
    onAddSubgoalAsDailyGoal,
    onLinkExistingDailyGoal,
    onUnlinkDailyGoal,
    theme, 
    notify 
}) => {
  const [showAddSubgoalForm, setShowAddSubgoalForm] = useState(false);
  
  const [newSubgoalText, setNewSubgoalText] = useState('');
  const [newSubgoalCategory, setNewSubgoalCategory] = useState('General');
  const [newSubgoalRewardType, setNewSubgoalRewardType] = useState('points');
  const [newSubgoalRewardAmount, setNewSubgoalRewardAmount] = useState('10');
  const [newSubgoalRecurrenceType, setNewSubgoalRecurrenceType] = useState('once');
  const [newSubgoalSelectedDays, setNewSubgoalSelectedDays] = useState([false, false, false, false, false, false, false]);
  const daysOfWeekShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  
  const closeButtonRef = useRef(null);
  const modalContentRef = useRef(null);
  
  useEffect(() => {
    if (closeButtonRef.current) closeButtonRef.current.focus();
  }, []);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);
  
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleModalClick = (e) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  const handleInternalAddSubgoal = () => {
    if (!newSubgoalText || !newSubgoalCategory || !newSubgoalRewardAmount) {
      notify('Por favor completa todos los campos requeridos de la submeta.', 'error');
      return;
    }
    const rewardAmountNum = parseInt(newSubgoalRewardAmount, 10);
    if (isNaN(rewardAmountNum) || rewardAmountNum <=0) {
        notify('La cantidad de recompensa debe ser un número positivo.', 'error');
        return;
    }
    
    const newSubgoalData = {
      text: newSubgoalText,
      category: newSubgoalCategory,
      rewardType: newSubgoalRewardType,
      rewardAmount: rewardAmountNum,
      recurrenceType: newSubgoalRecurrenceType,
      recurrenceDays: newSubgoalRecurrenceType === 'custom' ? newSubgoalSelectedDays : null,
    };
    
    onAddSubgoalAsDailyGoal(challenge.id, newSubgoalData);
    
    setNewSubgoalText(''); setNewSubgoalCategory('General'); setNewSubgoalRewardType('points');
    setNewSubgoalRewardAmount('10'); setNewSubgoalRecurrenceType('once');
    setNewSubgoalSelectedDays([false, false, false, false, false, false, false]);
    setShowAddSubgoalForm(false);
  };
  
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'var(--color-success)';
    if (progress >= 70) return 'var(--color-primary)';
    if (progress >= 40) return 'var(--color-accent)';
    return 'var(--color-warning)';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 'Fecha inválida';
    const diffTime = deadlineDate - now;
    if (diffTime < 0) return { text: 'Vencido', color: 'var(--color-error)' };
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { text: 'Hoy', color: 'var(--color-warning)' };
    if (diffDays === 1) return { text: 'Mañana', color: 'var(--color-warning)' };
    return { text: `${diffDays} días restantes`, color: 'var(--color-text-secondary)' };
  };

  const deadlineInfo = challenge.deadline ? getTimeRemaining(challenge.deadline) : null;
  
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Salud Física': return '💪'; case 'Salud Mental': return '🧠';
      case 'Habilidades': return '🎯';  case 'Finanzas': return '💰';
      case 'Personal': return '👤';    case 'Profesional': return '💼';
      default: return '📝';
    }
  };
  
  const linkedDailyGoalsDetails = dailyGoals?.filter(goal => 
    challenge.linkedGoals?.includes(goal.id)
  ) || [];

  const [showLinkGoalSelector, setShowLinkGoalSelector] = useState(false);
  const unlinkedDailyGoals = dailyGoals?.filter(goal => !challenge.linkedGoals?.includes(goal.id)) || [];

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={handleModalClick}
    >
      <div 
        ref={modalContentRef}
        className="max-w-3xl w-full rounded-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col" 
        style={{ 
          backgroundColor: theme === THEMES.GOTHIC ? '#1f1f1f' : '#ffffff',
          color: 'var(--color-text)',
          border: `1px solid var(--color-border, ${theme === THEMES.GOTHIC ? '#333' : '#ddd'})`
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <span className="text-5xl">{getCategoryIcon(challenge.category)}</span>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{challenge.title}</h2>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-secondary-accent)', color: 'var(--color-text-secondary)'}}>
                    {challenge.category}
                  </span>
                  {challenge.hasReward && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent-text, var(--color-accent))'}}>
                      Recompensa: {challenge.rewardType === 'points' ? `${challenge.rewardAmount} pts` : challenge.customReward}
                    </span>
                  )}
                  {deadlineInfo && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: theme === THEMES.GOTHIC ? '#333' : '#eee', color: deadlineInfo.color }}>
                      {deadlineInfo.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button ref={closeButtonRef} onClick={onClose} className="text-3xl p-1 rounded-full hover:bg-opacity-20 transition-colors"
                    style={{ color: 'var(--color-text-secondary)', '--hover-bg': 'var(--color-secondary-accent)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Cerrar detalle">
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {challenge.description && (
            <div className="mb-6 p-4 rounded-md" style={{backgroundColor: 'var(--color-bg-alt)'}}>
              <h3 className="text-lg font-semibold mb-1.5" style={{color: 'var(--color-primary)'}}>Descripción del Desafío</h3>
              <p className="opacity-90 text-sm leading-relaxed">{challenge.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Detalles</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="opacity-70">Creado:</span><span>{formatDate(challenge.createdAt)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Límite:</span><span>{formatDate(challenge.deadline)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Metas para Completar:</span><span>{challenge.targetAmount}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Metas Vinculadas:</span><span>{challenge.linkedGoals?.length || 0}</span></div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2.5">Progreso Actual</h3>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-4xl font-bold" style={{color: getProgressColor(challenge.progress)}}>{challenge.progress || 0}%</span>
                <span className="text-sm">{linkedDailyGoalsDetails.filter(g=>g.completed).length} de {challenge.targetAmount} metas completadas</span>
              </div>
              <div className="h-5 w-full rounded-full overflow-hidden shadow-inner" style={{backgroundColor: 'var(--color-secondary-accent)'}}>
                <div className="h-full transition-all duration-1000 ease-out rounded-full"
                     style={{ width: `${challenge.progress || 0}%`, backgroundColor: getProgressColor(challenge.progress) }}>
                </div>
              </div>
              <p className="mt-2 text-xs text-center opacity-80">
                {challenge.progress >= 100 ? '¡Felicidades, desafío completado!' : `Sigue adelante, ¡tú puedes!`}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold">Metas Diarias Vinculadas ({linkedDailyGoalsDetails.length})</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowLinkGoalSelector(!showLinkGoalSelector)}
                        className="py-1.5 px-3 rounded-md text-xs font-medium flex items-center gap-1"
                        style={{backgroundColor: 'var(--color-primary-accent)', color: 'var(--color-primary)'}}>
                  🔗 Vincular Existente
                </button>
                <button onClick={() => setShowAddSubgoalForm(!showAddSubgoalForm)}
                        className="py-1.5 px-3 rounded-md text-xs font-medium text-white flex items-center gap-1"
                        style={{backgroundColor: 'var(--color-primary)'}}>
                  {showAddSubgoalForm ? '➖ Cancelar' : '➕ Añadir Nueva Meta al Desafío'}
                </button>
              </div>
            </div>

            {showAddSubgoalForm && (
              <div className="p-4 border rounded-lg mb-4 shadow" style={{ borderColor: 'var(--color-primary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'var(--color-bg)'}}>
                <h4 className="font-semibold mb-3 text-md">Añadir Nueva Meta Vinculada</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block mb-1 text-xs font-medium">Descripción</label>
                        <input type="text" value={newSubgoalText} onChange={(e) => setNewSubgoalText(e.target.value)} className="w-full p-2 border rounded text-sm" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}/>
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium">Categoría</label>
                        <select value={newSubgoalCategory} onChange={(e) => setNewSubgoalCategory(e.target.value)} className="w-full p-2 border rounded text-sm" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}>
                            {['General', 'Salud Física', 'Salud Mental', 'Habilidades', 'Finanzas', 'Personal', 'Profesional', 'Estudio', 'Práctica'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium">Recompensa (Tipo)</label>
                        <select value={newSubgoalRewardType} onChange={(e) => setNewSubgoalRewardType(e.target.value)} className="w-full p-2 border rounded text-sm" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}>
                            <option value="points">Puntos</option><option value="socialTime">Tiempo Social</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-medium">Recompensa (Cantidad)</label>
                        <input type="number" value={newSubgoalRewardAmount} onChange={(e) => setNewSubgoalRewardAmount(e.target.value)} min="1" className="w-full p-2 border rounded text-sm" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}/>
                    </div>
                </div>
                 <div className="mt-3">
                    <label className="block mb-1 text-xs font-medium">Recurrencia</label>
                    <select value={newSubgoalRecurrenceType} onChange={(e) => setNewSubgoalRecurrenceType(e.target.value)} className="w-full p-2 border rounded text-sm" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}>
                      <option value="once">Una vez</option><option value="daily">Diaria</option>
                      <option value="weekdays">L-V</option><option value="custom">Personalizada</option>
                    </select>
                  </div>
                  {newSubgoalRecurrenceType === 'custom' && (
                    <div className="mt-2 p-2 border rounded" style={{borderColor: 'var(--color-secondary-accent)'}}>
                      <label className="block mb-1 text-xs font-medium">Días</label>
                      <div className="grid grid-cols-7 gap-1">
                        {daysOfWeekShort.map((day, index) => (
                          <label key={index} className={`flex flex-col items-center p-1 border rounded text-xs cursor-pointer ${newSubgoalSelectedDays[index] ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                                style={{borderColor: newSubgoalSelectedDays[index] ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: newSubgoalSelectedDays[index] ? 'var(--color-primary-accent)' : 'transparent', color: 'var(--color-text)'}}>
                            <input type="checkbox" checked={newSubgoalSelectedDays[index]} onChange={() => { const d = [...newSubgoalSelectedDays]; d[index] = !d[index]; setNewSubgoalSelectedDays(d);}} className="sr-only"/>
                            {day}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                <button onClick={handleInternalAddSubgoal} className="mt-3 py-1.5 px-4 rounded-md text-sm font-medium text-white" style={{backgroundColor: 'var(--color-primary)'}}>Añadir y Vincular Meta</button>
              </div>
            )}
            
            {showLinkGoalSelector && (
                <div className="p-4 border rounded-lg mb-4 shadow" style={{ borderColor: 'var(--color-primary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'var(--color-bg)'}}>
                    <h4 className="font-semibold mb-2 text-md">Vincular Meta Diaria Existente</h4>
                    {unlinkedDailyGoals.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                            {unlinkedDailyGoals.map(goal => (
                                <div key={goal.id} className="flex justify-between items-center p-1.5 border rounded-md text-xs" style={{borderColor: 'var(--color-border)'}}>
                                    <span>{goal.text} ({goal.category})</span>
                                    <button onClick={() => { onLinkExistingDailyGoal(challenge.id, goal.id); setShowLinkGoalSelector(false); }}
                                            className="py-0.5 px-2 rounded text-white text-xs" style={{backgroundColor: 'var(--color-primary)'}}>Vincular</button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-xs opacity-70">No hay otras metas diarias disponibles para vincular.</p>}
                     <button onClick={() => setShowLinkGoalSelector(false)} className="mt-2 text-xs py-1 px-2 rounded" style={{backgroundColor: 'var(--color-secondary)'}}>Cancelar</button>
                </div>
            )}

            {linkedDailyGoalsDetails.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mt-2">
                {linkedDailyGoalsDetails.map((goal) => (
                  <div key={goal.id} className="p-3.5 border rounded-lg flex items-center justify-between shadow-sm"
                       style={{ borderColor: goal.completed ? 'var(--color-success-border, var(--color-success))' : 'var(--color-border)', backgroundColor: goal.completed ? (theme === THEMES.GOTHIC ? '#283b28' : '#f0fff4') : (theme === THEMES.GOTHIC ? '#2b2b2b' : 'var(--color-bg-alt)') , opacity: goal.completed ? 0.8 : 1 }}>
                    <div className="flex items-center flex-grow">
                      <input type="checkbox" checked={goal.completed} onChange={() => onToggleDailyGoalCompletion(goal.id)}
                             className="mr-3 h-5 w-5 rounded" style={{accentColor: 'var(--color-primary)'}}/>
                      <div className="flex-grow">
                        <p className={`font-medium text-sm ${goal.completed ? 'line-through' : ''}`}>{goal.text}</p>
                        <p className="text-xs opacity-70 mt-0.5">{goal.category} • {goal.rewardType === 'points' ? `${goal.rewardAmount}pts` : `${goal.rewardAmount}min`}</p>
                      </div>
                    </div>
                    <button onClick={() => onUnlinkDailyGoal(challenge.id, goal.id)}
                            className="ml-2 py-1 px-2.5 rounded-md text-xs font-medium transition-colors"
                            style={{backgroundColor: 'var(--color-secondary-accent)', color: 'var(--color-text-secondary)'}}
                            title="Desvincular esta meta del desafío">
                      Desvincular
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-5 italic opacity-70 text-sm">No hay metas diarias vinculadas a este desafío aún.</p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-opacity-50" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
          <div className="flex justify-end">
            <button onClick={onClose} className="py-2 px-5 rounded-lg font-medium transition-colors"
                    style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ChallengeSystem ---
const ChallengeSystem = ({ dailyGoals, onLinkGoal, notify, points, onAddPoints, onAddDailyGoal }) => {
  const { theme } = useTheme();
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_challenges_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChallengeIdForModal, setSelectedChallengeIdForModal] = useState(null);
  
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeCategory, setNewChallengeCategory] = useState('Habilidades');
  const [newChallengeTargetAmount, setNewChallengeTargetAmount] = useState('10');
  const [newChallengeDeadline, setNewChallengeDeadline] = useState('');
  const [newChallengeHasReward, setNewChallengeHasReward] = useState(false);
  const [newChallengeRewardType, setNewChallengeRewardType] = useState('points');
  const [newChallengeRewardAmount, setNewChallengeRewardAmount] = useState('');
  const [newChallengeCustomReward, setNewChallengeCustomReward] = useState('');

  useEffect(() => {
    localStorage.setItem('doorsuffer_challenges_v2', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    if (challenges.length === 0 || !dailyGoals || dailyGoals.length === 0) return;
    
    let challengesUpdated = false;
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.completed) return challenge;

      const linkedGoalsDetails = challenge.linkedGoals
        ?.map(goalId => dailyGoals.find(dg => dg.id === goalId))
        .filter(Boolean) || [];
      
      const completedLinkedGoalsCount = linkedGoalsDetails.filter(goal => goal.completed).length;
      const progress = Math.min(100, Math.round((completedLinkedGoalsCount / Math.max(1, challenge.targetAmount)) * 100));
      
      let newCompletedState = challenge.completed;
      let newRewardClaimedState = challenge.rewardClaimed;

      if (progress >= 100 && !challenge.completed) {
        newCompletedState = true;
        challengesUpdated = true;
        if (notify) notify(`¡Desafío "${challenge.title}" completado!`, 'success');
        
        if (challenge.hasReward && !challenge.rewardClaimed) {
          newRewardClaimedState = true;
          if (challenge.rewardType === 'points' && onAddPoints && challenge.rewardAmount > 0) {
            onAddPoints(challenge.rewardAmount, `Desafío completado: ${challenge.title}`);
            if (notify) notify(`Has ganado ${challenge.rewardAmount} puntos por el desafío.`, 'info');
          } else if (challenge.rewardType === 'custom' && challenge.customReward) {
            if (notify) notify(`Recompensa del desafío: "${challenge.customReward}"`, 'info');
          }
          // Confetti effect was here, now removed
          // confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 10000 });
        }
      }
      
      if (challenge.progress !== progress || newCompletedState !== challenge.completed || newRewardClaimedState !== challenge.rewardClaimed) {
        challengesUpdated = true;
        return { ...challenge, progress, completed: newCompletedState, rewardClaimed: newRewardClaimedState };
      }
      return challenge;
    });

    if (challengesUpdated) {
      setChallenges(updatedChallenges);
    }
  }, [dailyGoals, challenges, notify, onAddPoints]);
  
  const handleAddChallenge = (e) => {
    e.preventDefault();
    if (!newChallengeTitle.trim() || !newChallengeCategory || !newChallengeTargetAmount) {
      notify('Título, categoría y número de metas son requeridos.', 'error');
      return;
    }
    const targetAmountNum = parseInt(newChallengeTargetAmount, 10);
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
        notify('El número de metas debe ser positivo.', 'error');
        return;
    }
    if (newChallengeHasReward) {
        if (newChallengeRewardType === 'points') {
            const rewardAmountNum = parseInt(newChallengeRewardAmount, 10);
            if (isNaN(rewardAmountNum) || rewardAmountNum <= 0) {
                notify('La cantidad de puntos de recompensa debe ser positiva.', 'error');
                return;
            }
        } else if (!newChallengeCustomReward.trim()) {
            notify('La descripción de la recompensa personalizada es requerida.', 'error');
            return;
        }
    }

    const newChallenge = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      title: newChallengeTitle,
      description: newChallengeDescription,
      category: newChallengeCategory,
      targetAmount: targetAmountNum,
      deadline: newChallengeDeadline || null,
      hasReward: newChallengeHasReward,
      rewardType: newChallengeHasReward ? newChallengeRewardType : null,
      rewardAmount: newChallengeHasReward && newChallengeRewardType === 'points' ? parseInt(newChallengeRewardAmount, 10) : null,
      customReward: newChallengeHasReward && newChallengeRewardType === 'custom' ? newChallengeCustomReward : null,
      createdAt: new Date().toISOString(),
      progress: 0,
      completed: false,
      linkedGoals: [],
      rewardClaimed: false,
    };
  
    setChallenges(prev => [newChallenge, ...prev]);
    notify('Nuevo desafío creado. ¡A por ello!', 'success');
    
    setShowAddForm(false);
    setNewChallengeTitle(''); setNewChallengeDescription(''); setNewChallengeCategory('Habilidades');
    setNewChallengeTargetAmount('10'); setNewChallengeDeadline(''); setNewChallengeHasReward(false);
    setNewChallengeRewardType('points'); setNewChallengeRewardAmount(''); setNewChallengeCustomReward('');
  };

  const handleAddSubgoalAsDailyGoal = (challengeId, subgoalData) => {
    if (!onAddDailyGoal) {
        notify("La funcionalidad para añadir metas diarias no está disponible.", "error");
        return;
    }
    const newDailyGoalId = onAddDailyGoal(subgoalData, true); 
    if (!newDailyGoalId) {
        notify("No se pudo crear la nueva meta diaria.", "error");
        return;
    }
    setChallenges(prevChallenges => prevChallenges.map(ch => 
        ch.id === challengeId ? { ...ch, linkedGoals: [...(ch.linkedGoals || []), newDailyGoalId] } : ch
    ));
    notify(`Nueva meta "${subgoalData.text}" añadida y vinculada al desafío.`, 'success');
  };

  const handleLinkExistingDailyGoal = (challengeId, goalId) => {
     setChallenges(prevChallenges => prevChallenges.map(ch => {
        if (ch.id === challengeId) {
            if (!ch.linkedGoals?.includes(goalId)) {
                return { ...ch, linkedGoals: [...(ch.linkedGoals || []), goalId] };
            }
        }
        return ch;
     }));
     // La prop onLinkGoal de App.jsx ya no es necesaria aquí si la lógica está autocontenida.
     // Si se necesita para notificar a App.jsx por alguna otra razón, se puede llamar.
     // if (onLinkGoal) onLinkGoal(challengeId, goalId);
     notify("Meta diaria vinculada al desafío.", "info");
  };

  const handleUnlinkDailyGoal = (challengeId, goalId) => {
    setChallenges(prevChallenges => prevChallenges.map(ch => 
        ch.id === challengeId ? { ...ch, linkedGoals: (ch.linkedGoals || []).filter(id => id !== goalId) } : ch
    ));
    notify("Meta diaria desvinculada del desafío.", "info");
  };

  const handleToggleDailyGoalCompletionInModal = (goalId) => {
    // Esta es la función que DEBE venir de App.jsx para modificar el estado de dailyGoals
    // La prop onAddDailyGoal era un nombre confuso para esto, se debería pasar una prop como `onToggleGoal` de App.jsx
    // Por ahora, asumiré que `onAddDailyGoal` es en realidad la función `toggleGoalCompletion` de App.
    // Si onAddDailyGoal es solo para añadir, esta función no funcionará y se necesita una nueva prop.
    if (typeof onAddDailyGoal === 'function' && dailyGoals.find(g => g.id === goalId)) {
        // Esto es incorrecto, onAddDailyGoal es para añadir.
        // Necesitas una prop como `toggleDailyGoal(goalId)` desde App.jsx
        // Esta es una limitación de la estructura actual de props.
        // Lo ideal: App.jsx pasa `toggleGoal(goalId)` a ChallengeSystem, y este al modal.
        console.warn("Placeholder: Se necesita una prop de App.jsx para cambiar el estado de 'completed' de las metas diarias.");
        notify("Acción no completada: Falta función para modificar estado de meta desde App.", "warning");

        // Simulación visual (no afecta el estado real en App.jsx):
        // const tempDailyGoals = dailyGoals.map(dg => dg.id === goalId ? {...dg, completed: !dg.completed} : dg);
        // Esto NO actualiza el estado en App.jsx, solo es para el ejemplo.
        // El useEffect que escucha `dailyGoals` en este componente SÍ reaccionaría si el estado real en App.jsx cambia.
    } else {
        notify("No se puede cambiar el estado de la meta.", "error");
    }
  };

  const deleteChallenge = (challengeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este desafío? Sus metas vinculadas no se eliminarán, solo se desvincularán.')) {
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
      notify('Desafío eliminado.', 'info');
    }
  };
  
  const formatDateForCard = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try { return new Date(dateString).toLocaleDateString(undefined, options); }
    catch (e) { return 'Fecha inválida'; }
  };

  const getCategoryIconForCard = (category) => {
    switch(category) {
      case 'Salud Física': return '💪'; case 'Salud Mental': return '🧠';
      case 'Habilidades': return '🎯';  case 'Finanzas': return '💰';
      case 'Personal': return '👤';    case 'Profesional': return '💼';
      default: return '📝';
    }
  };
  
  const selectedChallengeDetails = challenges.find(ch => ch.id === selectedChallengeIdForModal);

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#18181b' : '#f9fafb',
      boxShadow: 'var(--box-shadow)', borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-border)', borderWidth: '1px'
    }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold tracking-tight" style={{color: 'var(--color-text-heading)'}}>Desafíos</h2>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg text-white font-semibold flex items-center shadow-md" style={{backgroundColor: 'var(--color-accent)'}}>
            <span className="mr-1.5 text-lg">💰</span>
            <span>{points} pts</span>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)}
                  className="p-2.5 rounded-full text-white transition-all transform hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: showAddForm ? 'var(--color-error)' : 'var(--color-primary)', 
                           '--ring-offset-color': theme === THEMES.GOTHIC ? '#18181b' : '#f9fafb',
                           '--ring-color': 'var(--color-primary-focus)' }}
                  aria-label={showAddForm ? "Cerrar formulario" : "Añadir nuevo desafío"}>
            {showAddForm ? <span className="text-xl font-bold">×</span> : <span className="text-xl font-bold">+</span>}
          </button>
        </div>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddChallenge} className="mb-8 p-6 border rounded-xl shadow-xl"
              style={{ borderColor: 'var(--color-primary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#27272a' : '#ffffff' }}>
          <h3 className="text-2xl font-semibold mb-5 text-center" style={{color: 'var(--color-primary)'}}>Crear Nuevo Desafío</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium">Título del Desafío <span className="text-red-500">*</span></label>
              <input type="text" value={newChallengeTitle} onChange={e => setNewChallengeTitle(e.target.value)} required 
                     className="w-full p-2.5 border rounded-md text-sm" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}} placeholder="Ej: Correr 5K en 1 mes"/>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">Categoría <span className="text-red-500">*</span></label>
              <select value={newChallengeCategory} onChange={e => setNewChallengeCategory(e.target.value)} required
                      className="w-full p-2.5 border rounded-md text-sm" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}>
                {['Habilidades', 'Salud Física', 'Salud Mental', 'Finanzas', 'Personal', 'Profesional'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-sm font-medium">Descripción (Opcional)</label>
              <textarea value={newChallengeDescription} onChange={e => setNewChallengeDescription(e.target.value)} rows="3"
                        className="w-full p-2.5 border rounded-md text-sm" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}} placeholder="Detalla tu desafío..."></textarea>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium"># Metas para Completar <span className="text-red-500">*</span></label>
              <input type="number" value={newChallengeTargetAmount} onChange={e => setNewChallengeTargetAmount(e.target.value)} required min="1"
                     className="w-full p-2.5 border rounded-md text-sm" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}} placeholder="Ej: 30"/>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium">Fecha Límite (Opcional)</label>
              <input type="date" value={newChallengeDeadline} onChange={e => setNewChallengeDeadline(e.target.value)} 
                     min={new Date().toISOString().split('T')[0]}
                     className="w-full p-2.5 border rounded-md text-sm" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}/>
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t" style={{borderColor: 'var(--color-border-light)'}}>
            <div className="flex items-center mb-3">
              <input type="checkbox" id="challengeHasRewardForm" checked={newChallengeHasReward} onChange={(e) => setNewChallengeHasReward(e.target.checked)} className="mr-2.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" style={{accentColor: 'var(--color-primary)'}}/>
              <label htmlFor="challengeHasRewardForm" className="text-sm font-medium">Recompensa por Completar este Desafío</label>
            </div>
            {newChallengeHasReward && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-md' style={{borderColor: 'var(--color-secondary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#202020' : '#fdfdff'}}>
                <div>
                  <label className="block mb-1 text-xs font-medium">Tipo de Recompensa</label>
                  <select value={newChallengeRewardType} onChange={(e) => setNewChallengeRewardType(e.target.value)} className="w-full p-2 border rounded-md text-xs" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}}>
                    <option value="points">Puntos</option><option value="custom">Personalizada</option>
                  </select>
                </div>
                {newChallengeRewardType === 'points' ? (
                  <div>
                    <label className="block mb-1 text-xs font-medium">Puntos a Ganar</label>
                    <input type="number" value={newChallengeRewardAmount} onChange={(e) => setNewChallengeRewardAmount(e.target.value)} min="1" className="w-full p-2 border rounded-md text-xs" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}} placeholder="Ej: 100" required={newChallengeHasReward}/>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-xs font-medium">Descripción Recompensa</label>
                    <textarea value={newChallengeCustomReward} onChange={(e) => setNewChallengeCustomReward(e.target.value)} className="w-full p-2 border rounded-md text-xs" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)'}} placeholder="Ej: Cena especial" required={newChallengeHasReward} rows="2"></textarea>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowAddForm(false)}
                    className="py-2 px-5 rounded-lg font-medium text-sm"
                    style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}>
              Cancelar
            </button>
            <button type="submit"
                    className="py-2 px-6 rounded-lg font-semibold text-sm text-white transition-transform hover:scale-105" 
                    style={{backgroundColor: 'var(--color-primary)'}}>
              Crear Desafío
            </button>
          </div>
        </form>
      )}
      
      {challenges.length === 0 && !showAddForm ? (
        <div className="text-center py-10 opacity-70">
          <p className="text-lg mb-2">No hay desafíos activos.</p>
          <p>¡Anímate a crear tu primer gran desafío!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {challenges.map(challenge => (
            <div key={challenge.id} 
                 className="p-5 border rounded-xl transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between group"
                 style={{ borderColor: challenge.completed ? 'var(--color-success-border, var(--color-success))' : 'var(--color-border)', 
                          backgroundColor: theme === THEMES.GOTHIC ? (challenge.completed ? '#283b28' : '#27272a') : (challenge.completed ? '#f0fff4' : '#ffffff'),
                          minHeight: '280px'
                        }}
                 onClick={() => setSelectedChallengeIdForModal(challenge.id)}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{getCategoryIconForCard(challenge.category)}</span>
                    <div>
                      <h4 className={`text-xl font-semibold leading-tight ${challenge.completed ? 'line-through text-opacity-70' : ''}`}>{challenge.title}</h4>
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full mt-1" style={{ backgroundColor: 'var(--color-secondary-accent)', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                  {!challenge.completed && (
                    <button onClick={(e) => { e.stopPropagation(); deleteChallenge(challenge.id); }} 
                            className="text-red-500 p-1.5 hover:bg-red-100 dark:hover:bg-red-800 rounded-full transition-colors opacity-50 group-hover:opacity-100" 
                            aria-label="Eliminar desafío">
                      ×
                    </button>
                  )}
                </div>
                {challenge.description && (
                  <p className="text-xs opacity-80 mb-3 line-clamp-2 h-8">{challenge.description}</p>
                )}
                 {challenge.deadline && !challenge.completed && (
                    <p className="text-xs font-medium mb-1" style={{color: getTimeRemaining(challenge.deadline)?.color || 'var(--color-text-secondary)'}}>
                        Límite: {formatDateForCard(challenge.deadline)} ({getTimeRemaining(challenge.deadline)?.text})
                    </p>
                 )}
                {challenge.hasReward && (
                    <p className="text-xs mb-2" style={{color: 'var(--color-accent)'}}>
                        Recompensa: {challenge.rewardType === 'points' ? `${challenge.rewardAmount}pts` : (challenge.customReward.length > 20 ? challenge.customReward.substring(0,18)+'...' : challenge.customReward)}
                    </p>
                )}
              </div>
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1 opacity-80">
                  <span>Progreso: {challenge.progress || 0}%</span>
                  <span>{challenge.linkedGoals?.filter(gid => dailyGoals?.find(dg => dg.id === gid)?.completed).length || 0} / {challenge.targetAmount} metas</span>
                </div>
                <div className="overflow-hidden h-3.5 text-xs flex rounded-full shadow-inner" style={{backgroundColor: 'var(--color-secondary-accent)'}}>
                  <div style={{ width: `${challenge.progress || 0}%`, backgroundColor: challenge.completed ? 'var(--color-success)' : 'var(--color-primary)'}} 
                       className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-out">
                  </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedChallengeIdForModal(challenge.id); }}
                    className="w-full mt-3 py-1.5 px-3 rounded-md font-medium text-xs text-center transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-alt)', 
                        color: 'var(--color-primary)', 
                        border: `1px solid var(--color-primary-accent)`
                    }}
                >
                    Ver Detalles y Metas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedChallengeDetails && (
        <ChallengeDetailModal
          challenge={selectedChallengeDetails}
          dailyGoals={dailyGoals || []} // Asegurar que dailyGoals no sea undefined
          onClose={() => setSelectedChallengeIdForModal(null)}
          onToggleDailyGoalCompletion={handleToggleDailyGoalCompletionInModal}
          onAddSubgoalAsDailyGoal={handleAddSubgoalAsDailyGoal}
          onLinkExistingDailyGoal={handleLinkExistingDailyGoal}
          onUnlinkDailyGoal={handleUnlinkDailyGoal}
          theme={theme}
          notify={notify}
        />
      )}
    </section>
  );
};

export default ChallengeSystem;