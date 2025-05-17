// src/features/savings/SavingsGoals.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SavingsGoals = () => {
  const { theme } = useTheme();
  
  // Estado para los objetivos de ahorro
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const savedGoals = localStorage.getItem('doorsuffer_savingsGoals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  // Estado para el formulario
  const [showForm, setShowForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  
  // Guardar objetivos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('doorsuffer_savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);
  
  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newGoalName.trim() === '' || !newGoalAmount || !newGoalCurrent) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    // Crear nuevo objetivo
    const newGoal = {
      id: Date.now(),
      name: newGoalName,
      targetAmount: parseFloat(newGoalAmount),
      currentAmount: parseFloat(newGoalCurrent),
      deadline: newGoalDeadline || null,
      createdAt: new Date().toISOString()
    };
    
    // Añadir a la lista
    setSavingsGoals(prev => [...prev, newGoal]);
    
    // Resetear formulario
    setNewGoalName('');
    setNewGoalAmount('');
    setNewGoalCurrent('');
    setNewGoalDeadline('');
    setShowForm(false);
  };
  
  // Actualizar el progreso de un objetivo
  const updateProgress = (id, newAmount) => {
    setSavingsGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, currentAmount: parseFloat(newAmount) } 
          : goal
      )
    );
  };
  
  // Eliminar un objetivo
  const deleteGoal = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este objetivo de ahorro?')) {
      setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
    }
  };

  return (
    <section className={`card p-6`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Objetivos de Ahorro</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-icon"
          aria-label="Añadir objetivo"
        >
          {showForm ? 'Cancelar' : '+'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
          <div className="mb-3">
            <label htmlFor="newGoalName" className="block mb-1 font-medium">Nombre del Objetivo</label>
            <input
              type="text"
              id="newGoalName"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ej: Nuevo laptop, Vacaciones, etc."
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="newGoalAmount" className="block mb-1 font-medium">Cantidad Objetivo</label>
            <input
              type="number"
              id="newGoalAmount"
              value={newGoalAmount}
              onChange={(e) => setNewGoalAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ej: 1000"
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="newGoalCurrent" className="block mb-1 font-medium">Cantidad Actual</label>
            <input
              type="number"
              id="newGoalCurrent"
              value={newGoalCurrent}
              onChange={(e) => setNewGoalCurrent(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ej: 250"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="newGoalDeadline" className="block mb-1 font-medium">Fecha Límite (opcional)</label>
            <input
              type="date"
              id="newGoalDeadline"
              value={newGoalDeadline}
              onChange={(e) => setNewGoalDeadline(e.target.value)}
              className="w-full p-2 border rounded"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <button type="submit" className="btn w-full">
            Añadir Objetivo de Ahorro
          </button>
        </form>
      )}
      
      {/* Lista de objetivos de ahorro */}
      <div className="space-y-4">
        {savingsGoals.length > 0 ? (
          savingsGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            
            return (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 p-1.5 hover:bg-red-100 rounded-full"
                    aria-label="Eliminar objetivo"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex justify-between text-sm mb-2">
                  <span>Meta: {goal.targetAmount.toLocaleString()}</span>
                  {goal.deadline && (
                    <span>Fecha límite: {new Date(goal.deadline).toLocaleDateString()}</span>
                  )}
                </div>
                
                {/* Barra de progreso */}
                <div className="mb-2">
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-opacity-20" style={{backgroundColor: 'var(--color-secondary)'}}>
                    <div 
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-primary)'
                      }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Actual: {goal.currentAmount.toLocaleString()}</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                </div>
                
                {/* Actualizar progreso */}
                {!isCompleted && (
                  <div className="mt-3 flex">
                    <input 
                      type="number"
                      className="flex-1 p-1.5 border rounded-l-lg"
                      placeholder="Actualizar monto"
                      min={goal.currentAmount}
                      max={goal.targetAmount}
                      defaultValue={goal.currentAmount}
                      onChange={(e) => {
                        // Solo guarda el valor cuando el usuario termina de editar
                        if (e.target.value && parseFloat(e.target.value) !== goal.currentAmount) {
                          e.target.dataset.pendingValue = e.target.value;
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.dataset.pendingValue) {
                          updateProgress(goal.id, e.target.dataset.pendingValue);
                          delete e.target.dataset.pendingValue;
                        }
                      }}
                    />
                    <button 
                      className="bg-green-500 text-white p-1.5 rounded-r-lg hover:bg-green-600 transition-colors"
                      onClick={(e) => {
                        // Busca el input hermano
                        const input = e.currentTarget.previousElementSibling;
                        if (input && input.value && parseFloat(input.value) !== goal.currentAmount) {
                          updateProgress(goal.id, input.value);
                        }
                      }}
                    >
                      Actualizar
                    </button>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-2 p-2 bg-green-100 rounded-lg text-green-800 text-sm text-center">
                    ¡Objetivo completado! 🎉
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center py-4 italic opacity-70">
            No tienes objetivos de ahorro definidos. ¡Añade uno!
          </p>
        )}
      </div>
    </section>
  );
};

export default SavingsGoals;