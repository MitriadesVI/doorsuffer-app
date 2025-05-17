// src/features/penalties/PenaltySystem.jsx (versión corregida y unida)
import React, { useState } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const PenaltySystem = ({ onApplyPenalty, challenges, notify, penalties = [], onCompletePenalty, onDeletePenalty }) => {
  const { theme } = useTheme();
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyType, setPenaltyType] = useState('socialTime');
  const [recurrenceType, setRecurrenceType] = useState('once');
  const [selectedDays, setSelectedDays] = useState([false, false, false, false, false, false, false]);
  const [linkedChallenge, setLinkedChallenge] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const groupCommitmentsByMonth = () => {
    const grouped = {};
    penalties.filter(p => p.isCommitment && !p.completed && p.dueDate) // Solo futuros o no completados con fecha
      .forEach(commitment => {
        const date = new Date(commitment.dueDate + 'T00:00:00'); // Asegurar que se interprete en zona horaria local
        const monthYear = `${date.toLocaleString('es-ES', { month: 'long' })} ${date.getFullYear()}`; // 'es-ES' para español
        
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(commitment);
      });
    
    // Ordenar los meses cronológicamente
    const sortedMonthYears = Object.keys(grouped).sort((a, b) => {
        const dateA = new Date(a.split(" ")[1], getMonthIndex(a.split(" ")[0]));
        const dateB = new Date(b.split(" ")[1], getMonthIndex(b.split(" ")[0]));
        return dateA - dateB;
    });
    
    const sortedGrouped = {};
    sortedMonthYears.forEach(key => {
        sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  };

  // Helper para obtener el índice del mes (0-11) a partir del nombre en español
  const getMonthIndex = (monthName) => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return months.indexOf(monthName.toLowerCase());
  }


  const handlePenaltySubmit = (e) => {
    e.preventDefault();
    
    if (penaltyReason.trim() === '') {
      if (notify) notify('Por favor, escribe una descripción para el compromiso.', 'error');
      else alert('Por favor, escribe una descripción para el compromiso.');
      return;
    }

    const currentPenaltyAmount = parseInt(penaltyAmount, 10);
    if (isNaN(currentPenaltyAmount) || currentPenaltyAmount <= 0) {
      if (notify) notify('Por favor, introduce un monto válido para la penalización.', 'error');
      else alert('Por favor, introduce un monto válido para la penalización.');
      return;
    }

    const isScheduledCommitment = dueDate && dueTime;
    
    const penalty = {
      id: Date.now().toString(),
      reason: penaltyReason,
      type: penaltyType,
      amount: currentPenaltyAmount,
      recurrenceType: recurrenceType,
      recurrenceDays: recurrenceType === 'custom' ? selectedDays : null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      linkedChallenge: linkedChallenge || null,
      completed: false,
      isCommitment: isScheduledCommitment,
      penaltyApplied: false, 
      timestamp: new Date().toISOString()
    };
    
    onApplyPenalty(penalty);
    
    setPenaltyReason('');
    setPenaltyType('socialTime');
    setPenaltyAmount('');
    setRecurrenceType('once');
    setSelectedDays([false, false, false, false, false, false, false]);
    setLinkedChallenge('');
    setDueDate('');
    setDueTime('');
    setShowPenaltyForm(false);
  };

  const isOverdue = (commitment) => {
    if (!commitment.dueDate || !commitment.dueTime || commitment.completed) return false;
    const now = new Date();
    const dueDateTime = new Date(`${commitment.dueDate}T${commitment.dueTime}`);
    return now > dueDateTime;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeRemaining = (commitment) => {
    if (!commitment.dueDate || !commitment.dueTime) return null;
    const now = new Date();
    const dueDateTime = new Date(`${commitment.dueDate}T${commitment.dueTime}`);
    const diffMs = dueDateTime - now;
    
    if (diffMs <= 0) return 'Vencido';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return `${diffMinutes} min`;
  };

  const getCommitmentStats = () => {
    if (!penalties || penalties.length === 0) return null;
    
    const activeCommitments = penalties.filter(p => p.isCommitment); // Considerar todos los compromisos para estadísticas generales
    if (activeCommitments.length === 0) return null;

    const totalCommitments = activeCommitments.length;
    const completedCommitments = activeCommitments.filter(p => p.completed).length;
    const overdueCommitments = activeCommitments.filter(p => !p.completed && isOverdue(p)).length;
    // Tasa de éxito sobre los que ya pasaron su fecha o están completados
    const relevantForSuccessRate = activeCommitments.filter(p => p.completed || isOverdue(p)).length;
    const successRate = relevantForSuccessRate > 0 ? Math.round((completedCommitments / relevantForSuccessRate) * 100) : 100; // 100 si no hay relevantes aún
    
    const byType = {
      points: activeCommitments.filter(p => p.type === 'points').length,
      socialTime: activeCommitments.filter(p => p.type === 'socialTime').length
    };
    
    return {
      total: totalCommitments,
      completed: completedCommitments,
      overdue: overdueCommitments,
      successRate: successRate,
      byType: byType
    };
  };

  const stats = getCommitmentStats();
  const groupedCommitments = groupCommitmentsByMonth();

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Mis Compromisos</h2>
        <button 
          onClick={() => setShowPenaltyForm(!showPenaltyForm)}
          className="py-2 px-4 rounded-md text-white transition-colors"
          style={{ 
            backgroundColor: showPenaltyForm ? 'var(--color-secondary)' : 'var(--color-accent)',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
          aria-label={showPenaltyForm ? "Cerrar formulario" : "Añadir compromiso"}
        >
          {showPenaltyForm ? <span>Cancelar</span> : (<><span style={{fontSize: '1.25rem'}}>📝</span><span>Nuevo Compromiso</span></>)}
        </button>
      </div>
      
      <p className="mb-5 text-sm opacity-80">
        Gestiona tus compromisos y establece consecuencias para cumplirlos. Si no los cumples a tiempo, 
        se aplicará la penalización automáticamente.
      </p>
      
      {showPenaltyForm && (
        <form 
          onSubmit={handlePenaltySubmit} 
          className="mb-6 p-5 border rounded-lg"
          style={{ 
            borderColor: 'var(--color-secondary-accent)', 
            backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f9fafb')
          }}
        >
          <h3 className="text-lg font-medium mb-4">Nuevo Compromiso</h3>
          <div className="mb-4">
            <label htmlFor="penaltyReason" className="block mb-1 font-medium text-sm">Descripción del Compromiso</label>
            <input type="text" id="penaltyReason" name="reason" value={penaltyReason} onChange={(e) => setPenaltyReason(e.target.value)}
                   className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}
                   placeholder="Ej: Entregar informe de ventas" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Fecha Límite</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={getCurrentDate()}
                     className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}/>
              <p className="text-xs mt-1 opacity-70">Cuándo debe completarse</p>
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">Hora Límite</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                     className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}/>
              <p className="text-xs mt-1 opacity-70">Hora máxima para cumplirlo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Tipo de Penalización</label>
              <select name="penaltyType" value={penaltyType} onChange={(e) => setPenaltyType(e.target.value)} required
                      className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}>
                <option value="socialTime">⏱️ Tiempo para Redes Sociales</option>
                <option value="points">🌟 Puntos</option>
              </select>
              <p className="text-xs mt-1 opacity-70">Qué perderás si no cumples</p>
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">{penaltyType === 'socialTime' ? 'Tiempo a restar (minutos)' : 'Puntos a restar'}</label>
              <input type="number" name="penaltyAmount" min="1" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} required
                     className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}
                     placeholder={penaltyType === 'socialTime' ? 'Ej: 15' : 'Ej: 10'} />
              <p className="text-xs mt-1 opacity-70">Cantidad que perderás</p>
            </div>
          </div>
          <div className="p-3 border rounded-lg mb-4" style={{borderColor: 'var(--color-secondary-accent)'}}>
            <label className="block mb-2 font-medium text-sm">Recurrencia</label>
            <select name="recurrenceType" value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}
                    className="w-full p-2 border rounded mb-3" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}>
              <option value="once">Una vez (no repetir)</option> <option value="daily">Diariamente</option>
              <option value="weekly">Cada 7 días</option> <option value="monthly">Mensualmente</option>
              <option value="custom">Días específicos</option>
            </select>
            {recurrenceType === 'custom' && (
              <div className="mt-2">
                <label className="block mb-2 text-sm">Selecciona los días:</label>
                <div className="grid grid-cols-7 gap-1">
                  {daysOfWeek.map((day, index) => (
                    <label key={index} className="flex flex-col items-center p-2 rounded cursor-pointer hover:bg-opacity-10"
                           style={{borderColor: selectedDays[index] ? 'var(--color-primary)' : 'transparent', backgroundColor: selectedDays[index] ? (theme === THEMES.GOTHIC ? 'rgba(255,255,255,0.1)' : 'var(--color-primary-accent)') : 'transparent'}}>
                      <input type="checkbox" checked={selectedDays[index]}
                             onChange={() => { const newDays = [...selectedDays]; newDays[index] = !newDays[index]; setSelectedDays(newDays); }}
                             className="sr-only" />
                      <span className="text-sm font-medium">{day.charAt(0)}</span>
                      <span className={`mt-1 w-2 h-2 rounded-full ${selectedDays[index] ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: 'var(--color-primary)'}}></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {challenges && challenges.length > 0 && (
            <div className="mb-4">
              <label className="block mb-1 font-medium text-sm">Vincular a un Desafío (opcional)</label>
              <select name="linkedChallenge" value={linkedChallenge} onChange={(e) => setLinkedChallenge(e.target.value)}
                      className="w-full p-2 border rounded" style={{borderColor: 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb', color: 'var(--color-text)'}}>
                <option value="">No vincular a ningún desafío</option>
                {challenges.map(challenge => (<option key={challenge.id} value={challenge.id}>{challenge.title}</option>))}
              </select>
              <p className="text-xs mt-1 opacity-70">Relaciona con un desafío a largo plazo</p>
            </div>
          )}
          <div className="flex space-x-2 mt-5">
            <button type="submit" className="py-2 px-4 rounded font-medium flex-1 text-white" style={{backgroundColor: 'var(--color-accent)'}}>Guardar Compromiso</button>
            <button type="button" onClick={() => { setShowPenaltyForm(false); /* Reset form states here */ }}
                    className="py-2 px-4 rounded font-medium" style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}>Cancelar</button>
          </div>
        </form>
      )}
      
      {stats && (
        <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f3f4f6')}}>
          <h3 className="font-medium text-lg mb-3">Resumen de Compromisos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg text-center" style={{backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <span className="block text-2xl font-bold" style={{color: 'var(--color-primary)'}}>{stats.total}</span>
              <span className="text-sm opacity-80">Total</span>
            </div>
            <div className="p-3 rounded-lg text-center" style={{backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <span className="block text-2xl font-bold" style={{color: 'var(--color-success)'}}>{stats.completed}</span>
              <span className="text-sm opacity-80">Completados</span>
            </div>
            <div className="p-3 rounded-lg text-center" style={{backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <span className="block text-2xl font-bold" style={{color: stats.overdue > 0 ? 'var(--color-accent)' : 'var(--color-success)'}}>{stats.overdue}</span>
              <span className="text-sm opacity-80">Vencidos</span>
            </div>
            <div className="p-3 rounded-lg text-center" style={{backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <span className="block text-2xl font-bold" style={{color: stats.successRate >= 70 ? 'var(--color-success)' : stats.successRate >= 40 ? 'var(--color-primary)' : 'var(--color-accent)'}}>{stats.successRate}%</span>
              <span className="text-sm opacity-80">Tasa de Éxito</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center space-x-6">
            <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: 'var(--color-primary)'}}></span><span className="text-sm">Tiempo: {stats.byType.socialTime}</span></div>
            <div className="flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: 'var(--color-accent)'}}></span><span className="text-sm">Puntos: {stats.byType.points}</span></div>
          </div>
        </div>
      )}
      
      {penalties && penalties.filter(p => p.isCommitment && !p.completed).length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Compromisos Activos Próximos</h3>
          <div className="space-y-3">
            {penalties.filter(p => p.isCommitment && !p.completed)
              .sort((a, b) => {
                if (!a.dueDate || !a.dueTime) return 1; if (!b.dueDate || !b.dueTime) return -1;
                const dateA = new Date(`${a.dueDate}T${a.dueTime}`); const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
                return dateA - dateB;
              })
              .map((commitment) => {
                const isCommitmentOverdue = isOverdue(commitment); const timeRemaining = getTimeRemaining(commitment);
                return (
                  <div key={commitment.id} className="p-4 border rounded-lg transition-all"
                       style={{borderColor: isCommitmentOverdue ? 'var(--color-accent)' : 'var(--color-secondary)', backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : 'white'), boxShadow: isCommitmentOverdue ? '0 2px 4px rgba(239, 68, 68, 0.2)' : 'none'}}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <div className="relative">
                          <input type="checkbox" id={`commitment-${commitment.id}`} checked={commitment.completed}
                                 onChange={() => onCompletePenalty && onCompletePenalty(commitment.id)} className="sr-only"/>
                          <label htmlFor={`commitment-${commitment.id}`} className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer"
                                 style={{backgroundColor: commitment.completed ? 'var(--color-success)' : 'transparent', borderWidth: '2px', borderColor: commitment.completed ? 'var(--color-success)' : (isCommitmentOverdue ? 'var(--color-accent)' : 'var(--color-primary)')}}>
                            {commitment.completed && (<span className="text-white text-xs">✓</span>)}
                          </label>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start mb-1">
                          <p className={`font-medium ${commitment.completed ? 'line-through opacity-70' : ''}`}>{commitment.reason}</p>
                          {commitment.dueDate && commitment.dueTime && (
                            <div className="ml-auto pl-2"> {/* Añadido pl-2 para espacio en móvil */}
                              {isCommitmentOverdue ? (<span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 border border-red-300 font-medium">¡VENCIDO!</span>)
                               : (<span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Tiempo: {timeRemaining}</span>)}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs"> {/* sm:grid-cols-2 para mejor layout en móvil */}
                          <div className="flex items-center text-gray-600 dark:text-gray-400"><span className="mr-1">📅</span><span>{commitment.dueDate && commitment.dueTime ? `${formatDate(commitment.dueDate)} a las ${commitment.dueTime}` : 'Sin fecha límite'}</span></div>
                          <div className={`flex items-center ${isCommitmentOverdue ? 'text-red-600 font-medium dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}><span className="mr-1">{isCommitmentOverdue ? '⚠️' : '⚖️'}</span><span>{commitment.type === 'socialTime' ? `${commitment.amount} min` : `${commitment.amount} pts`}</span></div>
                        </div>
                        {commitment.recurrenceType && commitment.recurrenceType !== 'once' && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center"><span className="mr-1">🔄</span>
                            <span>{commitment.recurrenceType === 'daily' ? 'Diario' : commitment.recurrenceType === 'weekly' ? 'Semanal' : commitment.recurrenceType === 'monthly' ? 'Mensual' : commitment.recurrenceType === 'custom' ? (commitment.recurrenceDays && commitment.recurrenceDays.some(d => d) ? daysOfWeek.filter((_day, i) => commitment.recurrenceDays[i]).map(d => d.charAt(0)).join(', ') : 'Personalizado') : commitment.recurrenceType}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => onDeletePenalty && onDeletePenalty(commitment.id)} className="ml-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors" aria-label="Eliminar compromiso">✕</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Vista calendario de compromisos futuros - Reemplaza el historial */}
      {Object.keys(groupedCommitments).length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Agenda de Compromisos</h3>
          
          <div className="space-y-5">
            {Object.entries(groupedCommitments).map(([monthYear, commitmentsInMonth]) => ( // Renombrado commitments a commitmentsInMonth
              <div key={monthYear} className="border rounded-lg overflow-hidden" style={{
                borderColor: 'var(--color-secondary)',
                backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : 'white'),
              }}>
                <div className="p-3 font-medium text-center" style={{ // Centrado el título del mes
                  backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'var(--color-primary-accent)',
                  color: theme === THEMES.GOTHIC ? 'white' : 'var(--color-primary)'
                }}>
                  {monthYear}
                </div>
                
                <div className="p-3 space-y-2">
                  {commitmentsInMonth.sort((a, b) => { // Usar commitmentsInMonth
                    const dateA = new Date(`${a.dueDate}T${a.dueTime || '00:00'}`);
                    const dateB = new Date(`${b.dueDate}T${b.dueTime || '00:00'}`);
                    return dateA - dateB;
                  }).map(commitment => {
                    const date = new Date(commitment.dueDate + 'T00:00:00'); // Asegurar zona horaria local
                    const dayOfMonth = date.getDate();
                    const dayOfWeek = date.toLocaleString('es-ES', { weekday: 'short' }); // 'es-ES' para español
                    
                    return (
                      <div key={commitment.id} className="flex items-center p-2.5 rounded-lg hover:bg-opacity-10 transition-colors duration-150" style={{
                        backgroundColor: theme === THEMES.GOTHIC ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderLeft: `4px solid ${isOverdue(commitment) ? 'var(--color-error)' : 'var(--color-primary)'}` // Indicador visual
                      }}>
                        <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center mr-3.5" style={{ // Más grande y cuadrado
                          backgroundColor: theme === THEMES.GOTHIC ? '#333' : 'var(--color-primary-light)',
                          color: theme === THEMES.GOTHIC ? 'white' : 'var(--color-primary-dark)'
                        }}>
                          <div className="text-center leading-tight">
                            <div className="text-xs font-semibold uppercase">{dayOfWeek}</div>
                            <div className="text-xl font-bold">{dayOfMonth}</div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0"> {/* min-w-0 para truncar correctamente */}
                          <div className="font-medium truncate" title={commitment.reason}>{commitment.reason}</div>
                          <div className="flex space-x-3 text-xs opacity-70 mt-0.5">
                            <span>{commitment.dueTime || '--:--'}</span>
                            <span>{commitment.type === 'points' ? '🌟' : '⏱️'} {commitment.amount} {commitment.type === 'points' ? 'pts' : 'min'}</span>
                          </div>
                        </div>
                        
                        <span className="ml-2 text-xs px-2 py-1 rounded-full font-medium" style={{
                          backgroundColor: isOverdue(commitment) 
                            ? (theme === THEMES.GOTHIC ? 'rgba(153, 27, 27, 0.5)' :'rgba(239, 68, 68, 0.1)') 
                            : (theme === THEMES.GOTHIC ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.1)'),
                          color: isOverdue(commitment) 
                            ? (theme === THEMES.GOTHIC ? '#fca5a5' : 'rgb(220, 38, 38)') 
                            : (theme === THEMES.GOTHIC ? '#93c5fd' :'rgb(37, 99, 235)')
                        }}>
                          {isOverdue(commitment) ? 'VENCIDO' : getTimeRemaining(commitment)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 rounded-lg mt-6" style={{ 
        backgroundColor: theme === THEMES.GOTHIC ? '#292929' : (theme === THEMES.ARTNOUVEAU ? '#f1ece1' : '#f3f4f6'),
        borderLeft: '4px solid var(--color-primary)'
      }}>
        <h3 className="font-medium mb-2 text-base" style={{color: 'var(--color-text)'}}>
          Tips para compromisos efectivos:
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Establece compromisos realistas y alcanzables.</li>
          <li>Asigna penalizaciones proporcionales para mantenerte motivado.</li>
          <li>Usa el sistema como una herramienta de responsabilidad, no de castigo.</li>
          <li>Celebra cuando cumplas tus compromisos a tiempo.</li>
        </ul>
      </div>
    </section>
  );
};

export default PenaltySystem;