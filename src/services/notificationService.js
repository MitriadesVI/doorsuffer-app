// src/services/notificationService.js
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado con éxito:', registration);
      return registration;
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      return null;
    }
  }
  return null;
};

const scheduleGoalReminder = (goal, settings) => {
  if (!settings.goalReminders || !("Notification" in window) || Notification.permission !== 'granted') {
    return;
  }
  
  // Programar recordatorio para dentro de X minutos (simula un recordatorio para una meta)
  const reminderTime = 5 * 60 * 1000; // 5 minutos en milisegundos
  
  setTimeout(() => {
    new Notification('Recordatorio de meta', {
      body: `No olvides completar: ${goal.text}`,
      icon: '/logo.png'
    });
  }, reminderTime);
};

const notifySocialMediaTime = (minutes, settings) => {
  if (!settings.socialMediaTime || !("Notification" in window) || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification('Tiempo para redes sociales', {
    body: `Tienes ${minutes} minutos disponibles para redes sociales.`,
    icon: '/logo.png'
  });
};

const notificationService = {
  registerServiceWorker,
  scheduleGoalReminder,
  notifySocialMediaTime
};

export default notificationService;