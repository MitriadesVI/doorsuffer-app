// src/features/goals/DailyGoals.jsx (versión optimizada)
import React, { useState } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const DailyGoals = ({ goals, onToggleGoal, onAddGoal, onDeleteGoal, notify }) => {
  const { theme } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Estados para el formulario (mantengo los originales para no romper la lógica)
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalRewardType, setNewGoalRewardType] = useState('socialTime');
  const [newGoalRewardAmount, setNewGoalRewardAmount] = useState('');
  const [newGoalDueTime, setNewGoalDueTime] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('once');
  const [selectedDays, setSelectedDays] = useState([false, false, false, false, false, false, false]);

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Categorías con mejora visual (íconos y colores)
  const categories = [
    { value: "", label: "Selecciona una categoría", icon: "📋" },
    { value: "Trabajo", label: "Trabajo", icon: "💼", color: "#3B82F6" },
    { value: "Salud Física", label: "Salud Física", icon: "🏋️", color: "#10B981" },
    { value: "Salud Mental", label: "Salud Mental", icon: "🧠", color: "#8B5CF6" },
    { value: "Finanzas", label: "Finanzas", icon: "💰", color: "#F59E0B" },
    { value: "Personal", label: "Personal", icon: "🌱", color: "#EC4899" },
    { value: "Habilidades", label: "Habilidades", icon: "📚", color: "#6366F1" }
  ];

  // Método para manejar la creación de una meta (mantengo la lógica original)
  const handleSubmit = (e) => {
    e.preventDefault();
      
    // Validar datos del formulario
    if (!newGoalText || !newGoalCategory || !newGoalRewardAmount) {
      if (notify) {
        notify('Por favor completa los campos requeridos: Descripción, Categoría y Recompensa.', 'error');
      } else {
        alert('Por favor completa los campos requeridos: Descripción, Categoría y Recompensa.');
      }
      return;
    }
      
    // Crear objeto de nueva meta
    const newGoal = {
      id: Date.now().toString(), // Asegurar ID único
      text: newGoalText,
      category: newGoalCategory,
      rewardType: newGoalRewardType,
      rewardAmount: parseInt(newGoalRewardAmount, 10),
      recurrenceType: recurrenceType,
      recurrenceDays: recurrenceType === 'custom' ? selectedDays : null,
      dueTime: newGoalDueTime || null,
      completed: false,
      createdAt: new Date().toISOString()
    };
      
    // Llamar a la función de añadir meta del componente padre
    onAddGoal(newGoal);
      
    // Resetear el formulario
    setNewGoalText('');
    setNewGoalCategory('');
    setNewGoalRewardType('socialTime');
    setNewGoalRewardAmount('');
    setNewGoalDueTime('');
    setRecurrenceType('once');
    setSelectedDays([false, false, false, false, false, false, false]);
      
    // Cerrar el formulario
    setShowAddForm(false);
  };

  // Verificar si una meta está vencida (mantengo la lógica original)
  const isOverdue = (goal) => {
    if (!goal.dueTime || goal.completed) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime > goal.dueTime;
  };

  // Obtener el color para la categoría (nueva función)
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.value === categoryName);
    return category?.color || "#6B7280";
  };
  
  // Obtener el icono para la categoría (nueva función)
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.value === categoryName);
    return category?.icon || "📋";
  };

  // Función para formatear hora en formato 12h
  const formatTime = (timeString) => {
    if (!timeString) return null;
    
    try {
      const [hours, minutes] = timeString.split(':');
      const formattedHours = parseInt(hours, 10);
      const ampm = formattedHours >= 12 ? 'PM' : 'AM';
      const displayHours = formattedHours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    } catch(e) {
      return timeString;
    }
  };

  return (
    <section className="mb-6" aria-labelledby="daily-goals-title">
      <div className="card p-6" style={{ 
        backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
        boxShadow: 'var(--box-shadow)',
        borderRadius: 'var(--border-radius)',
        borderColor: 'var(--color-secondary)',
        borderWidth: '1px'
      }}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="daily-goals-title" className="text-2xl font-semibold">Metas Diarias</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            aria-label={showAddForm ? "Cerrar formulario" : "Añadir meta"}
          >
            {showAddForm ? '×' : '+'}
          </button>
        </div>
        
        {/* Formulario para añadir meta - mejorado visualmente */}
        {showAddForm && (
          <form 
            className="mb-6 p-4 border rounded-lg"
            style={{
              borderColor: 'var(--color-secondary-accent)',
              backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : '#f9fafb'),
            }}
            onSubmit={handleSubmit}
          >
            <h3 className="text-lg font-medium mb-3">Nueva Meta</h3>
            
            {/* Descripción de la meta */}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-sm">Descripción</label>
              <input 
                type="text" 
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="w-full p-2 border rounded"
                style={{
                  borderColor: 'var(--color-secondary)',
                  backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                  color: 'var(--color-text)'
                }}
                placeholder="Ej: Hacer ejercicio durante 30 minutos"
                required
              />
            </div>
            
            {/* Fila para Categoría y Recompensa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Categoría */}
              <div>
                <label className="block mb-1 font-medium text-sm">Categoría</label>
                <select 
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: 'var(--color-secondary)',
                    backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                    color: 'var(--color-text)'
                  }}
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Grupo de Recompensa (tipo y cantidad) */}
              <div>
                <label className="block mb-1 font-medium text-sm">Recompensa</label>
                <div className="flex items-center space-x-2">
                  <select 
                    value={newGoalRewardType}
                    onChange={(e) => setNewGoalRewardType(e.target.value)}
                    className="flex-1 p-2 border rounded-l"
                    style={{
                      borderColor: 'var(--color-secondary)',
                      backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="socialTime">⏱️ Tiempo</option>
                    <option value="points">🌟 Puntos</option>
                  </select>
                  
                  <input 
                    type="number" 
                    value={newGoalRewardAmount}
                    onChange={(e) => setNewGoalRewardAmount(e.target.value)}
                    min="1"
                    max={newGoalRewardType === 'socialTime' ? '60' : '100'}
                    className="w-20 p-2 border rounded-r"
                    style={{
                      borderColor: 'var(--color-secondary)',
                      backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                      color: 'var(--color-text)'
                    }}
                    placeholder={newGoalRewardType === 'socialTime' ? '15' : '10'}
                    required
                  />
                </div>
                <p className="text-xs mt-1 opacity-70">
                  {newGoalRewardType === 'socialTime' ? 'Minutos a ganar' : 'Puntos a ganar'}
                </p>
              </div>
            </div>

            {/* Hora límite */}
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <label className="font-medium text-sm">Hora Límite (opcional)</label>
                <span className="ml-1 text-xs opacity-70">Si no se completa a tiempo, se marcará como vencida</span>
              </div>
              <input 
                type="time" 
                value={newGoalDueTime}
                onChange={(e) => setNewGoalDueTime(e.target.value)}
                className="w-full p-2 border rounded"
                style={{
                  borderColor: 'var(--color-secondary)',
                  backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            {/* Recurrencia */}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-sm">Recurrencia</label>
              <select 
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
                className="w-full p-2 border rounded"
                style={{
                  borderColor: 'var(--color-secondary)',
                  backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : '#f9fafb',
                  color: 'var(--color-text)'
                }}
              >
                <option value="once">Una vez (no repetir)</option>
                <option value="daily">Diariamente</option>
                <option value="weekdays">Lunes a Viernes</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            {/* Días específicos para recurrencia personalizada */}
            {recurrenceType === 'custom' && (
              <div className="mb-4 p-3 border rounded" style={{borderColor: 'var(--color-secondary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#333' : '#f3f4f6'}}>
                <label className="block mb-2 text-sm font-medium">Selecciona los días:</label>
                <div className="grid grid-cols-7 gap-1">
                  {daysOfWeek.map((day, index) => (
                    <label key={index} className="flex flex-col items-center p-2 rounded cursor-pointer hover:bg-opacity-10"
                      style={{
                        borderColor: selectedDays[index] ? 'var(--color-primary)' : 'transparent',
                        backgroundColor: selectedDays[index] ? (theme === THEMES.GOTHIC ? 'rgba(255,255,255,0.1)' : 'var(--color-primary-accent)') : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDays[index]}
                        onChange={() => {
                          const newSelectedDays = [...selectedDays];
                          newSelectedDays[index] = !newSelectedDays[index];
                          setSelectedDays(newSelectedDays);
                        }}
                        className="sr-only" // Ocultar checkbox pero mantener funcionalidad
                      />
                      <span className="text-sm font-medium">{day.charAt(0)}</span>
                      <span className={`mt-1 w-2 h-2 rounded-full ${selectedDays[index] ? 'opacity-100' : 'opacity-0'}`} 
                        style={{backgroundColor: 'var(--color-primary)'}}></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 mt-5">
              <button 
                type="submit"
                className="py-2 px-4 rounded font-medium flex-1"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Guardar Meta
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewGoalText('');
                  setNewGoalCategory('');
                  setNewGoalRewardType('socialTime');
                  setNewGoalRewardAmount('');
                  setNewGoalDueTime('');
                  setRecurrenceType('once');
                  setSelectedDays([false, false, false, false, false, false, false]);
                }}
                className="py-2 px-4 rounded font-medium"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text)'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        
        {/* Lista de metas - Rediseñada para mejor visualización */}
        <div className="space-y-3 mt-4">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg"
               style={{borderColor: 'var(--color-secondary-accent)', opacity: 0.7}}>
              <p className="text-center mb-2 text-sm">No tienes metas definidas para hoy.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Añadir mi primera meta
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const overdueStatus = isOverdue(goal);
              const categoryColor = getCategoryColor(goal.category);
              const categoryIcon = getCategoryIcon(goal.category);
              
              return (
                <div 
                  key={goal.id} 
                  className="p-3 border rounded-lg transition-all"
                  style={{
                    borderColor: goal.completed 
                      ? 'var(--color-success)' 
                      : (overdueStatus ? 'var(--color-accent)' : 'var(--color-secondary)'),
                    backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#fcf9f2' : 'white'),
                    opacity: goal.completed ? 0.8 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-start">
                    {/* Checkbox personalizado */}
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`goal-${goal.id}`}
                          checked={goal.completed}
                          onChange={() => onToggleGoal(goal.id)}
                          className="sr-only" // Ocultar el checkbox nativo pero mantener funcionalidad
                        />
                        <label
                          htmlFor={`goal-${goal.id}`}
                          className="flex items-center justify-center w-6 h-6 rounded-full cursor-pointer"
                          style={{
                            backgroundColor: goal.completed ? categoryColor : 'transparent',
                            borderWidth: '2px',
                            borderColor: categoryColor
                          }}
                        >
                          {goal.completed && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    {/* Contenido de la meta */}
                    <div className="flex-1 min-w-0">
                      {/* Etiquetas de categoría, recompensa, tiempo */}
                      <div className="flex flex-wrap mb-1 gap-2">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryColor}20`,
                            color: goal.completed ? 'var(--color-text-secondary)' : categoryColor,
                            borderWidth: '1px',
                            borderColor: `${categoryColor}40`
                          }}
                        >
                          <span className="mr-1">{categoryIcon}</span>
                          {goal.category}
                        </span>
                        
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: goal.completed ? 'rgba(107, 114, 128, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                            color: goal.completed ? 'var(--color-text-secondary)' : 'var(--color-primary)'
                          }}
                        >
                          {goal.rewardType === 'socialTime' ? '⏱️' : '🌟'} +{goal.rewardAmount} {goal.rewardType === 'socialTime' ? 'min' : 'pts'}
                        </span>
                        
                        {goal.dueTime && (
                          <span 
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-auto ${
                              overdueStatus && !goal.completed ? 'bg-red-100 text-red-700 border border-red-300' : 
                              goal.completed ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            <span className="mr-1">⏰</span>
                            {formatTime(goal.dueTime)}
                            {overdueStatus && !goal.completed && " ¡VENCIDO!"}
                          </span>
                        )}
                      </div>
                      
                      {/* Texto de la meta */}
                      <p 
                        className={`text-sm sm:text-base ${goal.completed ? 'line-through' : ''}`}
                        style={{
                          color: goal.completed ? 'var(--color-text-secondary)' : 'var(--color-text)'
                        }}
                      >
                        {goal.text}
                      </p>
                      
                      {/* Recurrencia */}
                      {goal.recurrenceType && goal.recurrenceType !== 'once' && (
                        <div className="mt-1 text-xs opacity-70 flex items-center">
                          <span className="mr-1">🔄</span>
                          <span>
                            {goal.recurrenceType === 'daily' 
                              ? 'Diario' 
                              : goal.recurrenceType === 'weekdays' 
                                ? 'L-V' 
                                : goal.recurrenceType === 'custom' 
                                  ? (goal.recurrenceDays && goal.recurrenceDays.some(d => d) ? daysOfWeek.filter((_day, i) => goal.recurrenceDays[i]).map(d => d.charAt(0)).join(', ') : 'Personalizado') 
                                  : goal.recurrenceType
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón eliminar */}
                    <button 
                      onClick={() => onDeleteGoal(goal.id)} 
                      className="ml-2 p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Eliminar meta"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default DailyGoals;