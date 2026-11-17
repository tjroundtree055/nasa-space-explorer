'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let installEvent;
  let usingSavedData = false;
  const updateConnection = () => {
    const offline = !navigator.onLine;
    byId('offline-status').hidden = !offline && !usingSavedData;
    byId('offline-status').textContent = offline
      ? 'You are offline. Previously loaded dates and images are available; new dates need a connection.'
      : 'NASA is unavailable right now. Showing previously saved entries where available.';
  };
  updateConnection();
  window.addEventListener('offline', updateConnection);
  window.addEventListener('online', () => { usingSavedData = false; updateConnection(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'NASA_CACHE_FALLBACK') { usingSavedData = true; updateConnection(); }
  });
  byId('install-panel').hidden = standalone();
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installEvent = event;
    byId('install-help').hidden = true;
    byId('install-panel').hidden = standalone();
  });
  byId('install-app').addEventListener('click', async () => {
    const help = byId('install-help');
    if (installEvent) {
      try {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;
        help.textContent = choice.outcome === 'accepted' ? 'Installation accepted. Open Space Explorer from your home screen.' : 'Installation dismissed. You can install later from the browser menu.';
      } catch { help.textContent = 'Use your browser menu to install Space Explorer.'; }
      installEvent = null;
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      help.textContent = 'On iPhone or iPad, open this page in Safari, tap Share, then Add to Home Screen and Add. Launch the new Space Explorer icon.';
    } else {
      help.textContent = 'Open the browser menu and choose Install app or Add to Home screen. If it is not offered yet, reload after the first visit. Installation availability depends on your browser.';
    }
    help.hidden = false;
  });
  window.addEventListener('appinstalled', () => { installEvent = null; byId('install-panel').hidden = true; });
  window.pwaReady = (async () => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return null;
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      // Wait briefly for first-visit control so initial NASA requests are cached.
      if (!navigator.serviceWorker.controller) await new Promise(resolve => {
        const done = () => { clearTimeout(timeout); navigator.serviceWorker.removeEventListener('controllerchange', done); resolve(); };
        const timeout = setTimeout(done, 4000);
        navigator.serviceWorker.addEventListener('controllerchange', done);
        if (navigator.serviceWorker.controller) done();
      });
      return registration;
    } catch {
      byId('install-help').textContent = 'Offline setup could not finish. Stay online and reload to try again.';
      byId('install-help').hidden = false;
      return null;
    }
  })();
  const notificationButton = byId('enable-notifications');
  const notificationStatus = byId('notification-status');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    notificationButton.disabled = true;
    notificationStatus.textContent = 'Notifications are not supported here. On iPhone, try opening the installed home-screen app.';
  }
  notificationButton.addEventListener('click', async () => {
    notificationButton.disabled = true;
    try {
      // Request immediately inside the user's click, never on page load.
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission === 'granted') {
        const registration = await window.pwaReady;
        if (!registration?.active) throw new Error('Offline setup is still starting. Reload and try again.');
        await registration.showNotification('Space Explorer is ready', {
          body: 'Notifications are enabled. Come explore your next space discovery.',
          icon: new URL('./icons/icon-192.png', location.href).href,
          tag: 'space-explorer-test'
        });
        notificationStatus.textContent = 'Notifications allowed. A test notification was sent; no automatic alerts are scheduled.';
        notificationButton.textContent = 'Send test notification';
      } else {
        notificationStatus.textContent = permission === 'denied'
          ? 'Notifications are blocked. You can change this in your browser or device settings.'
          : 'Permission was not granted. You can try again when you are ready.';
      }
    } catch (error) { notificationStatus.textContent = error.message || 'Notifications could not be enabled on this device.'; }
    finally { notificationButton.disabled = false; }
  });
})();
