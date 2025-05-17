// src/features/notifications/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const NotificationSettings = () => {
  const { permission, requestPermission, notify } = useNotifications();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    goalReminders: true,
    socialMediaTime: true,
    dailyWord: true,
    metricUpdates: false,
  });

  // Cargar configuración de localStorage al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('doorsuffer_notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('doorsuffer_notificationSettings', JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (setting) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      };
      return newSettings;
    });
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      notify('¡Notificaciones activadas correctamente!', { 
        type: 'success',
        browserNotification: true,
        title: 'Doorsuffer - Notificaciones'
      });
    }
  };

  const toggleStyles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '3rem',
      height: '1.5rem',
    },
    checkbox: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    slider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      transition: '0.4s',
      borderRadius: '1.5rem',
    },
    sliderChecked: {
      backgroundColor: 'var(--color-primary)',
    },
    sliderBefore: {
      position: 'absolute',
      content: '""',
      height: '1.1rem',
      width: '1.1rem',
      left: '0.2rem',
      bottom: '0.2rem',
      backgroundColor: 'white',
      transition: '0.4s',
      borderRadius: '50%',
    },
    sliderBeforeChecked: {
      transform: 'translateX(1.5rem)',
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-2xl font-semibold mb-4">Configuración de Notificaciones</h3>
      
      {permission !== 'granted' && (
        <div className="mb-6">
          <p className="mb-3">Para recibir notificaciones cuando la app no esté visible, necesitas dar permiso.</p>
          <button 
            className="btn"
            onClick={handleRequestPermission}
          >
            Activar Notificaciones
          </button>
        </div>
      )}
      
      <div className="space-y-3">
        <div style={toggleStyles.container}>
          <span>Recordatorios de metas</span>
          <label style={toggleStyles.toggle}>
            <input 
              type="checkbox" 
              checked={settings.goalReminders} 
              onChange={() => handleToggle('goalReminders')}
              style={toggleStyles.checkbox}
            />
            <span 
              className="toggle-slider"
              style={{
                ...toggleStyles.slider,
                backgroundColor: settings.goalReminders ? 'var(--color-primary)' : '#ccc'
              }}
            >
              <span 
                className="toggle-slider-before" 
                style={{
                  ...toggleStyles.sliderBefore,
                  transform: settings.goalReminders ? 'translateX(1.5rem)' : 'none'
                }}
              ></span>
            </span>
          </label>
        </div>
        
        <div style={toggleStyles.container}>
          <span>Tiempo de redes sociales</span>
          <label style={toggleStyles.toggle}>
            <input 
              type="checkbox" 
              checked={settings.socialMediaTime} 
              onChange={() => handleToggle('socialMediaTime')}
              style={toggleStyles.checkbox}
            />
            <span 
              className="toggle-slider"
              style={{
                ...toggleStyles.slider,
                backgroundColor: settings.socialMediaTime ? 'var(--color-primary)' : '#ccc'
              }}
            >
              <span 
                className="toggle-slider-before" 
                style={{
                  ...toggleStyles.sliderBefore,
                  transform: settings.socialMediaTime ? 'translateX(1.5rem)' : 'none'
                }}
              ></span>
            </span>
          </label>
        </div>
        
        <div style={toggleStyles.container}>
          <span>Palabra del día</span>
          <label style={toggleStyles.toggle}>
            <input 
              type="checkbox" 
              checked={settings.dailyWord} 
              onChange={() => handleToggle('dailyWord')}
              style={toggleStyles.checkbox}
            />
            <span 
              className="toggle-slider"
              style={{
                ...toggleStyles.slider,
                backgroundColor: settings.dailyWord ? 'var(--color-primary)' : '#ccc'
              }}
            >
              <span 
                className="toggle-slider-before" 
                style={{
                  ...toggleStyles.sliderBefore,
                  transform: settings.dailyWord ? 'translateX(1.5rem)' : 'none'
                }}
              ></span>
            </span>
          </label>
        </div>
        
        <div style={toggleStyles.container}>
          <span>Actualizaciones de métricas</span>
          <label style={toggleStyles.toggle}>
            <input 
              type="checkbox" 
              checked={settings.metricUpdates} 
              onChange={() => handleToggle('metricUpdates')}
              style={toggleStyles.checkbox}
            />
            <span 
              className="toggle-slider"
              style={{
                ...toggleStyles.slider,
                backgroundColor: settings.metricUpdates ? 'var(--color-primary)' : '#ccc'
              }}
            >
              <span 
                className="toggle-slider-before" 
                style={{
                  ...toggleStyles.sliderBefore,
                  transform: settings.metricUpdates ? 'translateX(1.5rem)' : 'none'
                }}
              ></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;