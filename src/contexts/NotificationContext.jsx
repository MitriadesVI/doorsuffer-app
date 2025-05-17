// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');
  
  // Solicitar permiso para notificaciones del navegador al cargar
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permiso explícitamente
  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  // Añadir una notificación interna
  const addNotification = (message, type = 'info', autoClose = true) => {
    const id = Date.now().toString(); // Usar timestamp como ID en lugar de UUID
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-cerrar notificación después de 5 segundos si es necesario
    if (autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
    
    return id;
  };

  // Eliminar una notificación específica
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Enviar notificación del navegador
  const sendBrowserNotification = (title, options = {}) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo.png', // Asegúrate de tener un logo en la carpeta public
        ...options
      });
      
      notification.onclick = function() {
        window.focus();
        this.close();
      };
      
      return true;
    }
    return false;
  };

  // Enviar notificación (interna + navegador si está permitido)
  const notify = (message, options = {}) => {
    const { 
      type = 'info',
      browserNotification = false,
      title = 'Doorsuffer',
      autoClose = true
    } = options;
    
    // Siempre añadir notificación interna
    const id = addNotification(message, type, autoClose);
    
    // Enviar notificación del navegador si está solicitado y permitido
    if (browserNotification && permission === 'granted') {
      sendBrowserNotification(title, { body: message });
    }
    
    return id;
  };

  const value = {
    notifications,
    permission,
    requestPermission,
    notify,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};