// src/features/pomodoro/PomodoroTimer.jsx
import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const PomodoroTimer = ({ onComplete }) => {
  const { theme } = useTheme();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [cycles, setCycles] = useState(0);

  // Configuración de tiempo para cada modo
  const timeSettings = {
    work: 25,
    shortBreak: 5,
    longBreak: 15
  };

  // Formatear tiempo
  const formatTime = (min, sec) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Efecto para manejar el temporizador
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Tiempo completado
          clearInterval(interval);
          
          // Notificar al usuario
          const notification = new Audio('/notification.mp3');
          notification.play();
          
          // Cambiar de modo
          if (mode === 'work') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            
            // Después de 4 ciclos, tomar un descanso largo
            if (newCycles % 4 === 0) {
              setMode('longBreak');
              setMinutes(timeSettings.longBreak);
            } else {
              setMode('shortBreak');
              setMinutes(timeSettings.shortBreak);
            }
            
            // Notificar al completar un ciclo de trabajo
            if (onComplete) {
              onComplete('work');
            }
          } else {
            // Volver al modo trabajo después de un descanso
            setMode('work');
            setMinutes(timeSettings.work);
            
            // Notificar al completar un descanso
            if (onComplete) {
              onComplete(mode);
            }
          }
          
          setSeconds(0);
          setIsActive(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, cycles, onComplete]);

  // Iniciar o pausar el temporizador
  const toggle = () => {
    setIsActive(!isActive);
  };

  // Resetear el temporizador
  const reset = () => {
    setIsActive(false);
    setMinutes(timeSettings[mode]);
    setSeconds(0);
  };

  // Cambiar de modo manualmente
  const changeMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(timeSettings[newMode]);
    setSeconds(0);
  };

  // Estilos según el tema y modo
  const getModeColor = () => {
    if (mode === 'work') return '#e74c3c';
    if (mode === 'shortBreak') return '#3498db';
    return '#9b59b6';
  };

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <h2 className="text-2xl font-semibold mb-3">Temporizador Pomodoro</h2>
      
      <div className="text-center">
        <div className="flex justify-center space-x-2 mb-4">
          <button 
            onClick={() => changeMode('work')}
            className={`px-3 py-1 rounded-lg text-white ${mode === 'work' ? 'opacity-100' : 'opacity-60'}`}
            style={{ backgroundColor: '#e74c3c' }}
          >
            Trabajo
          </button>
          <button 
            onClick={() => changeMode('shortBreak')}
            className={`px-3 py-1 rounded-lg text-white ${mode === 'shortBreak' ? 'opacity-100' : 'opacity-60'}`}
            style={{ backgroundColor: '#3498db' }}
          >
            Descanso Corto
          </button>
          <button 
            onClick={() => changeMode('longBreak')}
            className={`px-3 py-1 rounded-lg text-white ${mode === 'longBreak' ? 'opacity-100' : 'opacity-60'}`}
            style={{ backgroundColor: '#9b59b6' }}
          >
            Descanso Largo
          </button>
        </div>
        
        <div 
          className="text-7xl font-bold mb-6 mx-auto rounded-full w-56 h-56 flex items-center justify-center"
          style={{ 
            color: getModeColor(),
            borderWidth: '4px',
            borderColor: getModeColor()
          }}
        >
          {formatTime(minutes, seconds)}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={toggle}
            className="py-2 px-8 rounded-lg text-white text-lg"
            style={{ backgroundColor: getModeColor() }}
          >
            {isActive ? 'Pausar' : 'Iniciar'}
          </button>
          <button 
            onClick={reset}
            className="py-2 px-6 rounded-lg text-gray-700 border border-gray-300"
          >
            Reiniciar
          </button>
        </div>
        
        <div className="mt-4 text-sm opacity-70">
          Ciclos completados: {Math.floor(cycles / 4)}
          <span className="ml-2 text-xs">({cycles} pomodoros)</span>
        </div>
      </div>
    </section>
  );
};

export default PomodoroTimer;