const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

const services = [
  { name: 'FastCount', url: 'https://shadow-waiting-sombrero.glitch.me/' },
  { name: 'API', url: 'https://ests.sctools.org/api/get/UCX6OQ3DkcsbYNE6H8uQQuVA' },
  { name: 'API Search', url: 'https://mixerno.space/api/youtube-channel-counter/search/mrbeast' }
];

const serviceStatus = {}; // Exemple: { "FastCount": { status: "UP", uptime: 97.23 } }

services.forEach(service => {
  serviceStatus[service.name] = {
    status: 'UNKNOWN',
    uptime: 100.0
  };
});

async function checkServices() {
  for (const service of services) {
    try {
      const response = await fetch(service.url, { timeout: 3000 });
      const isUp = response.ok;
      const previousUptime = serviceStatus[service.name].uptime;

      // Calcul de l’uptime :
      if (isUp) {
        serviceStatus[service.name].uptime = Math.min(previousUptime + 0.2, 100);
        serviceStatus[service.name].status = 'UP';
      } else {
        serviceStatus[service.name].uptime = Math.max(previousUptime - 5, 0);
        serviceStatus[service.name].status = 'DOWN';
      }
    } catch (err) {
      serviceStatus[service.name].uptime = Math.max(serviceStatus[service.name].uptime - 5, 0);
      serviceStatus[service.name].status = 'DOWN';
    }
  }
}

// Lancer la vérification toutes les 10 secondes
setInterval(checkServices, 3000);
checkServices(); // première vérification immédiate

app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  const result = services.map(service => ({
    name: service.name,
    status: serviceStatus[service.name].status,
    uptime: serviceStatus[service.name].uptime.toFixed(2)
  }));
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
