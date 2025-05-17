// src/features/social/SocialMediaTimeDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const SocialMediaTimeDisplay = ({ timeMinutes, points }) => {
  const { theme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [timeHistory, setTimeHistory] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_timeHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('doorsuffer_timeHistory', JSON.stringify(timeHistory));
  }, [timeHistory]);
  
  // Agregar entrada al historial cuando cambie el tiempo disponible
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastEntry = timeHistory[timeHistory.length - 1];
    
    // Solo actualizar el historial si cambió el tiempo o es un nuevo día
    if (!lastEntry || lastEntry.date !== today || lastEntry.timeMinutes !== timeMinutes) {
      setTimeHistory(prev => [
        ...prev,
        {
          date: today,
          timeMinutes: timeMinutes,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [timeMinutes, timeHistory]);
  
  // Formatear tiempo en horas y minutos
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutos`;
  };
  
  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tiempo Disponible</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm px-3 py-1 rounded"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text)',
            opacity: 0.8
          }}
        >
          {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
        </button>
      </div>
      
      <div className="flex justify-center items-center space-x-6 py-4">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatTime(timeMinutes)}
          </div>
          <p className="text-sm opacity-80 mt-1">Tiempo para Redes Sociales</p>
        </div>
        
        {points !== undefined && (
          <div className="text-center">
            <div className="text-3xl font-bold flex items-center justify-center">
              <span style={{ color: 'var(--color-success)' }}>{points}</span>
              <span className="ml-1">🏆</span>
            </div>
            <p className="text-sm opacity-80 mt-1">Puntos Acumulados</p>
          </div>
        )}
      </div>
      
      <p className="text-sm my-3 opacity-80">
        Gana tiempo completando tus metas diarias. Recuerda usarlo con moderación para mantener tu productividad.
      </p>
      
      {/* Mostrar historial de tiempo si está activado */}
      {showHistory && timeHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Historial de Tiempo</h3>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-secondary)' }}>
                  <th className="py-2 text-left">Fecha</th>
                  <th className="py-2 text-right">Tiempo Disponible</th>
                </tr>
              </thead>
              <tbody>
                {timeHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <tr 
                      key={index} 
                      className="border-b" 
                      style={{ borderColor: 'var(--color-secondary)', opacity: 0.8 }}
                    >
                      <td className="py-2">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2 text-right font-medium" style={{ color: 'var(--color-primary)' }}>
                        {formatTime(entry.timeMinutes)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Sugerencias de uso */}
      <div className="mt-4 p-3 rounded-lg" style={{ 
        backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : (theme === THEMES.ARTNOUVEAU ? '#e7d8c3' : '#f3f4f6'),
        opacity: 0.8
      }}>
        <h3 className="font-medium mb-2 text-sm">Consejos para el uso saludable de redes sociales:</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Establece límites diarios para evitar la procrastinación.</li>
          <li>Usa temporizadores para controlar tu tiempo en aplicaciones.</li>
          <li>Desactiva las notificaciones cuando necesites concentrarte.</li>
          <li>Comienza tu día completando metas, no revisando redes.</li>
        </ul>
      </div>
    </section>
  );
};

export default SocialMediaTimeDisplay;