// public/service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  return self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  const { notification } = event;
  notification.close();
  event.waitUntil(clients.openWindow('/'));
});