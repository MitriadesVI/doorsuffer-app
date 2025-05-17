// src/features/notifications/NotificationManager.jsx
import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationManager = () => {
  const { notifications } = useNotifications();

  const containerStyle = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
    width: '20rem',
    maxWidth: 'calc(100vw - 2rem)',
  };

  // Si no hay notificaciones, no renderizamos nada
  if (notifications.length === 0) return null;

  return (
    <div style={containerStyle}>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}
    </div>
  );
};

export default NotificationManager;